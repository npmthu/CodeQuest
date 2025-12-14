/**
 * AI Controller - Handle AI-powered features (code review, notebook assistance)
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import * as submissionService from '../services/submissionService';

export class AIController {
  /**
   * POST /api/ai/code-review - Generate AI code review for a submission
   */
  async reviewCode(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      console.log('AI review request received:', {
        submissionId: req.body?.submissionId,
        language: req.body?.language,
        problemTitle: req.body?.problemTitle,
        userId: user?.id,
      });
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { submissionId, code: providedCode, language, problemTitle } = req.body;

      if (!submissionId || !language) {
        return res.status(400).json({ 
          error: 'Missing required fields: submissionId, language' 
        });
      }

      let code = providedCode;
      // If code not provided by client, try to fetch it from the submission record
      if (!code) {
        try {
          const submission = await submissionService.getSubmission(submissionId);
          if (submission && submission.code) {
            code = submission.code;
            console.log(`Fetched code from submission ${submissionId}`);
          } else if (submission && submission.execution_summary && submission.execution_summary.code) {
            code = submission.execution_summary.code;
            console.log(`Fetched code from submission.execution_summary ${submissionId}`);
          }
        } catch (fetchErr: any) {
          console.warn(`Could not fetch submission ${submissionId}: ${fetchErr.message}`);
        }
      }

      // Check if review already exists
      let existingReview;
      try {
        existingReview = await aiService.getCodeReviewBySubmission(submissionId);
        if (existingReview) {
          console.log(`✅ Returning cached review for submission ${submissionId}`);
          return res.json({
            success: true,
            cached: true,
            data: {
              reviewId: existingReview.id,
              summary: existingReview.summary,
              issues: existingReview.improvements || [],
              suggestions: existingReview.strengths || [],
              qualityRating: Math.round((existingReview.overall_score || 0) / 20),
              overallScore: existingReview.overall_score,
            }
          });
        }
      } catch (checkError: any) {
        console.warn(`Could not check for existing review: ${checkError.message}`);
      }

      // Generate new review
      let review: any;
      const startTime = Date.now();
      
      try {
        review = await aiService.reviewCode(code, language, problemTitle);
        console.log(`✅ AI review generated for submission ${submissionId}`);
      } catch (aiError: any) {
        console.error(`❌ AI review generation failed: ${aiError.message}`);
        // Fallback: create a basic review structure if Gemini fails
        review = {
          summary: 'AI review service temporarily unavailable',
          issues: ['Unable to generate AI review at this time'],
          suggestions: ['Please try again later'],
          qualityRating: 0,
        };
      }

      const processingTimeMs = Date.now() - startTime;

      // Save to database
      const overallScore = review.qualityRating * 20;
      
      let contentId, reviewId;
      try {
        contentId = await aiService.saveGeneratedContent(
          user.id,
          'code_review',
          'submission',
          submissionId,
          review
        );
        console.log(`✅ Saved generated content: ${contentId}`);
      } catch (saveError: any) {
        console.error(`❌ Failed to save generated content: ${saveError.message}`);
        contentId = undefined;
      }

      try {
        reviewId = await aiService.saveCodeReview(
          submissionId,
          review.summary,
          review.issues || [],      // issues -> strengths in DB (problems found)
          review.suggestions || [],  // suggestions -> improvements in DB (improvements to make)
          overallScore,
          processingTimeMs
        );
        console.log(`✅ Saved code review: ${reviewId}`);
      } catch (saveError: any) {
        console.error(`❌ Failed to save code review: ${saveError.message}`);
        reviewId = undefined;
      }

      res.json({
        success: true,
        cached: false,
        data: {
          contentId,
          reviewId,
          summary: review.summary,
          issues: review.issues,
          suggestions: review.suggestions,
          qualityRating: review.qualityRating,
          overallScore,
          processingTimeMs,
        }
      });
    } catch (error: any) {
      console.error('Error generating code review:', error);
      res.status(500).json({ 
        error: 'Failed to generate code review',
        message: error.message 
      });
    }
  }

  /**
   * GET /api/ai/code-review/:submissionId - Get existing code review
   */
  async getCodeReview(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { submissionId } = req.params;
      const review = await aiService.getCodeReviewBySubmission(submissionId);

      if (!review) {
        return res.status(404).json({ error: 'Code review not found' });
      }

      res.json({
        success: true,
        data: {
          reviewId: review.id,
          summary: review.summary,
          issues: review.improvements || [],
          suggestions: review.strengths || [],
          qualityRating: Math.round((review.overall_score || 0) / 20),
          overallScore: review.overall_score,
          createdAt: review.created_at,
        }
      });
    } catch (error: any) {
      console.error('Error fetching code review:', error);
      res.status(500).json({ error: 'Failed to fetch code review' });
    }
  }

  /**
   * POST /api/ai/notebook-assist - Get AI assistance for notebook/learning questions
   */
  async notebookAssist(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { question, context, sourceType, sourceId } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const result = await aiService.assistNotebook(question, context);

      if (sourceType && sourceId) {
        await aiService.saveGeneratedContent(
          user.id,
          'notebook_assist',
          sourceType,
          sourceId,
          { question, ...result }
        );
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in notebook assist:', error);
      res.status(500).json({ 
        error: 'Failed to get AI assistance',
        message: error.message 
      });
    }
  }
}

export default new AIController();
