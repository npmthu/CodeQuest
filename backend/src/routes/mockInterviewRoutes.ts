import { Router } from "express";
import { MockInterviewController } from "../controllers/mockInterviewController";
import { FeedbackController } from "../controllers/feedbackController";
import { AIController } from "../controllers/mockAIController";
import { supabaseAuth } from "../middleware/auth";

const router = Router();

// Initialize controllers
const interviewController = new MockInterviewController();
const feedbackController = new FeedbackController();
const aiController = new AIController();

// Mock Interview Session Routes
router.post(
  "/sessions",
  supabaseAuth,
  interviewController.createSession.bind(interviewController)
);
router.get(
  "/sessions",
  interviewController.getSessions.bind(interviewController)
);
router.get(
  "/sessions/:id",
  interviewController.getSessionById.bind(interviewController)
);

// Booking Routes
router.post(
  "/book",
  supabaseAuth,
  interviewController.bookSession.bind(interviewController)
);
router.post(
  "/bookings",
  supabaseAuth,
  interviewController.bookSession.bind(interviewController)
); // Alternative endpoint
router.get(
  "/my-bookings",
  supabaseAuth,
  interviewController.getMyBookings.bind(interviewController)
);

// Session Management Routes
router.post(
  "/start-session",
  supabaseAuth,
  interviewController.startSession.bind(interviewController)
);
router.post(
  "/join-session",
  supabaseAuth,
  interviewController.joinSession.bind(interviewController)
);
router.post(
  "/sessions/:id/end",
  supabaseAuth,
  interviewController.endSession.bind(interviewController)
); // Fixes TC_CONDUCT_04
router.post(
  "/sessions/:id/cancel",
  supabaseAuth,
  interviewController.cancelSession.bind(interviewController)
); // TC-06-05
router.post(
  "/report-no-show",
  supabaseAuth,
  interviewController.reportNoShow.bind(interviewController)
);

// Feedback Routes
router.post(
  "/feedback",
  supabaseAuth,
  feedbackController.createFeedback.bind(feedbackController)
);
router.get(
  "/my-feedback",
  supabaseAuth,
  feedbackController.getMyFeedback.bind(feedbackController)
);
router.get(
  "/feedback/:id",
  supabaseAuth,
  feedbackController.getFeedbackById.bind(feedbackController)
);
router.put(
  "/feedback/:id",
  supabaseAuth,
  feedbackController.updateFeedback.bind(feedbackController)
);
router.get(
  "/instructor-feedback-stats",
  supabaseAuth,
  feedbackController.getInstructorFeedbackStats.bind(feedbackController)
);

// AI Assistance Routes
router.post(
  "/ai/suggest-topics",
  supabaseAuth,
  aiController.suggestTopics.bind(aiController)
);
router.post(
  "/ai/summary",
  supabaseAuth,
  aiController.generateSummary.bind(aiController)
);
router.post(
  "/ai/mindmap",
  supabaseAuth,
  aiController.generateMindmap.bind(aiController)
);
router.post(
  "/ai/hint",
  supabaseAuth,
  aiController.generateHint.bind(aiController)
);
router.post(
  "/ai/code-review",
  supabaseAuth,
  aiController.reviewCode.bind(aiController)
);
router.get(
  "/ai/usage-stats",
  supabaseAuth,
  aiController.getAIUsageStats.bind(aiController)
);

export default router;
