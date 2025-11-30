import express from 'express';
import userRoutes from './user.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import testCaseRoutes from './testCase.routes';
import languageRoutes from './language.routes';
import authRoutes from './auth.routes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/testcases', testCaseRoutes);
router.use('/languages', languageRoutes);
router.use('/auth', authRoutes);

export default router;