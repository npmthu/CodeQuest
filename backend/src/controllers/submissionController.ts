import { Request, Response } from 'express';
import * as submissionService from '../services/submissionService';
import { executeCode } from '../services/codeExecutionService';

export const submitCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = (req as any).user?.id || req.body.userId || null;

    const payload = {
      problem_id: problemId,
      user_id: userId,
      code,
      language,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const record = await submissionService.createSubmission(payload);

    const result = await executeCode(code, language, problemId);

    const updated = await submissionService.updateSubmission(record.id, {
      result,
      status: 'done',
      updated_at: new Date().toISOString(),
    } as any);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('submitCode error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};