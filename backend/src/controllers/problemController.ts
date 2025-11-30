// Problem controller - list/get problems, create/update (instructor)
import { Request, Response } from 'express';
import * as problemService from '../services/problemService';

export async function listProblemsHandler(req: Request, res: Response) {
  try {
    const problems = await problemService.listProblems();
    res.json(problems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProblemHandler(req: Request, res: Response) {
  try {
    const problem = await problemService.getProblem(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Not found' });
    res.json(problem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}