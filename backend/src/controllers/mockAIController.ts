import { Request, Response } from 'express';
import { MockInterviewService } from '../services/mockInterviewService';
import { AuthRequest } from '../middleware/auth';

export class AIController {
  private interviewService: MockInterviewService;

  constructor() {
    this.interviewService = new MockInterviewService();
  }

  /**
   * POST /api/ai/suggest-topics
   * Generate topic suggestions for learning
   */
  async suggestTopics(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { topic, difficulty_level } = req.body;
      
      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Topic is required and must be a string'
        });
      }

      const request = {
        type: 'topic_suggestion' as const,
        content: topic,
        context: { difficulty_level }
      };

      const result = await this.interviewService.generateAISuggestion(user.id, request);

      console.log('🤖 Topic suggestions generated:', {
        userId: user.id,
        topic,
        suggestionsCount: result.suggestions?.length || 0
      });

      res.json({
        success: true,
        data: {
          topic,
          suggestions: result.suggestions || [],
          difficulty_level
        },
        message: `Generated ${result.suggestions?.length || 0} topic suggestions`
      });
    } catch (error: any) {
      console.error('❌ Error generating topic suggestions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate topic suggestions'
      });
    }
  }

  /**
   * POST /api/ai/summary
   * Generate a summary of provided content
   */
  async generateSummary(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { content, max_length } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Content is required and must be a string'
        });
      }

      if (content.length < 50) {
        return res.status(400).json({
          success: false,
          error: 'Content must be at least 50 characters long'
        });
      }

      const request = {
        type: 'summary' as const,
        content,
        context: { max_length }
      };

      const result = await this.interviewService.generateAISuggestion(user.id, request);

      console.log('📝 Summary generated:', {
        userId: user.id,
        contentLength: content.length,
        summaryLength: result?.length || 0
      });

      res.json({
        success: true,
        data: {
          original_content_length: content.length,
          summary: result,
          max_length
        },
        message: 'Summary generated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error generating summary:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate summary'
      });
    }
  }

  /**
   * POST /api/ai/mindmap
   * Generate a mindmap structure from content
   */
  async generateMindmap(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { content, max_depth } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Content is required and must be a string'
        });
      }

      if (content.length < 50) {
        return res.status(400).json({
          success: false,
          error: 'Content must be at least 50 characters long for mindmap generation'
        });
      }

      // 🔒 SUBSCRIPTION CHECK: Verify user can access AI mindmap feature
      const { subscriptionService } = await import('../services/subscriptionService');
      const featureCheck = await subscriptionService.canAccessFeature(user.id, 'aiMindmap');
      
      if (!featureCheck.canAccess) {
        console.warn('🚫 AI mindmap access denied:', {
          userId: user.id,
          reason: featureCheck.reason,
          plan: featureCheck.plan?.name || 'No plan'
        });
        
        return res.status(403).json({
          success: false,
          error: 'Premium feature required',
          message: featureCheck.reason || 'AI mindmap generation requires a Pro subscription',
          upgradeUrl: '/api/subscription/plans',
          featureName: 'aiMindmap',
          currentPlan: featureCheck.plan?.name || 'Free'
        });
      }

      const request = {
        type: 'mindmap' as const,
        content,
        context: { max_depth }
      };

      const result = await this.interviewService.generateAISuggestion(user.id, request);

      console.log('🗺️  Mindmap generated:', {
        userId: user.id,
        contentLength: content.length,
        plan: featureCheck.plan?.name,
        hasRoot: !!result?.root,
        childrenCount: result?.children?.length || 0
      });

      res.json({
        success: true,
        data: {
          mindmap: result,
          max_depth,
          subscription_info: {
            plan: featureCheck.plan?.name,
            features: featureCheck.plan?.features
          }
        },
        message: 'Mindmap generated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error generating mindmap:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate mindmap'
      });
    }
  }

  /**
   * POST /api/ai/hint
   * Generate a progressive hint for a problem
   */
  async generateHint(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { problem_context, current_code, hint_level } = req.body;
      
      if (!problem_context || typeof problem_context !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Problem context is required and must be a string'
        });
      }

      const validHintLevels = ['gentle', 'moderate', 'strong'];
      if (hint_level && !validHintLevels.includes(hint_level)) {
        return res.status(400).json({
          success: false,
          error: `Hint level must be one of: ${validHintLevels.join(', ')}`
        });
      }

      const request = {
        type: 'hint' as const,
        content: problem_context,
        context: { current_code, hint_level: hint_level || 'gentle' }
      };

      const result = await this.interviewService.generateAISuggestion(user.id, request);

      console.log('💡 Hint generated:', {
        userId: user.id,
        hintLevel: hint_level || 'gentle',
        hasCurrentCode: !!current_code
      });

      res.json({
        success: true,
        data: {
          hint: result.hint,
          hint_level: hint_level || 'gentle',
          problem_context_length: problem_context.length
        },
        message: 'Hint generated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error generating hint:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate hint'
      });
    }
  }

  /**
   * POST /api/ai/code-review
   * Review code and provide feedback
   */
  async reviewCode(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { code, language, problem_description } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Code is required and must be a string'
        });
      }

      if (code.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Code must be at least 10 characters long'
        });
      }

      // 🔒 SUBSCRIPTION CHECK: Verify user can access AI code review feature
      const { subscriptionService } = await import('../services/subscriptionService');
      const featureCheck = await subscriptionService.canAccessFeature(user.id, 'aiGeneration');
      
      if (!featureCheck.canAccess) {
        console.warn('🚫 AI code review access denied:', {
          userId: user.id,
          reason: featureCheck.reason,
          plan: featureCheck.plan?.name || 'No plan'
        });
        
        return res.status(403).json({
          success: false,
          error: 'Premium feature required',
          message: featureCheck.reason || 'AI code review requires a Pro subscription',
          upgradeUrl: '/api/subscription/plans',
          featureName: 'aiGeneration',
          currentPlan: featureCheck.plan?.name || 'Free'
        });
      }

      const request = {
        type: 'code_review' as const,
        content: code,
        context: { language: language || 'javascript', problem_description }
      };

      const result = await this.interviewService.generateAISuggestion(user.id, request);

      console.log('🔍 Code review completed:', {
        userId: user.id,
        codeLength: code.length,
        language: language || 'javascript',
        plan: featureCheck.plan?.name,
        qualityScore: result?.qualityRating
      });

      res.json({
        success: true,
        data: {
          review: result,
          code_info: {
            language: language || 'javascript',
            lines_of_code: code.split('\n').length,
            character_count: code.length
          },
          subscription_info: {
            plan: featureCheck.plan?.name,
            features: featureCheck.plan?.features
          }
        },
        message: 'Code review completed successfully'
      });
    } catch (error: any) {
      console.error('❌ Error reviewing code:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to review code'
      });
    }
  }

  /**
   * GET /api/ai/usage-stats
   * Get AI usage statistics for the current user
   */
  async getAIUsageStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      // This would require implementing usage statistics in the service
      // For now, return mock data
      const mockStats = {
        total_requests: 0,
        requests_by_type: {
          topic_suggestion: 0,
          summary: 0,
          mindmap: 0,
          hint: 0,
          code_review: 0
        },
        total_tokens_used: 0,
        average_processing_time_ms: 0,
        recent_requests: []
      };

      res.json({
        success: true,
        data: mockStats,
        message: 'AI usage statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('❌ Error fetching AI usage stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch AI usage statistics'
      });
    }
  }
}
