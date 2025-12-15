import { Router } from "express";
import { supabaseAuth } from "../middleware/auth";
import {
  getCertificateHandler,
  getCourseCertificateHandler,
  claimCertificateHandler,
  getMyCertificatesHandler,
} from "../controllers/certificateController";

const router = Router();

// Get all certificates for authenticated user
router.get("/", supabaseAuth, getMyCertificatesHandler);

// Claim a certificate for a completed course
router.post("/claim", supabaseAuth, claimCertificateHandler);

// Get certificate for a specific course (for authenticated user)
router.get("/course/:courseId", supabaseAuth, getCourseCertificateHandler);

// Get certificate by ID (public - for viewing/sharing)
router.get("/:id", getCertificateHandler);

export default router;
