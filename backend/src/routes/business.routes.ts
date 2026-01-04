import { Router } from "express";
import { supabaseAuth } from "../middleware/auth";
import {
  getBusinessStats,
  getBusinessLeaderboard,
  getBusinessAnalytics,
  getBusinessCohorts,
  getBusinessActivities,
  addLearner,
  updateLearner,
  deleteLearner,
  exportLearners,
  importLearners,
  addInstructor,
  updateInstructor,
  deleteInstructor,
} from "../controllers/businessController";

const router = Router();

// All business routes require authentication
router.use(supabaseAuth);

// Business partner dashboard endpoints
router.get("/stats", getBusinessStats);
router.get("/leaderboard", getBusinessLeaderboard);
router.get("/analytics", getBusinessAnalytics);
router.get("/cohorts", getBusinessCohorts);
router.get("/activities", getBusinessActivities);

// Learners
router.post("/learners", addLearner);
router.patch("/learners/:id", updateLearner);
router.delete("/learners/:id", deleteLearner);
router.post("/learners/export", exportLearners);
router.post("/learners/import", importLearners);

// Instructors
router.post("/instructors", addInstructor);
router.patch("/instructors/:id", updateInstructor);
router.delete("/instructors/:id", deleteInstructor);

export default router;
