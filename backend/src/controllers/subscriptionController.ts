import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { CheckoutRequest } from '../types/subscription';

export class SubscriptionController {
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await subscriptionService.getPlans();
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error in getPlans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans'
      });
    }
  }

  async getUserSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const subscription = await subscriptionService.getUserSubscription(userId);
      
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user subscription'
      });
    }
  }

  async checkout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { planSlug, paymentMethod } = req.body as CheckoutRequest;
      
      if (!planSlug) {
        return res.status(400).json({
          success: false,
          message: 'Plan slug is required'
        });
      }

      const result = await subscriptionService.subscribeUser(userId, planSlug);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.subscription,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process checkout'
      });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await subscriptionService.cancelSubscription(userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  async checkFeatureAccess(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { featureName } = req.params;
      
      if (!featureName) {
        return res.status(400).json({
          success: false,
          message: 'Feature name is required'
        });
      }

      const result = await subscriptionService.canAccessFeature(userId, featureName);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in checkFeatureAccess:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feature access'
      });
    }
  }

  async getFeatureLimit(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { featureName } = req.params;
      
      if (!featureName) {
        return res.status(400).json({
          success: false,
          message: 'Feature name is required'
        });
      }

      const limit = await subscriptionService.getFeatureLimit(userId, featureName);
      
      res.json({
        success: true,
        data: { featureName, limit }
      });
    } catch (error) {
      console.error('Error in getFeatureLimit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feature limit'
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
