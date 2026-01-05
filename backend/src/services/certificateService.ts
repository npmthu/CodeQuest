import { supabaseAdmin } from "../config/database";
import { mailService } from "./mailService";

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  serial_number: string;
  certificate_url?: string;
  issued_at: string;
}

export interface CertificateWithDetails extends Certificate {
  user_name: string;
  course_title: string;
}

/**
 * Generate a unique serial number for a certificate
 * Format: CQ-{YYYY}-{COURSE_SHORT}-{RANDOM}
 */
function generateSerialNumber(courseTitle: string): string {
  const year = new Date().getFullYear();
  // Create a short code from course title (first letters of words, max 4 chars)
  const courseShort = courseTitle
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 4);
  // Random alphanumeric string (6 characters)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CQ-${year}-${courseShort}-${random}`;
}

/**
 * Get a certificate by its ID
 */
export async function getCertificateById(
  certificateId: string
): Promise<CertificateWithDetails | null> {
  const { data, error } = await supabaseAdmin
    .from("certificates")
    .select(
      `
      *,
      user:users(id, display_name, email),
      course:courses(title)
    `
    )
    .eq("id", certificateId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching certificate:", error);
    throw error;
  }

  if (!data) return null;

  // Map to CertificateWithDetails
  return {
    ...data,
    user_name:
      (data.user as any)?.display_name ||
      (data.user as any)?.email ||
      "Unknown User",
    course_title: (data.course as any)?.title || "Unknown Course",
  };
}

/**
 * Get a user's certificate for a specific course
 */
export async function getUserCourseCertificate(
  userId: string,
  courseId: string
): Promise<CertificateWithDetails | null> {
  const { data, error } = await supabaseAdmin
    .from("certificates")
    .select(
      `
      *,
      user:users(id, display_name, email),
      course:courses(title)
    `
    )
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching user course certificate:", error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    user_name:
      (data.user as any)?.display_name ||
      (data.user as any)?.email ||
      "Unknown User",
    course_title: (data.course as any)?.title || "Unknown Course",
  };
}

/**
 * Check if a user has completed all lessons in a course
 */
export async function checkCourseCompletion(
  userId: string,
  courseId: string
): Promise<{
  isCompleted: boolean;
  totalLessons: number;
  completedLessons: number;
}> {
  // Get all topics for the course
  const { data: topics, error: topicsError } = await supabaseAdmin
    .from("topics")
    .select("id")
    .eq("course_id", courseId);

  if (topicsError) throw topicsError;
  if (!topics || topics.length === 0) {
    return { isCompleted: false, totalLessons: 0, completedLessons: 0 };
  }

  const topicIds = topics.map((t) => t.id);

  // Get all published lessons for these topics
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from("lessons")
    .select("id")
    .in("topic_id", topicIds)
    .eq("is_published", true);

  if (lessonsError) throw lessonsError;
  if (!lessons || lessons.length === 0) {
    return { isCompleted: false, totalLessons: 0, completedLessons: 0 };
  }

  const lessonIds = lessons.map((l) => l.id);

  // Get completed lessons for this user
  const { data: completions, error: completionsError } = await supabaseAdmin
    .from("lesson_completions")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .not("completed_at", "is", null);

  if (completionsError) throw completionsError;

  const completedLessons = completions?.length || 0;
  const totalLessons = lessons.length;

  return {
    isCompleted: completedLessons === totalLessons && totalLessons > 0,
    totalLessons,
    completedLessons,
  };
}

/**
 * Create a new certificate for a user who completed a course
 */
export async function createCertificate(
  userId: string,
  courseId: string
): Promise<CertificateWithDetails> {
  // First, verify the user has actually completed the course
  const completion = await checkCourseCompletion(userId, courseId);
  if (!completion.isCompleted) {
    throw new Error(
      `Course not completed. Progress: ${completion.completedLessons}/${completion.totalLessons} lessons`
    );
  }

  // Check if certificate already exists
  const existing = await getUserCourseCertificate(userId, courseId);
  if (existing) {
    throw new Error("Certificate already exists for this course");
  }

  // Get course title for serial number generation
  const { data: course, error: courseError } = await supabaseAdmin
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    throw new Error("Course not found");
  }

  // Generate unique serial number
  let serialNumber = generateSerialNumber(course.title);

  // Ensure uniqueness (retry if collision)
  let attempts = 0;
  while (attempts < 5) {
    const { data: existingSerial } = await supabaseAdmin
      .from("certificates")
      .select("id")
      .eq("serial_number", serialNumber)
      .single();

    if (!existingSerial) break;

    serialNumber = generateSerialNumber(course.title);
    attempts++;
  }

  // Insert the certificate
  const { data: certificate, error: insertError } = await supabaseAdmin
    .from("certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      serial_number: serialNumber,
      issued_at: new Date().toISOString(),
    })
    .select(
      `
      *,
      user:users(id, display_name, email),
      course:courses(title)
    `
    )
    .single();

  if (insertError) {
    console.error("Error creating certificate:", insertError);
    throw insertError;
  }

  const certificateWithDetails: CertificateWithDetails = {
    ...certificate,
    user_name:
      (certificate.user as any)?.display_name ||
      (certificate.user as any)?.email ||
      "Unknown User",
    course_title: (certificate.course as any)?.title || "Unknown Course",
  };

  // Send congratulation email asynchronously (don't block certificate creation)
  const userEmail = (certificate.user as any)?.email;
  if (userEmail) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const certificateLink = `${frontendUrl}/certificates/${certificate.id}`;

    mailService
      .sendCourseCompletionEmail({
        to: userEmail,
        userName: certificateWithDetails.user_name,
        courseName: certificateWithDetails.course_title,
        certificateSerial: serialNumber,
        certificateLink,
      })
      .then((result) => {
        if (result.success) {
          console.log(
            `📧 Certificate email sent to ${userEmail} for course: ${certificateWithDetails.course_title}`
          );
        } else {
          console.error(`📧 Failed to send certificate email to ${userEmail}`);
        }
      })
      .catch((err) => {
        console.error("Error sending certificate email:", err);
      });
  }

  return certificateWithDetails;
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(
  userId: string
): Promise<CertificateWithDetails[]> {
  const { data, error } = await supabaseAdmin
    .from("certificates")
    .select(
      `
      *,
      user:users(id, display_name, email),
      course:courses(title)
    `
    )
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("Error fetching user certificates:", error);
    throw error;
  }

  return (data || []).map((cert) => ({
    ...cert,
    user_name:
      (cert.user as any)?.display_name ||
      (cert.user as any)?.email ||
      "Unknown User",
    course_title: (cert.course as any)?.title || "Unknown Course",
  }));
}
