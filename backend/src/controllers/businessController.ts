import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";

// Helper to get partner_id for current business user
async function getPartnerId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("partners")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.user_id || null;
}

function ensureBusiness(req: AuthRequest, res: Response) {
  const role = req.user?.role;
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (role !== "business" && role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

/**
 * Business Partner Dashboard Stats
 * GET /api/business/stats
 */
export const getBusinessStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get partner_id (which is the user_id for business users)
    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("partner_id", partnerId);

    const courseIds = courses?.map((c: any) => c.id) || [];
    const totalCourses = courseIds.length;

    // Get instructors linked to this partner
    const { data: instructors } = await supabaseAdmin
      .from("instructors")
      .select("user_id")
      .eq("partner_id", partnerId);

    const activeInstructors = instructors?.length || 0;

    // Get learners enrolled in partner's courses
    let totalLearners = 0;
    let avgCompletion = 0;

    if (courseIds.length > 0) {
      const { data: enrollments } = await supabaseAdmin
        .from("enrollments")
        .select("user_id, status, completed_at")
        .in("course_id", courseIds);

      const uniqueLearners = new Set(enrollments?.map((e: any) => e.user_id));
      totalLearners = uniqueLearners.size;

      // Calculate completion rate
      if (enrollments && enrollments.length > 0) {
        const completedCount = enrollments.filter((e: any) => e.status === "completed" || e.completed_at).length;
        avgCompletion = Math.round((completedCount / enrollments.length) * 100);
      }
    }

    return res.json({
      success: true,
      data: {
        totalLearners,
        activeInstructors,
        totalCourses,
        averageCompletion: avgCompletion,
      },
    });
  } catch (error) {
    console.error("Error fetching business stats:", error);
    res.status(500).json({ error: "Failed to fetch business stats" });
  }
};

/**
 * Get Business Leaderboard (Top performers from partner's courses)
 * GET /api/business/leaderboard
 */
export const getBusinessLeaderboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("partner_id", partnerId);

    const courseIds = courses?.map((c: any) => c.id) || [];

    if (courseIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get enrollments with user info for partner's courses
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select(`
        user_id,
        course_id,
        status,
        progress,
        completed_at,
        users (
          id,
          display_name,
          avatar_url,
          level,
          reputation
        )
      `)
      .in("course_id", courseIds);

    // Aggregate by user
    const userStats: Record<string, any> = {};
    (enrollments || []).forEach((e: any) => {
      const uid = e.user_id;
      if (!userStats[uid]) {
        userStats[uid] = {
          id: uid,
          name: e.users?.display_name || "Unknown",
          avatar: e.users?.avatar_url || "",
          level: e.users?.level || "Beginner",
          reputation: e.users?.reputation || 0,
          coursesEnrolled: 0,
          coursesCompleted: 0,
          totalProgress: 0,
        };
      }
      userStats[uid].coursesEnrolled++;
      if (e.status === "completed" || e.completed_at) {
        userStats[uid].coursesCompleted++;
      }
      // Progress can be stored as { percentage: number } in progress jsonb
      const progressPct = e.progress?.percentage || 0;
      userStats[uid].totalProgress += progressPct;
    });

    // Convert to array and calculate completion
    const leaderboard = Object.values(userStats)
      .map((u: any) => ({
        rank: 0,
        name: u.name,
        avatar: u.avatar,
        level: u.level,
        reputation: u.reputation,
        courses: u.coursesEnrolled,
        completion: u.coursesEnrolled > 0 
          ? Math.round((u.coursesCompleted / u.coursesEnrolled) * 100) 
          : 0,
      }))
      .sort((a, b) => b.completion - a.completion || b.reputation - a.reputation)
      .slice(0, 10)
      .map((u, index) => ({ ...u, rank: index + 1 }));

    return res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching business leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

/**
 * Get Business Analytics
 * GET /api/business/analytics
 */
export const getBusinessAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id, created_at")
      .eq("partner_id", partnerId);

    const courseIds = courses?.map((c: any) => c.id) || [];

    // Get enrollments with timestamps for trend data
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("user_id, course_id, enrolled_at, status, completed_at")
      .in("course_id", courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000']);

    // Calculate monthly engagement trend for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const engagementData: { month: string; learners: number; completion: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthEnd = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i + 1, 0);
      const monthName = monthStart.toLocaleString('default', { month: 'short' });

      const monthEnrollments = (enrollments || []).filter((e: any) => {
        const enrollDate = new Date(e.enrolled_at);
        return enrollDate >= monthStart && enrollDate <= monthEnd;
      });

      const uniqueLearners = new Set(monthEnrollments.map((e: any) => e.user_id)).size;
      const completedCount = monthEnrollments.filter((e: any) => e.status === 'completed' || e.completed_at).length;
      const completionRate = monthEnrollments.length > 0 
        ? Math.round((completedCount / monthEnrollments.length) * 100) 
        : 0;

      engagementData.push({
        month: monthName,
        learners: uniqueLearners,
        completion: completionRate,
      });
    }

    // Get course distribution for pie chart
    const { data: courseEnrollments } = await supabaseAdmin
      .from("courses")
      .select(`
        id,
        title,
        enrollments (id)
      `)
      .eq("partner_id", partnerId);

    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
    const performanceByDepartment = (courseEnrollments || [])
      .map((c: any, idx: number) => ({
        name: c.title?.substring(0, 20) || `Course ${idx + 1}`,
        value: c.enrollments?.length || 0,
        color: colors[idx % colors.length],
      }))
      .filter((c: any) => c.value > 0)
      .slice(0, 5);

    // If no data, provide placeholder
    if (performanceByDepartment.length === 0) {
      performanceByDepartment.push({ name: "No courses yet", value: 1, color: "#94a3b8" });
    }

    return res.json({
      success: true,
      data: {
        engagement: engagementData,
        departments: performanceByDepartment,
      },
    });
  } catch (error) {
    console.error("Error fetching business analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

/**
 * Get Business Courses
 * GET /api/business/courses
 */
export const getBusinessCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses with enrollment counts
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select(`
        id,
        title,
        slug,
        description,
        thumbnail_url,
        difficulty,
        is_published,
        created_at,
        updated_at,
        enrollments (id, status, completed_at)
      `)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    const formattedCourses = (courses || []).map((c: any) => {
      const enrollments = c.enrollments || [];
      const completedCount = enrollments.filter((e: any) => e.status === 'completed' || e.completed_at).length;
      
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnail_url: c.thumbnail_url,
        difficulty_level: c.difficulty,
        is_published: c.is_published,
        enrolledCount: enrollments.length,
        completedCount,
        completionRate: enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 0,
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    });

    return res.json({
      success: true,
      data: {
        courses: formattedCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching business courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/**
 * Create Business Course
 * POST /api/business/courses
 */
export const createBusinessCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    const { title, description, difficulty_level, difficulty, thumbnail_url } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Support both difficulty_level (frontend) and difficulty (database)
    const difficultyValue = difficulty_level || difficulty || 'Beginner';

    const { data: course, error } = await supabaseAdmin
      .from("courses")
      .insert({
        title,
        slug,
        description: description || '',
        difficulty: difficultyValue,
        thumbnail_url: thumbnail_url || null,
        partner_id: partnerId,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error creating business course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

/**
 * Update Business Course
 * PATCH /api/business/courses/:id
 */
export const updateBusinessCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    const { id } = req.params;
    const { title, description, difficulty, thumbnail_url, is_published } = req.body;

    // Verify course belongs to this partner
    const { data: existing } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("id", id)
      .eq("partner_id", partnerId)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data: course, error } = await supabaseAdmin
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error updating business course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

/**
 * Delete Business Course
 * DELETE /api/business/courses/:id
 */
export const deleteBusinessCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    const { id } = req.params;

    // Verify course belongs to this partner
    const { data: existing } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("id", id)
      .eq("partner_id", partnerId)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    const { error } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      message: "Course deleted",
    });
  } catch (error) {
    console.error("Error deleting business course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

/**
 * Get Business Learners (enrolled in partner's courses)
 * GET /api/business/learners
 */
export const getBusinessLearners = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id, title")
      .eq("partner_id", partnerId);

    const courseIds = courses?.map((c: any) => c.id) || [];
    const courseMap = new Map(courses?.map((c: any) => [c.id, c.title]) || []);

    if (courseIds.length === 0) {
      return res.json({ success: true, data: { learners: [] } });
    }

    // Get enrollments with user data
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        progress,
        users (
          id,
          email,
          display_name,
          avatar_url,
          created_at
        )
      `)
      .in("course_id", courseIds)
      .order("enrolled_at", { ascending: false });

    // Aggregate by user
    const learnerMap: Record<string, any> = {};
    (enrollments || []).forEach((e: any) => {
      const uid = e.user_id;
      if (!learnerMap[uid]) {
        learnerMap[uid] = {
          id: uid,
          email: e.users?.email || '',
          name: e.users?.display_name || 'Unknown',
          avatar: e.users?.avatar_url || '',
          joinedAt: e.users?.created_at,
          enrolledCourses: [],
          status: 'active',
        };
      }
      learnerMap[uid].enrolledCourses.push({
        courseId: e.course_id,
        courseName: courseMap.get(e.course_id) || 'Unknown',
        status: e.status,
        progress: e.progress?.percentage || 0,
        enrolledAt: e.enrolled_at,
        completedAt: e.completed_at,
      });
    });

    const learners = Object.values(learnerMap);

    return res.json({
      success: true,
      data: {
        learners,
      },
    });
  } catch (error) {
    console.error("Error fetching business learners:", error);
    res.status(500).json({ error: "Failed to fetch learners" });
  }
};

/**
 * Get Business Instructors (linked to partner)
 * GET /api/business/instructors
 */
export const getBusinessInstructors = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get instructors from instructors table
    const { data: instructorLinks } = await supabaseAdmin
      .from("instructors")
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          email,
          display_name,
          avatar_url,
          bio,
          metadata
        )
      `)
      .eq("partner_id", partnerId);

    const instructors = (instructorLinks || []).map((i: any) => ({
      id: i.user_id,
      email: i.users?.email || '',
      name: i.users?.display_name || 'Unknown',
      avatar: i.users?.avatar_url || '',
      bio: i.users?.bio || '',
      role: i.role,
      joinedAt: i.joined_at,
      specialization: i.users?.metadata?.specialization || '',
      coursesCount: 0,
      studentsCount: 0,
    }));

    return res.json({
      success: true,
      data: {
        instructors,
      },
    });
  } catch (error) {
    console.error("Error fetching business instructors:", error);
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
};

/**
 * Get Business Partner Settings
 * GET /api/business/settings
 */
export const getBusinessSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get partner data and user data
    const { data: partner } = await supabaseAdmin
      .from("partners")
      .select(`
        user_id,
        slug,
        domain,
        logo_url,
        settings,
        created_at,
        users!inner (
          email,
          display_name
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (!partner) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    const userData = Array.isArray(partner.users) ? partner.users[0] : partner.users;

    return res.json({
      success: true,
      data: {
        id: partner.user_id,
        name: userData?.display_name || '',
        email: userData?.email || '',
        slug: partner.slug,
        domain: partner.domain,
        logoUrl: partner.logo_url,
        settings: partner.settings || {},
        createdAt: partner.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching business settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

/**
 * Update Business Partner Settings
 * PATCH /api/business/settings
 */
export const updateBusinessSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, slug, domain, logo_url, settings } = req.body;

    // Update partner
    const partnerUpdates: any = { updated_at: new Date().toISOString() };
    if (slug !== undefined) partnerUpdates.slug = slug;
    if (domain !== undefined) partnerUpdates.domain = domain;
    if (logo_url !== undefined) partnerUpdates.logo_url = logo_url;
    if (settings !== undefined) partnerUpdates.settings = settings;

    const { error: partnerError } = await supabaseAdmin
      .from("partners")
      .update(partnerUpdates)
      .eq("user_id", userId);

    if (partnerError) {
      return res.status(400).json({ error: partnerError.message });
    }

    // Update user display_name if provided
    if (name !== undefined) {
      await supabaseAdmin
        .from("users")
        .update({ display_name: name })
        .eq("id", userId);
    }

    return res.json({
      success: true,
      message: "Settings updated",
    });
  } catch (error) {
    console.error("Error updating business settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

/**
 * Get Business Cohorts (using courses as cohorts for now)
 * GET /api/business/cohorts
 */
export const getBusinessCohorts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get courses with enrollment counts as "cohorts"
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select(`
        id,
        title,
        created_at,
        is_published,
        enrollments (id, status, completed_at)
      `)
      .eq("partner_id", partnerId);

    // Get instructors count
    const { data: instructors } = await supabaseAdmin
      .from("instructors")
      .select("user_id")
      .eq("partner_id", partnerId);

    const instructorCount = instructors?.length || 0;

    const cohorts = (courses || []).map((c: any) => {
      const enrollments = c.enrollments || [];
      const completedCount = enrollments.filter((e: any) => e.status === 'completed' || e.completed_at).length;
      const progress = enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 0;

      return {
        id: c.id,
        name: c.title,
        learners: enrollments.length,
        instructors: instructorCount,
        courses: 1, // Each course is a cohort
        progress,
        startDate: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status: c.is_published ? 'Active' : 'Draft',
      };
    });

    return res.json({
      success: true,
      data: cohorts,
    });
  } catch (error) {
    console.error("Error fetching business cohorts:", error);
    res.status(500).json({ error: "Failed to fetch cohorts" });
  }
};

/**
 * Get Recent Activities
 * GET /api/business/activities
 */
export const getBusinessActivities = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const partnerId = await getPartnerId(userId);
    if (!partnerId) {
      return res.status(404).json({ error: "Business partner not found" });
    }

    // Get partner's courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("partner_id", partnerId);

    const courseIds = courses?.map((c: any) => c.id) || [];

    if (courseIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get recent enrollments
    const { data: recentEnrollments } = await supabaseAdmin
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        users (display_name),
        courses (title)
      `)
      .in("course_id", courseIds)
      .order("enrolled_at", { ascending: false })
      .limit(10);

    const activities = (recentEnrollments || []).map((e: any) => {
      const isCompleted = e.status === 'completed' || e.completed_at;
      return {
        type: isCompleted ? "completion" : "enrollment",
        user: e.users?.display_name || "Unknown",
        action: isCompleted ? "completed" : "enrolled in",
        target: e.courses?.title || "Course",
        time: new Date(e.enrolled_at).toLocaleDateString(),
      };
    });

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching business activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

// ===== Learners CRUD (Enroll learner in partner's courses) =====
export const addLearner = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { email, course_id } = req.body || {};
  if (!email || !course_id) {
    return res
      .status(400)
      .json({ success: false, error: "Email and course_id required" });
  }

  // Verify course belongs to this partner
  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("id")
    .eq("id", course_id)
    .eq("partner_id", partnerId)
    .maybeSingle();

  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  // Find user by email
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, display_name")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return res
      .status(400)
      .json({ success: false, error: "User not found with this email" });
  }

  // Check if already enrolled
  const { data: existing } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ success: false, error: "User already enrolled in this course" });
  }

  // Create enrollment
  const { data: enrollment, error } = await supabaseAdmin
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: course_id,
      status: "enrolled",
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data: { ...enrollment, user } });
};

export const updateLearner = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { id } = req.params; // enrollment id
  const { status } = req.body || {};

  // Get enrollment and verify it's for partner's course
  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select(`
      id,
      course_id,
      courses!inner (partner_id)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!enrollment || (enrollment.courses as any)?.partner_id !== partnerId) {
    return res.status(404).json({ success: false, error: "Enrollment not found" });
  }

  const updates: any = {};
  if (status) {
    updates.status = status;
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabaseAdmin
    .from("enrollments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
};

export const deleteLearner = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { id } = req.params; // enrollment id

  // Get enrollment and verify it's for partner's course
  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select(`
      id,
      course_id,
      courses!inner (partner_id)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!enrollment || (enrollment.courses as any)?.partner_id !== partnerId) {
    return res.status(404).json({ success: false, error: "Enrollment not found" });
  }

  const { error } = await supabaseAdmin.from("enrollments").delete().eq("id", id);
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  return res.json({ success: true, message: "Learner removed from course" });
};

export const exportLearners = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  // Get partner's courses
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id")
    .eq("partner_id", partnerId);

  const courseIds = courses?.map((c: any) => c.id) || [];

  if (courseIds.length === 0) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="learners.csv"');
    return res.send("name,email,course,status,enrolled_at\n");
  }

  // Get enrollments with user data
  const { data: enrollments } = await supabaseAdmin
    .from("enrollments")
    .select(`
      status,
      enrolled_at,
      users (display_name, email),
      courses (title)
    `)
    .in("course_id", courseIds);

  let csv = "name,email,course,status,enrolled_at\n";
  (enrollments || []).forEach((e: any) => {
    const name = (e.users?.display_name || '').replace(/,/g, ' ');
    const email = e.users?.email || '';
    const course = (e.courses?.title || '').replace(/,/g, ' ');
    csv += `${name},${email},${course},${e.status},${e.enrolled_at}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="learners.csv"');
  res.send(csv);
};

export const importLearners = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  // Placeholder stub - would need CSV parsing
  return res.json({
    success: true,
    message: "Import feature coming soon",
  });
};

// ===== Instructors CRUD (link/unlink instructors to partner) =====
export const addInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { email, role } = req.body || {};
  if (!email) {
    return res
      .status(400)
      .json({ success: false, error: "Email is required" });
  }

  // Find user by email
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, display_name")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return res
      .status(400)
      .json({ success: false, error: "User not found with this email" });
  }

  // Check if already linked
  const { data: existing } = await supabaseAdmin
    .from("instructors")
    .select("user_id")
    .eq("partner_id", partnerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ success: false, error: "Instructor already linked to this partner" });
  }

  // Create instructor link
  const { data: instructor, error } = await supabaseAdmin
    .from("instructors")
    .insert({
      partner_id: partnerId,
      user_id: user.id,
      role: role || 'instructor',
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  // Also update user role to instructor if they're a learner
  await supabaseAdmin
    .from("users")
    .update({ role: "instructor" })
    .eq("id", user.id)
    .eq("role", "learner");

  return res.status(201).json({ success: true, data: { ...instructor, user } });
};

export const updateInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { id } = req.params; // instructor user_id
  const { role } = req.body || {};

  // Verify instructor belongs to this partner
  const { data: existing } = await supabaseAdmin
    .from("instructors")
    .select("user_id")
    .eq("partner_id", partnerId)
    .eq("user_id", id)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ success: false, error: "Instructor not found" });
  }

  const updates: any = {};
  if (role) updates.role = role;

  const { data, error } = await supabaseAdmin
    .from("instructors")
    .update(updates)
    .eq("partner_id", partnerId)
    .eq("user_id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
};

export const deleteInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const userId = req.user?.id;
  
  const partnerId = await getPartnerId(userId!);
  if (!partnerId) {
    return res.status(404).json({ error: "Business partner not found" });
  }

  const { id } = req.params; // instructor user_id

  // Verify instructor belongs to this partner
  const { data: existing } = await supabaseAdmin
    .from("instructors")
    .select("user_id")
    .eq("partner_id", partnerId)
    .eq("user_id", id)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ success: false, error: "Instructor not found" });
  }

  const { error } = await supabaseAdmin
    .from("instructors")
    .delete()
    .eq("partner_id", partnerId)
    .eq("user_id", id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  return res.json({ success: true, message: "Instructor removed" });
};
