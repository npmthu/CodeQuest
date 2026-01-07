import { Router } from "express";
import { supabaseAuth } from "../middleware/auth";
import {
  getBusinessStats,
  getBusinessLeaderboard,
  getBusinessAnalytics,
  getBusinessCohorts,
  getBusinessActivities,
  getBusinessCourses,
  createBusinessCourse,
  updateBusinessCourse,
  deleteBusinessCourse,
  getBusinessLearners,
  addLearner,
  updateLearner,
  deleteLearner,
  exportLearners,
  importLearners,
  getBusinessInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
  getBusinessSettings,
  updateBusinessSettings,
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

// Courses
router.get("/courses", getBusinessCourses);
router.post("/courses", createBusinessCourse);
router.patch("/courses/:id", updateBusinessCourse);
router.delete("/courses/:id", deleteBusinessCourse);

// Learners
router.get("/learners", getBusinessLearners);
router.post("/learners", addLearner);
router.patch("/learners/:id", updateLearner);
router.delete("/learners/:id", deleteLearner);
router.post("/learners/export", exportLearners);
router.post("/learners/import", importLearners);

// Instructors
router.get("/instructors", getBusinessInstructors);
router.post("/instructors", addInstructor);
router.patch("/instructors/:id", updateInstructor);
router.delete("/instructors/:id", deleteInstructor);

// Settings
router.get("/settings", getBusinessSettings);
router.patch("/settings", updateBusinessSettings);

export default router;
