import express from 'express';
import userRoutes from './user.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import testCaseRoutes from './testCase.routes';
import languageRoutes from './language.routes';
import authRoutes from './auth.routes';
import lessonRoutes from './lesson.routes';
import topicRoutes from './topic.routes';
import instructorRoutes from './instructor.routes';
import businessRoutes from './business.routes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/testcases', testCaseRoutes);
router.use('/languages', languageRoutes);
router.use('/auth', authRoutes);
router.use('/lessons', lessonRoutes);
router.use('/topics', topicRoutes);
router.use('/instructor', instructorRoutes);
router.use('/business', businessRoutes);

export default router;