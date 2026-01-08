import { subscriptionService } from '../services/subscriptionService';
import { FeatureCheckResult } from '../types/subscription';

export class FeatureAccessControl {
  static async requireFeature(
    userId: string, 
    featureName: string, 
    context?: string
  ): Promise<FeatureCheckResult> {
    const result = await subscriptionService.canAccessFeature(userId, featureName);
    
    if (!result.canAccess) {
      console.warn(`Feature access denied: ${featureName} for user ${userId}. Reason: ${result.reason}`);
    }
    
    return result;
  }

  static async requireFeatureOrThrow(
    userId: string, 
    featureName: string, 
    context?: string
  ): Promise<void> {
    const result = await this.requireFeature(userId, featureName, context);
    
    if (!result.canAccess) {
      const message = result.reason || `Access to feature '${featureName}' is not available in your current plan`;
      throw new Error(message);
    }
  }

  static async getUsageLimit(userId: string, featureName: string): Promise<number> {
    return await subscriptionService.getFeatureLimit(userId, featureName);
  }

  static async checkUsageLimit(
    userId: string, 
    featureName: string, 
    currentUsage: number
  ): Promise<{ allowed: boolean; remaining: number; message?: string }> {
    const limit = await this.getUsageLimit(userId, featureName);
    
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }
    
    if (limit === 0) {
      return { 
        allowed: false, 
        remaining: 0, 
        message: `Feature '${featureName}' is not available in your current plan` 
      };
    }
    
    const remaining = Math.max(0, limit - currentUsage);
    const allowed = remaining > 0;
    
    return {
      allowed,
      remaining,
      message: allowed ? undefined : `You've reached the limit for ${featureName} (${limit}/${limit})`
    };
  }

  static async consumeUsage(
    userId: string, 
    featureName: string, 
    amount: number = 1
  ): Promise<{ success: boolean; remaining: number; message?: string }> {
    const limitCheck = await this.checkUsageLimit(userId, featureName, amount);
    
    if (!limitCheck.allowed) {
      return {
        success: false,
        remaining: limitCheck.remaining,
        message: limitCheck.message
      };
    }
    
    return {
      success: true,
      remaining: limitCheck.remaining - amount
    };
  }
}

export const featureAccess = FeatureAccessControl;
