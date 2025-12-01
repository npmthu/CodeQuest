import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/database';

/**
 * Instructor Dashboard Stats
 * GET /api/instructor/stats
 */
export const getInstructorStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get instructor's created problems
    const { data: problems } = await supabaseAdmin
      .from('problems')
      .select('id')
      .eq('created_by', userId);

    const problemCount = problems?.length || 0;

    // Get instructor's created lessons (proxy for courses)
    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .eq('created_by', userId);

    const lessonCount = lessons?.length || 0;

    // Get total students (unique users in submissions for instructor's problems)
    const problemIdList = problems?.map((p: any) => p.id) || [];

    let totalStudents = 0;
    if (problemIdList.length > 0) {
      const { data: submissions } = await supabaseAdmin
        .from('submissions')
        .select('user_id', { count: 'exact' })
        .in('problem_id', problemIdList);
      
      totalStudents = new Set(submissions?.map((s: any) => s.user_id)).size;
    }

    // Get average rating from quiz attempts
    const { data: quizzes } = await supabaseAdmin
      .from('quizzes')
      .select('id')
      .eq('created_by', userId);

    const quizIdList = quizzes?.map((q: any) => q.id) || [];
    let avgRating = 0;

    if (quizIdList.length > 0) {
      const { data: attempts } = await supabaseAdmin
        .from('quiz_attempts')
        .select('score, total_points')
        .in('quiz_id', quizIdList);

      if (attempts && attempts.length > 0) {
        const avgScore = attempts.reduce((sum: number, a: any) => sum + ((a.score || 0) / (a.total_points || 1)), 0) / attempts.length;
        avgRating = Math.round(avgScore * 5) / 100; // Convert to 5-star scale
      }
    }

    // Mock revenue (database doesn't track this yet)
    const mockRevenue = totalStudents * 10; // $10 per student

    return res.json({
      success: true,
      data: {
        coursesCount: lessonCount,
        totalStudents,
        totalRevenue: mockRevenue,
        averageRating: Math.min(avgRating, 5),
        totalReviews: quizIdList.length
      }
    });
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    res.status(500).json({ error: 'Failed to fetch instructor stats' });
  }
};

/**
 * Get Instructor's Courses
 * GET /api/instructor/courses
 */
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get instructor's created lessons (using as courses proxy)
    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select(`
        id,
        title,
        content_markdown,
        difficulty,
        is_published,
        created_at,
        updated_at,
        course_id,
        courses (
          title,
          description,
          thumbnail_url
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    // Group lessons by course or show individual lessons
    const enrichedCourses = await Promise.all(
      (lessons || []).map(async (lesson: any) => {
        // Get completion count
        const { data: completions } = await supabaseAdmin
          .from('lesson_completions')
          .select('user_id', { count: 'exact' })
          .eq('lesson_id', lesson.id);

        const studentCount = new Set(completions?.map((c: any) => c.user_id)).size;

        return {
          id: lesson.id,
          title: lesson.courses?.title || lesson.title,
          description: lesson.courses?.description || lesson.content_markdown?.substring(0, 100),
          cover_image_url: lesson.courses?.thumbnail_url,
          difficulty: lesson.difficulty,
          status: lesson.is_published ? 'Published' : 'Draft',
          lessons_count: 1,
          students_enrolled: studentCount,
          rating: 4.5 + Math.random() * 0.5,
          reviews_count: Math.floor(studentCount * 0.3),
          price: 0,
          duration: 'N/A',
          lastUpdated: new Date(lesson.updated_at).toLocaleDateString()
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedCourses
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

/**
 * Get Instructor Analytics
 * GET /api/instructor/analytics
 */
export const getInstructorAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock analytics data
    const revenueData = [
      { month: 'Jan', revenue: 8500 },
      { month: 'Feb', revenue: 9200 },
      { month: 'Mar', revenue: 8800 },
      { month: 'Apr', revenue: 10500 },
      { month: 'May', revenue: 11200 },
      { month: 'Jun', revenue: 12450 },
    ];

    const enrollmentData = [
      { month: 'Jan', students: 180 },
      { month: 'Feb', students: 220 },
      { month: 'Mar', students: 195 },
      { month: 'Apr', students: 280 },
      { month: 'May', students: 310 },
      { month: 'Jun', students: 284 },
    ];

    return res.json({
      success: true,
      data: {
        revenueData: revenueData,
        enrollmentData: enrollmentData
      }
    });
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

/**
 * Get Instructor Activities
 * GET /api/instructor/activities
 */
export const getInstructorActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get submissions to instructor's problems
    const { data: problems } = await supabaseAdmin
      .from('problems')
      .select('id')
      .eq('created_by', userId);

    const problemIds = problems?.map(p => p.id) || [];

    let activities: any[] = [];
    if (problemIds.length > 0) {
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
        .in('problem_id', problemIds)
        .order('submitted_at', { ascending: false })
        .limit(10);

      activities = (submissions || []).map((sub: any) => ({
        type: sub.status === 'accepted' ? 'review' : 'submission',
        user: sub.users?.display_name || 'Unknown',
        content: `Submitted solution to "${sub.problems?.title || 'Problem'}"`,
        status: sub.status,
        time: new Date(sub.submitted_at).toLocaleDateString(),
        rating: sub.status === 'accepted' ? 5 : undefined
      }));
    }

    return res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching instructor activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};
