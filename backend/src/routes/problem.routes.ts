// Problem routes - /problems/*
import express from "express";
import { listProblemsHandler, getProblemHandler } from "../controllers/problemController";
const router = express.Router();

router.get("/", listProblemsHandler); // GET /api/problems
router.get("/:id", getProblemHandler); // GET /api/problems/:id

export default router;