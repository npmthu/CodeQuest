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

    // Get instructor's created lessons (count as "courses")
    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('id, topic_id')
      .eq('created_by', userId);

    const lessonsCount = lessons?.length || 0;
    const topicIds = lessons ? [...new Set(lessons.map((l: any) => l.topic_id))] : [];

    // Get instructor's created problems
    const { data: problems } = await supabaseAdmin
      .from('problems')
      .select('id')
      .eq('created_by', userId);

    const problemIds = problems?.map((p: any) => p.id) || [];

    // Get unique students from lesson completions
    let studentsFromLessons = new Set();
    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l: any) => l.id);
      const { data: completions } = await supabaseAdmin
        .from('lesson_completions')
        .select('user_id')
        .in('lesson_id', lessonIds);
      
      studentsFromLessons = new Set(completions?.map((c: any) => c.user_id) || []);
    }

    // Get unique students from problem submissions
    let studentsFromProblems = new Set();
    if (problemIds.length > 0) {
      const { data: submissions } = await supabaseAdmin
        .from('submissions')
        .select('user_id')
        .in('problem_id', problemIds);
      
      studentsFromProblems = new Set(submissions?.map((s: any) => s.user_id) || []);
    }

    // Combine unique students
    const totalStudents = new Set([...studentsFromLessons, ...studentsFromProblems]).size;

    // Get average rating from instructor's quizzes
    let avgRating = 0;
    if (topicIds.length > 0) {
      const { data: quizzes } = await supabaseAdmin
        .from('quizzes')
        .select('id')
        .in('topic_id', topicIds);

      const quizIds = quizzes?.map((q: any) => q.id) || [];

      if (quizIds.length > 0) {
        const { data: attempts } = await supabaseAdmin
          .from('quiz_attempts')
          .select('score, total_points')
          .in('quiz_id', quizIds)
          .eq('passed', true);

        if (attempts && attempts.length > 0) {
          const avgScore = attempts.reduce((sum: number, a: any) => sum + ((a.score || 0) / (a.total_points || 1)), 0) / attempts.length;
          avgRating = Math.round(avgScore * 5 * 100) / 100;
        }
      }
    }

    // Mock revenue based on student activity
    const mockRevenue = totalStudents * 50;

    return res.json({
      success: true,
      data: {
        coursesCount: lessonsCount, // Use lessons as "courses"
        totalStudents,
        totalRevenue: mockRevenue,
        averageRating: Math.min(avgRating, 5),
        totalReviews: totalStudents
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

    // Get instructor's created lessons with topic info
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
        topic_id,
        topics (
          id,
          title,
          description,
          course_id,
          courses (
            title,
            description,
            thumbnail_url
          )
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    // Transform lessons into "course" format for frontend
    const enrichedCourses = await Promise.all(
      (lessons || []).map(async (lesson: any) => {
        // Get students who completed this lesson
        const { data: completions } = await supabaseAdmin
          .from('lesson_completions')
          .select('user_id')
          .eq('lesson_id', lesson.id);

        const studentsEnrolled = new Set(completions?.map((c: any) => c.user_id)).size;

        // Use topic or course info if available
        const topicInfo = lesson.topics;
        const courseInfo = topicInfo?.courses;

        return {
          id: lesson.id,
          title: courseInfo?.title || topicInfo?.title || lesson.title,
          description: courseInfo?.description || topicInfo?.description || lesson.content_markdown?.substring(0, 100),
          cover_image_url: courseInfo?.thumbnail_url || null,
          difficulty: lesson.difficulty,
          status: lesson.is_published ? 'Published' : 'Draft',
          lessons_count: 1, // Each lesson shown as a "course"
          students_enrolled: studentsEnrolled,
          rating: 4.5 + Math.random() * 0.5,
          reviews_count: Math.floor(studentsEnrolled * 0.3),
          price: 0,
          duration: '30-45min',
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
