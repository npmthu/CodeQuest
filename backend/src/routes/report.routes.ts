import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

// Business Analytics Report Routes
router.get('/business/pdf', supabaseAuth, reportController.generateBusinessPDF.bind(reportController));
router.get('/business/csv', supabaseAuth, reportController.generateBusinessCSV.bind(reportController));

// Instructor Analytics Report Routes
router.get('/instructor/pdf', supabaseAuth, reportController.generateInstructorPDF.bind(reportController));
router.get('/instructor/csv', supabaseAuth, reportController.generateInstructorCSV.bind(reportController));

export default router;
