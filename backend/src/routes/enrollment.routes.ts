import { Router } from 'express';
import { 
  getMyEnrollmentsHandler,
  enrollInCourseHandler,
  checkEnrollmentHandler,
  unenrollFromCourseHandler
} from '../controllers/enrollmentController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();

// All enrollment routes require authentication
router.use(supabaseAuth);

router.get('/', getMyEnrollmentsHandler); // GET /api/enrollments - Get my enrollments
router.post('/:courseId', enrollInCourseHandler); // POST /api/enrollments/:courseId - Enroll in course
router.get('/check/:courseId', checkEnrollmentHandler); // GET /api/enrollments/check/:courseId - Check enrollment
router.delete('/:courseId', unenrollFromCourseHandler); // DELETE /api/enrollments/:courseId - Unenroll

export default router;
