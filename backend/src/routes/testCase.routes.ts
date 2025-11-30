import express from 'express';
import { listTestCases} from '../controllers/testCaseController';

const router = express.Router({ mergeParams: true });

// If testcases are nested under /problems/:problemId/testcases, use router in problem routes.
// For direct endpoints:
router.get('/', listTestCases);         // GET /api/testcases or GET /api/problems/:problemId/testcases
//router.post('/', createTestCase);      // POST /api/testcases

export default router;