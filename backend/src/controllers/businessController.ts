import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";

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

    // Get platform-wide stats (since no partner association yet)
    // Get total courses
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id", { count: "exact" })
      .eq("is_published", true);

    // Get total instructors (users with instructor role)
    const { data: instructors } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact" })
      .eq("role", "instructor");

    // Get total unique learners (from submissions)
    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select("user_id");

    const totalLearners = new Set(submissions?.map((s: any) => s.user_id)).size;

    // Get completion rate (passed submissions / total submissions)
    const { data: allSubmissions } = await supabaseAdmin
      .from("submissions")
      .select("passed");

    let avgCompletion = 0;
    if (allSubmissions && allSubmissions.length > 0) {
      const passedCount = allSubmissions.filter((s: any) => s.passed).length;
      avgCompletion = Math.round((passedCount / allSubmissions.length) * 100);
    }

    return res.json({
      success: true,
      data: {
        totalLearners,
        activeInstructors: instructors?.length || 0,
        totalCourses: courses?.length || 0,
        averageCompletion: avgCompletion,
      },
    });
  } catch (error) {
    console.error("Error fetching business stats:", error);
    res.status(500).json({ error: "Failed to fetch business stats" });
  }
};

/**
 * Get Business Leaderboard (Top performers)
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

    // Get top learners by reputation/XP
    const { data: topLearners } = await supabaseAdmin
      .from("users")
      .select(
        `
        id,
        display_name,
        avatar_url,
        reputation,
        level
      `
      )
      .eq("role", "learner")
      .order("reputation", { ascending: false })
      .limit(10);

    const leaderboard = (topLearners || []).map((user, index) => ({
      rank: index + 1,
      name: user.display_name,
      avatar: user.avatar_url || "",
      level: user.level,
      reputation: user.reputation || 0,
      courses: Math.floor(Math.random() * 8 + 1), // Mock courses completed
      completion: Math.floor(Math.random() * 30 + 60), // Mock completion %
    }));

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
    // Mock engagement trend data
    const engagementData = [
      { month: "Jan", learners: 980, completion: 75 },
      { month: "Feb", learners: 1050, completion: 76 },
      { month: "Mar", learners: 1120, completion: 78 },
      { month: "Apr", learners: 1180, completion: 77 },
      { month: "May", learners: 1230, completion: 79 },
      { month: "Jun", learners: 1247, completion: 78 },
    ];

    // Mock department performance
    const performanceByDepartment = [
      { name: "Engineering", value: 35, color: "#2563EB" },
      { name: "Data Science", value: 28, color: "#10B981" },
      { name: "Design", value: 18, color: "#F59E0B" },
      { name: "Marketing", value: 12, color: "#8B5CF6" },
      { name: "Others", value: 7, color: "#EC4899" },
    ];

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
 * Get Business Cohorts
 * GET /api/business/cohorts
 */
export const getBusinessCohorts = async (req: AuthRequest, res: Response) => {
  try {
    // Mock cohorts data (no real table exists yet)
    const cohorts = [
      {
        id: "1",
        name: "Software Engineering Cohort 2024",
        learners: 85,
        instructors: 4,
        courses: 12,
        progress: 72,
        startDate: "Jan 2024",
        status: "Active",
      },
      {
        id: "2",
        name: "Data Science Bootcamp Q1",
        learners: 62,
        instructors: 3,
        courses: 8,
        progress: 68,
        startDate: "Feb 2024",
        status: "Active",
      },
      {
        id: "3",
        name: "Web Development Fast Track",
        learners: 124,
        instructors: 5,
        courses: 15,
        progress: 85,
        startDate: "Dec 2023",
        status: "Active",
      },
    ];

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

    // Get recent submissions from all learners
    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select(
        `
        id,
        user_id,
        problem_id,
        status,
        submitted_at,
        problems (
          title
        ),
        users (
          display_name
        )
      `
      )
      .order("submitted_at", { ascending: false })
      .limit(10);

    const activities = (submissions || []).map((sub: any) => ({
      type: sub.status === "accepted" ? "completion" : "enrollment",
      user: sub.users?.[0]?.display_name || "Unknown",
      action: sub.status === "accepted" ? "completed" : "attempted",
      target: sub.problems?.[0]?.title || "Problem",
      time: new Date(sub.submitted_at).toLocaleDateString(),
    }));

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching business activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

// ===== Learners CRUD =====
export const addLearner = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const { name, email, department, cohort } = req.body || {};
  if (!email || !name) {
    return res
      .status(400)
      .json({ success: false, error: "Name and email required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email format" });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return res
      .status(400)
      .json({ success: false, error: "User not found in auth" });
  }

  const metadata = {
    ...(user.metadata || {}),
    department,
    cohort,
  };

  const { error } = await supabaseAdmin
    .from("users")
    .update({ display_name: name, role: "learner", metadata })
    .eq("id", user.id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data: { ...user, metadata } });
};

export const updateLearner = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const { id } = req.params;
  const { name, department, cohort } = req.body || {};

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!user) {
    return res.status(404).json({ success: false, error: "Learner not found" });
  }

  const metadata = {
    ...(user.metadata || {}),
    department,
    cohort,
  };

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ display_name: name || user.display_name, metadata })
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
  const { id } = req.params;
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  return res.json({ success: true, message: "Learner removed" });
};

export const exportLearners = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  // Placeholder: return empty CSV content
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="learners.csv"');
  res.send("name,email,department,cohort\n");
};

export const importLearners = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  // Placeholder stub
  return res.json({
    success: true,
    message: "Import received (not processed in stub)",
  });
};

// ===== Instructors CRUD =====
export const addInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const { name, email, specialization, cohorts, bio } = req.body || {};
  if (!email || !name) {
    return res
      .status(400)
      .json({ success: false, error: "Name and email required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email format" });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return res
      .status(400)
      .json({ success: false, error: "User not found in auth" });
  }

  const metadata = {
    ...(user.metadata || {}),
    specialization,
    cohorts,
    bio,
  };

  const { error } = await supabaseAdmin
    .from("users")
    .update({ display_name: name, role: "instructor", metadata })
    .eq("id", user.id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data: { ...user, metadata } });
};

export const updateInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const { id } = req.params;
  const { name, specialization, cohorts, bio } = req.body || {};

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!user) {
    return res
      .status(404)
      .json({ success: false, error: "Instructor not found" });
  }

  const metadata = {
    ...(user.metadata || {}),
    specialization,
    cohorts,
    bio,
  };

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      display_name: name || user.display_name,
      metadata,
      role: "instructor",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
};

export const deleteInstructor = async (req: AuthRequest, res: Response) => {
  if (!ensureBusiness(req, res)) return;
  const { id } = req.params;
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  return res.json({ success: true, message: "Instructor removed" });
};
