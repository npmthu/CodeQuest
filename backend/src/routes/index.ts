import express from "express";
import userRoutes from "./user.routes";
import problemRoutes from "./problem.routes";
import submissionRoutes from "./submission.routes";
import testCaseRoutes from "./testCase.routes";
import languageRoutes from "./language.routes";
import authRoutes from "./auth.routes";
import lessonRoutes from "./lesson.routes";
import topicRoutes from "./topic.routes";
import courseRoutes from "./course.routes";
import enrollmentRoutes from "./enrollment.routes";
import instructorRoutes from "./instructor.routes";
import businessRoutes from "./business.routes";
import forumRoutes from "./forum.routes";
import interviewRoutes from "./interview.routes";
import notesRoutes from "./notes.routes";
import quizRoutes from "./quiz.routes";
import aiRoutes from "./ai.routes";
import certificateRoutes from "./certificate.routes";
import subscriptionRoutes from "./subscriptionRoutes";
import mockInterviewRoutes from "./mockInterviewRoutes";
import profileRoutes from "./profile.routes";
import reportRoutes from "./report.routes";
import adminRoutes from "./admin.routes";
import { triggerReminderJob } from "../workers/interviewReminderJob";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/problems", problemRoutes);
router.use("/submissions", submissionRoutes);
router.use("/testcases", testCaseRoutes);
router.use("/languages", languageRoutes);
router.use("/auth", authRoutes);
router.use("/lessons", lessonRoutes);
router.use("/topics", topicRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/instructor", instructorRoutes);
router.use("/business", businessRoutes);
router.use("/forum", forumRoutes);
router.use("/interview", interviewRoutes);
router.use("/notes", notesRoutes);
router.use("/quizzes", quizRoutes);
router.use("/ai", aiRoutes);
router.use("/certificates", certificateRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/mock-interviews", mockInterviewRoutes);
router.use("/profile", profileRoutes);
router.use("/reports", reportRoutes);
router.use("/admin", adminRoutes);

// Admin endpoint to manually trigger reminder job (dev/testing only)
router.post("/admin/trigger-reminders", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }

  try {
    await triggerReminderJob();
    res.json({ success: true, message: "Interview reminder job triggered" });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger reminder job" });
  }
});

export default router;
