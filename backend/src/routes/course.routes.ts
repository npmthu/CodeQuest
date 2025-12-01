import { Router } from 'express';
import { listCoursesHandler, getCourseHandler } from '../controllers/courseController';

const router = Router();

router.get('/', listCoursesHandler); // GET /api/courses
router.get('/:id', getCourseHandler); // GET /api/courses/:id

export default router;
