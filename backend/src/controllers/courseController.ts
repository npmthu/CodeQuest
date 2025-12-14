import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/database';

/**
 * List all courses
 * GET /api/courses
 */
export async function listCoursesHandler(req: Request, res: Response) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    // Get topic count for each course
    const enrichedCourses = await Promise.all(
      (courses || []).map(async (course: any) => {
        const { count } = await supabaseAdmin
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        return {
          ...course,
          topic_count: count || 0
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
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
      throw error;
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (user) {
      const { data: enrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single();
      
      isEnrolled = !!enrollment;
    }

    // Only return topics if user is enrolled
    let topics = [];
    if (isEnrolled) {
      const { data: topicsData } = await supabaseAdmin
        .from('topics')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: true });
      
      topics = topicsData || [];
    }

    return res.json({ 
      success: true, 
      data: {
        ...course,
        topics,
        isEnrolled
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
