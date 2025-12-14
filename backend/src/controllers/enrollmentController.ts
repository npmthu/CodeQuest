import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/database';

/**
 * Get user's enrolled courses
 * GET /api/enrollments
 */
export async function getMyEnrollmentsHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }

    return res.json({ success: true, data: enrollments });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Enroll in a course
 * POST /api/enrollments/:courseId
 */
export async function enrollInCourseHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    const { courseId } = req.params;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if already enrolled
    const { data: existing } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'enrolled',
        enrolled_at: new Date().toISOString(),
        progress: {}
      })
      .select(`
        *,
        course:courses(*)
      `)
      .single();

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      throw enrollError;
    }

    return res.status(201).json({ success: true, data: enrollment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Check if user is enrolled in a course
 * GET /api/enrollments/check/:courseId
 */
export async function checkEnrollmentHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    const { courseId } = req.params;

    if (!user) {
      return res.json({ success: true, data: { enrolled: false } });
    }

    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, enrolled_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    return res.json({ 
      success: true, 
      data: { 
        enrolled: !!enrollment,
        enrollment: enrollment || null
      } 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Unenroll from a course
 * DELETE /api/enrollments/:courseId
 */
export async function unenrollFromCourseHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    const { courseId } = req.params;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { error } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }

    return res.json({ success: true, message: 'Successfully unenrolled from course' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
