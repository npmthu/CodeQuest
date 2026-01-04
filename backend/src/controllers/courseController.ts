import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";
import * as lessonService from "../services/lessonService";

const slugifyLocal = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/**
 * List all courses
 * GET /api/courses
 */
export async function listCoursesHandler(req: Request, res: Response) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }

    // Get topic count for each course
    const enrichedCourses = await Promise.all(
      (courses || []).map(async (course: any) => {
        const { count } = await supabaseAdmin
          .from("topics")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id);

        return {
          ...course,
          topic_count: count || 0,
        };
      })
    );

    return res.json({ success: true, data: enrichedCourses });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get single course by ID
 * GET /api/courses/:id
 */
export async function getCourseHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;

    const { data: course, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ success: false, error: "Course not found" });
      }
      throw error;
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (user) {
      const { data: enrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .single();

      isEnrolled = !!enrollment;
    }

    // Only return topics if user is enrolled
    let topics = [];
    if (isEnrolled) {
      const { data: topicsData } = await supabaseAdmin
        .from("topics")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at", { ascending: true });

      topics = topicsData || [];
    }

    return res.json({
      success: true,
      data: {
        ...course,
        topics,
        isEnrolled,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get course progress for authenticated user
 * GET /api/courses/:id/progress
 */
export async function getCourseProgressHandler(
  req: AuthRequest,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const courseId = req.params.id;
    const stats = await lessonService.getCourseCompletionStats(
      user.id,
      courseId
    );

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create a course
 * POST /api/courses
 */
export async function createCourseHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    // basic role gate; adjust as needed
    if (user.role !== "instructor" && user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { title, description, category, level, thumbnail_url, is_published } =
      req.body || {};

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    const slug = slugifyLocal(title);

    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        title,
        description,
        difficulty: level,
        thumbnail_url,
        is_published: !!is_published,
        slug,
      })
      .select()
      .single();

    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.message || "Create failed" });
    }

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update a course
 * PATCH /api/courses/:id
 */
export async function updateCourseHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    if (user.role !== "instructor" && user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const patch = req.body || {};
    if (patch.title) {
      patch.slug = slugifyLocal(patch.title);
    }

    const { data, error } = await supabaseAdmin
      .from("courses")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.message || "Update failed" });
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
