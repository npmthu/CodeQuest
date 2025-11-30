// Submission routes - /submissions/*
import express from "express";
import { submitCode } from "../controllers/submissionController";
const router = express.Router();

router.post("/", submitCode); // POST /api/submissions

export default router;