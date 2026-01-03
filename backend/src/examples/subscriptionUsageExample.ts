/**
 * Example: How to integrate subscription-based feature access in existing APIs
 * 
 * This file demonstrates how to use the subscription system to restrict access
 * to premium features like AI mindmap generation.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import { featureAccess } from '../utils/featureAccess';

/**
 * Example: Protected AI Mindmap Generation with Subscription Check
 * 
 * This shows how to modify an existing API endpoint to check subscription access
 * before allowing premium features.
 */
export async function generateMindmapWithSubscriptionCheck(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { content } = req.body;

    // Validate request body
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Content is required and cannot be empty' 
      });
    }

    // 🔒 SUBSCRIPTION CHECK: Verify user can access AI mindmap feature
    const featureCheck = await featureAccess.requireFeature(user.id, 'aiMindmap', 'mindmap generation');
    
    if (!featureCheck.canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Premium feature required',
        message: featureCheck.reason || 'AI mindmap generation requires a premium subscription',
        // Optional: Include upgrade information
        upgradeUrl: '/api/plans',
        featureName: 'aiMindmap'
      });
    }

    // ✅ User has access - proceed with mindmap generation
    console.log('🗺️  Mindmap generation request:', {
      userId: user.id,
      contentLength: content.length,
      plan: featureCheck.plan?.name || 'Unknown'
    });

    const mindmap = await aiService.generateMindmap(content);

    console.log('✅ Mindmap generated successfully for premium user:', {
      userId: user.id,
      root: mindmap?.root || 'N/A',
      childrenCount: mindmap?.children?.length || 0
    });

    res.json({
      success: true,
      data: {
        mindmap,
        // Optional: Include subscription info for UI
        subscriptionInfo: {
          plan: featureCheck.plan?.name,
          features: featureCheck.plan?.features
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating mindmap:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate mindmap',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while generating the mindmap'
    });
  }
}

/**
 * Example: Usage limit check for features with quotas
 * 
 * This demonstrates how to check if a user has reached their usage limit
 * for features like AI generation, submissions, etc.
 */
export async function checkUsageLimitExample(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { featureName, currentUsage } = req.body;

    if (!featureName) {
      return res.status(400).json({ 
        success: false,
        error: 'Feature name is required' 
      });
    }

    // Check if user can use more of this feature
    const usageCheck = await featureAccess.checkUsageLimit(
      user.id, 
      featureName, 
      currentUsage || 0
    );

    if (!usageCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Usage limit exceeded',
        message: usageCheck.message,
        remaining: usageCheck.remaining,
        featureName
      });
    }

    // User can proceed - consume one usage
    const consumeResult = await featureAccess.consumeUsage(user.id, featureName, 1);

    if (!consumeResult.success) {
      return res.status(429).json({
        success: false,
        error: 'Usage limit reached',
        message: consumeResult.message,
        remaining: consumeResult.remaining
      });
    }

    res.json({
      success: true,
      message: 'Usage consumed successfully',
      remaining: consumeResult.remaining,
      featureName
    });

  } catch (error: any) {
    console.error('❌ Error checking usage limit:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to check usage limit',
      message: error.message
    });
  }
}

/**
 * Example: Middleware for automatic feature access checking
 * 
 * This shows how to create reusable middleware for protecting routes
 */
export function requireFeature(featureName: string, context?: string) {
  return async (req: AuthRequest, res: Response, next: any) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const featureCheck = await featureAccess.requireFeature(user.id, featureName, context);
      
      if (!featureCheck.canAccess) {
        return res.status(403).json({
          success: false,
          error: 'Premium feature required',
          message: featureCheck.reason || `Access to '${featureName}' requires a premium subscription`,
          upgradeUrl: '/api/plans',
          featureName
        });
      }

      // Attach subscription info to request for downstream use
      (req as any).subscription = {
        plan: featureCheck.plan,
        features: featureCheck.plan?.features
      };

      next();
    } catch (error: any) {
      console.error(`❌ Error checking feature access for ${featureName}:`, error);
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify feature access',
        message: error.message
      });
    }
  };
}

// Example usage in routes:
// router.post('/mindmap', supabaseAuth, requireFeature('aiMindmap'), generateMindmapWithSubscriptionCheck);
