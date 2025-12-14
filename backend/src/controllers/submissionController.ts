import { Request, Response } from 'express';
import * as submissionService from '../services/submissionService';
import { executeCode } from '../services/codeExecutionService';
import { supabaseAdmin } from '../config/database';

export const submitCode = async (req: Request, res: Response) => {
  try {
    // Accept both problemId and problem_id for compatibility
    const { problemId, problem_id, code, language } = req.body;
    const userId = (req as any).user?.id || req.body.userId || null;
    
    const actualProblemId = problemId || problem_id;
    
    if (!actualProblemId) {
      return res.status(400).json({ 
        success: false, 
        error: 'problem_id or problemId is required' 
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'language is required'
      });
    }

    // Extract language name - handle both string and object
    let languageName = '';
    if (typeof language === 'string') {
      languageName = language;
    } else if (typeof language === 'object' && language.name) {
      languageName = language.name;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid language format'
      });
    }

    // Look up language_id from language name (case-insensitive)
    const { data: langData, error: langError } = await supabaseAdmin
      .from('languages')
      .select('id')
      .ilike('name', `%${languageName}%`)
      .limit(1)
      .maybeSingle();

    if (langError || !langData?.id) {
      console.warn(`Language "${languageName}" not found in database. Falling back to null.`);
      // Log available languages for debugging
      const { data: allLangs } = await supabaseAdmin.from('languages').select('name');
      console.log('Available languages:', allLangs?.map((l: any) => l.name) || []);
    }

    let languageId = langData?.id || null;

    const payload = {
      problem_id: actualProblemId,
      user_id: userId,
      code,
      language_id: languageId,
      status: 'pending',
    };

    const record = await submissionService.createSubmission(payload);

    // Execute code (real execution with Piston API)
    const executionResult = await executeCode(code, languageName, actualProblemId);

    // Update submission with execution results
    const updated = await submissionService.updateSubmission(record.id, {
      status: executionResult.status || 'ACCEPTED',
      passed: executionResult.passed || false,
      execution_summary: executionResult,
      completed_at: new Date().toISOString(),
    } as any);

    res.json({ 
      success: true, 
      data: {
        submission_id: record.id,
        status: 'done',
        result: executionResult // Include result in response for frontend
      }
    });
  } catch (err: any) {
    console.error('submitCode error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};