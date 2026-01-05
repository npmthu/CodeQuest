// Submission routes - /submissions/*
import express from "express";
import { submitCode } from "../controllers/submissionController";
import { supabaseAuth } from "../middleware/auth";
const router = express.Router();

router.post("/", supabaseAuth, submitCode); // POST /api/submissions

export default router;