import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/database';

/**
 * Business Partner Dashboard Stats
 * GET /api/business/stats
 */
export const getBusinessStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get platform-wide stats (since no partner association yet)
    // Get total courses
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id', { count: 'exact' })
      .eq('is_published', true);

    // Get total instructors (users with instructor role)
    const { data: instructors } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'instructor');

    // Get total unique learners (from submissions)
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('user_id');
    
    const totalLearners = new Set(submissions?.map((s: any) => s.user_id)).size;

    // Get completion rate (passed submissions / total submissions)
    const { data: allSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('passed');

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
        averageCompletion: avgCompletion
      }
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    res.status(500).json({ error: 'Failed to fetch business stats' });
  }
};

/**
 * Get Business Leaderboard (Top performers)
 * GET /api/business/leaderboard
 */
export const getBusinessLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get top learners by reputation/XP
    const { data: topLearners } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        display_name,
        avatar_url,
        reputation,
        level
      `)
      .eq('role', 'learner')
      .order('reputation', { ascending: false })
      .limit(10);

    const leaderboard = (topLearners || []).map((user, index) => ({
      rank: index + 1,
      name: user.display_name,
      avatar: user.avatar_url || '',
      level: user.level,
      reputation: user.reputation || 0,
      courses: Math.floor(Math.random() * 8 + 1), // Mock courses completed
      completion: Math.floor(Math.random() * 30 + 60) // Mock completion %
    }));

    return res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching business leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
      { month: 'Jan', learners: 980, completion: 75 },
      { month: 'Feb', learners: 1050, completion: 76 },
      { month: 'Mar', learners: 1120, completion: 78 },
      { month: 'Apr', learners: 1180, completion: 77 },
      { month: 'May', learners: 1230, completion: 79 },
      { month: 'Jun', learners: 1247, completion: 78 },
    ];

    // Mock department performance
    const performanceByDepartment = [
      { name: 'Engineering', value: 35, color: '#2563EB' },
      { name: 'Data Science', value: 28, color: '#10B981' },
      { name: 'Design', value: 18, color: '#F59E0B' },
      { name: 'Marketing', value: 12, color: '#8B5CF6' },
      { name: 'Others', value: 7, color: '#EC4899' },
    ];

    return res.json({
      success: true,
      data: {
        engagement: engagementData,
        departments: performanceByDepartment
      }
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
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
        id: '1',
        name: 'Software Engineering Cohort 2024',
        learners: 85,
        instructors: 4,
        courses: 12,
        progress: 72,
        startDate: 'Jan 2024',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Data Science Bootcamp Q1',
        learners: 62,
        instructors: 3,
        courses: 8,
        progress: 68,
        startDate: 'Feb 2024',
        status: 'Active'
      },
      {
        id: '3',
        name: 'Web Development Fast Track',
        learners: 124,
        instructors: 5,
        courses: 15,
        progress: 85,
        startDate: 'Dec 2023',
        status: 'Active'
      },
    ];

    return res.json({
      success: true,
      data: cohorts
    });
  } catch (error) {
    console.error('Error fetching business cohorts:', error);
    res.status(500).json({ error: 'Failed to fetch cohorts' });
  }
};

/**
 * Get Recent Activities
 * GET /api/business/activities
 */
export const getBusinessActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get recent submissions from all learners
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select(`
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
      `)
      .order('submitted_at', { ascending: false })
      .limit(10);

    const activities = (submissions || []).map((sub: any) => ({
      type: sub.status === 'accepted' ? 'completion' : 'enrollment',
      user: sub.users?.[0]?.display_name || 'Unknown',
      action: sub.status === 'accepted' ? 'completed' : 'attempted',
      target: sub.problems?.[0]?.title || 'Problem',
      time: new Date(sub.submitted_at).toLocaleDateString()
    }));

    return res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching business activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};
