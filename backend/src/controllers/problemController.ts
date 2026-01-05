// Problem controller - list/get problems, create/update (instructor)
import { Request, Response } from 'express';
import * as problemService from '../services/problemService';
import { mapProblemToListItemDTO, mapProblemToDetailDTO } from '../mappers/problem.mapper';

export async function listProblemsHandler(req: Request, res: Response) {
  try {
    const topicId = req.query.topic_id as string | undefined;
    const problems = await problemService.listProblems(50, true, topicId);
    const problemsDTO = problems.map(p => mapProblemToListItemDTO(p));
    res.json({ success: true, data: problemsDTO });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProblemHandler(req: Request, res: Response) {
  try {
    const problem = await problemService.getProblem(req.params.id);
    if (!problem) return res.status(404).json({ success: false, error: 'Not found' });
    const problemDTO = mapProblemToDetailDTO(problem);
    res.json({ success: true, data: problemDTO });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}