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

    const period = (req.query.period as string) || '30d';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get instructor's lessons
    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('id, title, created_at')
      .eq('created_by', userId);

    const lessonIds = lessons?.map(l => l.id) || [];

    // Get instructor's problems
    const { data: problems } = await supabaseAdmin
      .from('problems')
      .select('id, title')
      .eq('created_by', userId);

    const problemIds = problems?.map(p => p.id) || [];

    // Get lesson completions within period
    let lessonCompletions: any[] = [];
    if (lessonIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('lesson_completions')
        .select('user_id, completed_at, lesson_id')
        .in('lesson_id', lessonIds)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });
      lessonCompletions = data || [];
    }

    // Get submissions within period  
    let submissions: any[] = [];
    if (problemIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('submissions')
        .select('user_id, submitted_at, problem_id, status')
        .in('problem_id', problemIds)
        .gte('submitted_at', startDate.toISOString())
        .order('submitted_at', { ascending: true });
      submissions = data || [];
    }

    // Calculate unique students
    const uniqueStudents = new Set([
      ...lessonCompletions.map(c => c.user_id),
      ...submissions.map(s => s.user_id)
    ]);

    // Group data by date for charts
    const dateGroups = new Map<string, { completions: number; submissions: number; uniqueUsers: Set<string> }>();
    
    // Initialize date groups
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dateGroups.set(dateKey, { completions: 0, submissions: 0, uniqueUsers: new Set() });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in lesson completions
    lessonCompletions.forEach(c => {
      const dateKey = new Date(c.completed_at).toISOString().split('T')[0];
      const group = dateGroups.get(dateKey);
      if (group) {
        group.completions++;
        group.uniqueUsers.add(c.user_id);
      }
    });

    // Fill in submissions
    submissions.forEach(s => {
      const dateKey = new Date(s.submitted_at).toISOString().split('T')[0];
      const group = dateGroups.get(dateKey);
      if (group) {
        group.submissions++;
        group.uniqueUsers.add(s.user_id);
      }
    });

    // Convert to chart data (aggregate by week for longer periods)
    const aggregateData = (groupSize: number = 1) => {
      const entries = Array.from(dateGroups.entries());
      const result: any[] = [];
      
      for (let i = 0; i < entries.length; i += groupSize) {
        const slice = entries.slice(i, i + groupSize);
        const totalCompletions = slice.reduce((sum, [_, v]) => sum + v.completions, 0);
        const totalSubmissions = slice.reduce((sum, [_, v]) => sum + v.submissions, 0);
        const allUsers = new Set<string>();
        slice.forEach(([_, v]) => v.uniqueUsers.forEach(u => allUsers.add(u)));
        
        const date = new Date(slice[0][0]);
        result.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completions: totalCompletions,
          submissions: totalSubmissions,
          engagements: allUsers.size,
          // Estimate revenue based on activity
          revenue: (totalCompletions * 5) + (totalSubmissions * 2)
        });
      }
      return result;
    };

    const groupSize = period === '7d' ? 1 : period === '30d' ? 3 : period === '90d' ? 7 : 14;
    const chartData = aggregateData(groupSize);

    // Get top performing lessons/problems
    const lessonStats = await Promise.all((lessons || []).slice(0, 5).map(async (lesson: any) => {
      const { count: completionCount } = await supabaseAdmin
        .from('lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lesson.id);

      return {
        id: lesson.id,
        title: lesson.title,
        type: 'lesson',
        views: completionCount || 0,
        completion: 100, // Completed by definition
      };
    }));

    const problemStats = await Promise.all((problems || []).slice(0, 5).map(async (problem: any) => {
      const { data: subs } = await supabaseAdmin
        .from('submissions')
        .select('status')
        .eq('problem_id', problem.id);

      const total = subs?.length || 0;
      const accepted = subs?.filter((s: any) => s.status === 'accepted').length || 0;

      return {
        id: problem.id,
        title: problem.title,
        type: 'problem',
        views: total,
        completion: total > 0 ? Math.round((accepted / total) * 100) : 0,
      };
    }));

    // Calculate overview stats
    const totalCompletions = lessonCompletions.length;
    const totalSubmissionsCount = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;
    
    const overviewStats = {
      totalViews: totalCompletions + totalSubmissionsCount,
      newEnrollments: uniqueStudents.size,
      revenue: (totalCompletions * 5) + (acceptedSubmissions * 2), // Estimated
      avgCompletion: totalSubmissionsCount > 0 
        ? Math.round((acceptedSubmissions / totalSubmissionsCount) * 100)
        : 0
    };

    // Student engagement by day of week
    const weekdayEngagement = [
      { day: 'Mon', avgTime: 0, completion: 0 },
      { day: 'Tue', avgTime: 0, completion: 0 },
      { day: 'Wed', avgTime: 0, completion: 0 },
      { day: 'Thu', avgTime: 0, completion: 0 },
      { day: 'Fri', avgTime: 0, completion: 0 },
      { day: 'Sat', avgTime: 0, completion: 0 },
      { day: 'Sun', avgTime: 0, completion: 0 },
    ];

    lessonCompletions.forEach(c => {
      const dayIndex = new Date(c.completed_at).getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust for Mon=0
      weekdayEngagement[adjustedIndex].completion++;
      weekdayEngagement[adjustedIndex].avgTime += 30; // Estimate 30 min per completion
    });

    // Normalize engagement data
    weekdayEngagement.forEach(day => {
      if (day.completion > 0) {
        day.avgTime = Math.round(day.avgTime / day.completion);
      }
    });

    return res.json({
      success: true,
      data: {
        overviewStats,
        chartData,
        topContent: [...lessonStats, ...problemStats].sort((a, b) => b.views - a.views).slice(0, 5),
        weekdayEngagement,
        period
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

/**
 * Get Instructor's Problems
 * GET /api/instructor/problems
 */
export const getInstructorProblems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get problems created by this instructor
    const { data: problems, error: problemsError } = await supabaseAdmin
      .from('problems')
      .select(`
        id,
        slug,
        title,
        description_markdown,
        difficulty,
        time_limit_ms,
        memory_limit_kb,
        input_format,
        output_format,
        constraints,
        is_published,
        is_premium,
        acceptance_rate,
        total_submissions,
        total_accepted,
        created_at,
        updated_at,
        topic_id
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (problemsError) {
      console.error('Error fetching instructor problems:', problemsError);
      return res.status(500).json({ error: 'Failed to fetch problems' });
    }

    // Get submission stats for each problem
    const enrichedProblems = await Promise.all(
      (problems || []).map(async (problem: any) => {
        // Get submission count
        const { count: submissionCount } = await supabaseAdmin
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('problem_id', problem.id);

        // Get unique users who submitted
        const { data: uniqueUsers } = await supabaseAdmin
          .from('submissions')
          .select('user_id')
          .eq('problem_id', problem.id);

        const uniqueUserCount = new Set(uniqueUsers?.map((s: any) => s.user_id)).size;

        // Get test case count
        const { count: testCaseCount } = await supabaseAdmin
          .from('test_cases')
          .select('*', { count: 'exact', head: true })
          .eq('problem_id', problem.id);

        // Get topic and course name
        let topicName = null;
        let courseName = null;
        if (problem.topic_id) {
          const { data: topic } = await supabaseAdmin
            .from('topics')
            .select('id, title, course_id')
            .eq('id', problem.topic_id)
            .single();
          
          if (topic) {
            topicName = topic.title;
            if (topic.course_id) {
              const { data: course } = await supabaseAdmin
                .from('courses')
                .select('title')
                .eq('id', topic.course_id)
                .single();
              courseName = course?.title || null;
            }
          }
        }

        return {
          ...problem,
          submissionCount: submissionCount || 0,
          uniqueSubmitters: uniqueUserCount,
          testCaseCount: testCaseCount || 0,
          courseName,
          topicName
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedProblems
    });
  } catch (error) {
    console.error('Error fetching instructor problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

/**
 * Get Instructor's Problem Detail with Submissions
 * GET /api/instructor/problems/:id
 */
export const getInstructorProblemDetail = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const problemId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the problem (verify ownership)
    const { data: problem, error: problemError } = await supabaseAdmin
      .from('problems')
      .select(`
        id,
        slug,
        title,
        description_markdown,
        difficulty,
        time_limit_ms,
        memory_limit_kb,
        input_format,
        output_format,
        constraints,
        editorial_markdown,
        is_published,
        is_premium,
        acceptance_rate,
        total_submissions,
        total_accepted,
        created_at,
        updated_at,
        metadata,
        topic_id
      `)
      .eq('id', problemId)
      .eq('created_by', userId)
      .single();

    if (problemError || !problem) {
      console.error('Problem not found:', { problemId, userId, error: problemError });
      return res.status(404).json({ error: 'Problem not found or access denied' });
    }

    console.log(`Found problem: ${problem.title} (${problem.id})`);

    // Get problem IO
    const { data: problemIO, error: problemIOError } = await supabaseAdmin
      .from('problem_io')
      .select('input, output')
      .eq('problem_id', problemId)
      .single();

    if (problemIOError) {
      console.log('Problem IO error or not found:', problemIOError);
    } else {
      console.log('Problem IO:', problemIO ? 'Found' : 'Not found');
    }

    // Get test cases
    const { data: testCases } = await supabaseAdmin
      .from('test_cases')
      .select('id, name, input, expected_output, is_sample, display_order, points')
      .eq('problem_id', problemId)
      .order('display_order', { ascending: true });

    // Get all submissions with user info and execution details
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select(`
        id,
        user_id,
        code,
        status,
        points,
        passed,
        submitted_at,
        completed_at,
        execution_summary,
        language_id,
        languages (
          name,
          version
        ),
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('problem_id', problemId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
    }
    console.log(`Found ${submissions?.length || 0} submissions for problem ${problemId}`);

    // Get code runs for each submission to determine test case results
    const submissionsWithDetails = await Promise.all(
      (submissions || []).map(async (submission: any) => {
        const { data: codeRuns } = await supabaseAdmin
          .from('code_runs')
          .select('test_case_id, status, execution_time_ms, memory_kb')
          .eq('submission_id', submission.id);

        const passedCount = codeRuns?.filter((r: any) => 
          r.status === 'passed' || 
          r.status === 'accepted' || 
          r.status === 'PASSED' || 
          r.status === 'ACCEPTED'
        ).length || 0;
        const totalTests = testCases?.length || 0;

        // Extract execution time from execution_summary if available
        const execSummary = submission.execution_summary;
        const executionTimeMs = execSummary?.total_execution_time_ms || 
          codeRuns?.reduce((sum: number, r: any) => sum + (r.execution_time_ms || 0), 0) || 0;
        const memoryKb = codeRuns?.reduce((sum: number, r: any) => sum + (r.memory_kb || 0), 0) || 0;

        return {
          id: submission.id,
          userId: submission.user_id,
          userName: submission.users?.display_name || 'Unknown',
          userEmail: submission.users?.email,
          userAvatar: submission.users?.avatar_url,
          language: submission.languages?.name || 'Unknown',
          languageVersion: submission.languages?.version,
          status: submission.status,
          score: submission.points || 0,
          executionTimeMs,
          memoryKb,
          submittedAt: submission.submitted_at,
          testCasesPassed: passedCount,
          testCasesTotal: totalTests,
          code: submission.code
        };
      })
    );

    // Calculate statistics
    const totalSubmissions = submissions?.length || 0;
    const uniqueUsers = new Set(submissions?.map((s: any) => s.user_id)).size;
    const acceptedCount = submissions?.filter((s: any) => s.status === 'accepted' || s.status === 'ACCEPTED').length || 0;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedCount / totalSubmissions * 100).toFixed(1) : 0;

    // Calculate status breakdown
    const statusBreakdown: Record<string, number> = {};
    submissions?.forEach((s: any) => {
      const status = s.status?.toLowerCase() || 'unknown';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    // Calculate language breakdown
    const languageBreakdown: Record<string, number> = {};
    submissions?.forEach((s: any) => {
      const language = s.languages?.name || 'Unknown';
      languageBreakdown[language] = (languageBreakdown[language] || 0) + 1;
    });

    // Calculate average metrics from submissionsWithDetails (which has computed values)
    const totalExecutionTime = submissionsWithDetails?.reduce((sum: number, s: any) => sum + (s.executionTimeMs || 0), 0) || 0;
    const totalMemory = submissionsWithDetails?.reduce((sum: number, s: any) => sum + (s.memoryKb || 0), 0) || 0;
    const totalScore = submissions?.reduce((sum: number, s: any) => sum + (s.points || 0), 0) || 0;
    
    const avgExecutionTime = totalSubmissions > 0 ? totalExecutionTime / totalSubmissions : 0;
    const avgMemoryUsed = totalSubmissions > 0 ? totalMemory / totalSubmissions : 0;
    const avgScore = totalSubmissions > 0 ? totalScore / totalSubmissions : 0;

    // Get topic and course name
    let topicName = null;
    let courseName = null;
    if (problem.topic_id) {
      const { data: topic } = await supabaseAdmin
        .from('topics')
        .select('id, title, course_id')
        .eq('id', problem.topic_id)
        .single();
      
      if (topic) {
        topicName = topic.title;
        if (topic.course_id) {
          const { data: course } = await supabaseAdmin
            .from('courses')
            .select('title')
            .eq('id', topic.course_id)
            .single();
          courseName = course?.title || null;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        problem: {
          ...problem,
          courseName,
          topicName
        },
        problemIO,
        testCases: testCases || [],
        submissions: submissionsWithDetails,
        statistics: {
          totalSubmissions,
          uniqueUsers,
          acceptedSubmissions: acceptedCount,
          acceptanceRate: parseFloat(acceptanceRate as string) || 0,
          testCaseCount: testCases?.length || 0,
          statusBreakdown,
          languageBreakdown,
          avgExecutionTime,
          avgMemoryUsed,
          avgScore
        }
      }
    });
  } catch (error) {
    console.error('Error fetching instructor problem detail:', error);
    res.status(500).json({ error: 'Failed to fetch problem detail' });
  }
};