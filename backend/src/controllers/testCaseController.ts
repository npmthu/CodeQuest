import { Request, Response } from 'express';
import * as tcService from '../services/testCaseService';

export async function listTestCases(req: Request, res: Response) {
  try {
    const tcs = await tcService.listTestCasesByProblem(req.params.problemId);
    res.json(tcs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}