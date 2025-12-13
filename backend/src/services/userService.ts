import { supabaseAdmin } from "../config/database";
import type {
  User,
  UserLearningProfile
} from '../models/User';
import type { UpdateUserDTO } from '../dtos/user.dto';

export async function listUsers(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getUser(id: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createUser(payload: Partial<User>) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, patch: UpdateUserDTO) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function getUserLearningProfile(
  userId: string
): Promise<UserLearningProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("user_learning_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export async function getUserStats(userId: string) {
  // Get user profile
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");

  // Get submission stats with language breakdown
  const { data: submissions } = await supabaseAdmin
    .from("submissions")
    .select(
      `
      id, 
      status, 
      passed,
      points,
      submitted_at,
      languages (name)
    `
    )
    .eq("user_id", userId);

  const totalSubmissions = submissions?.length || 0;
  const acceptedSubmissions = submissions?.filter((s) => s.passed).length || 0;
  const totalPoints =
    submissions?.reduce((sum, s) => sum + (s.points || 0), 0) || 0;

  // Language stats
  const languageStats: Record<string, number> = {};
  submissions?.forEach((s) => {
    const lang = (s.languages as any)?.name || "Unknown";
    languageStats[lang] = (languageStats[lang] || 0) + 1;
  });

  // Get unique problems solved with difficulty breakdown
  const { data: solvedProblems } = await supabaseAdmin
    .from("submissions")
    .select(
      `
      problem_id,
      problems (difficulty)
    `
    )
    .eq("user_id", userId)
    .eq("passed", true);

  const uniqueProblemIds = new Set(
    solvedProblems?.map((s) => s.problem_id) || []
  );
  const uniqueProblemsSolved = uniqueProblemIds.size;

  // Difficulty breakdown
  const difficultyStats = { easy: 0, medium: 0, hard: 0 };
  const uniqueProblems = Array.from(uniqueProblemIds).map((id) =>
    solvedProblems?.find((p) => p.problem_id === id)
  );
  uniqueProblems.forEach((p) => {
    const difficulty = (p?.problems as any)?.difficulty || 1;
    if (difficulty === 1) difficultyStats.easy++;
    else if (difficulty === 2) difficultyStats.medium++;
    else if (difficulty === 3) difficultyStats.hard++;
  });

  // Get lessons completed with time
  const { data: lessonsData, count: lessonsCompleted } = await supabaseAdmin
    .from("lesson_completions")
    .select("time_spent_sec", { count: "exact" })
    .eq("user_id", userId);

  const totalStudyTime =
    lessonsData?.reduce((sum, l) => sum + (l.time_spent_sec || 0), 0) || 0;

  // Get quiz attempts
  const { data: quizAttempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, passed, score, total_points")
    .eq("user_id", userId);

  const quizzesPassed = quizAttempts?.filter((q) => q.passed).length || 0;
  const avgQuizScore = quizAttempts?.length
    ? quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) /
      quizAttempts.length
    : 0;

  // Get learning profile for streaks
  const profile = await getUserLearningProfile(userId);

  // Recent activity (last 10 submissions)
  const { data: recentActivity } = await supabaseAdmin
    .from("submissions")
    .select(
      `
      id, 
      status, 
      passed,
      points,
      submitted_at,
      problems (
        title,
        slug,
        difficulty
      ),
      languages (name)
    `
    )
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(10);

  // Calculate acceptance rate
  const acceptanceRate =
    totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

  return {
    // User info
    userId: user.id,
    displayName: user.display_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role,
    level: user.level || "Beginner",
    reputation: user.reputation || 0,

    // Submission stats
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate,
    totalPoints,

    // Problems stats
    problemsSolved: uniqueProblemsSolved,
    problemsByDifficulty: difficultyStats,

    // Learning stats
    lessonsCompleted: lessonsCompleted || 0,
    totalStudyTimeSeconds: totalStudyTime,
    totalStudyTimeHours: Math.round((totalStudyTime / 3600) * 10) / 10,

    // Quiz stats
    quizAttempts: quizAttempts?.length || 0,
    quizzesPassed: quizzesPassed,
    avgQuizScore: Math.round(avgQuizScore),

    // Streak stats
    currentStreak: profile?.current_streak_days || 0,
    longestStreak: profile?.longest_streak_days || 0,
    lastActivityDate: profile?.last_activity_date,

    // Language breakdown
    languageStats,

    // Recent activity
    recentActivity: recentActivity || [],

    // Profile metadata
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
}

// Get global leaderboard
export async function getLeaderboard(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, display_name, email, avatar_url, reputation, level, role")
    .eq("is_active", true)
    .order("reputation", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get problem counts for each user
  const leaderboard = await Promise.all(
    (data || []).map(async (user, index) => {
      const { data: solvedProblems } = await supabaseAdmin
        .from("submissions")
        .select("problem_id")
        .eq("user_id", user.id)
        .eq("passed", true);

      const problemsSolved = new Set(
        solvedProblems?.map((s) => s.problem_id) || []
      ).size;

      return {
        rank: index + 1,
        userId: user.id,
        displayName:
          user.display_name || user.email?.split("@")[0] || "Anonymous",
        avatarUrl: user.avatar_url,
        level: user.level,
        reputation: user.reputation || 0,
        problemsSolved,
        role: user.role,
      };
    })
  );

  return leaderboard;
}
