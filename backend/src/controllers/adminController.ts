// Admin controller - system stats, content approval, user management
import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  /**
   * POST /api/admin/plans
   * Create a new subscription plan - Fixes TC_ADMIN_SUB_01
   */
  async createPlan(req: AuthRequest, res: Response) {
    try {
      const planData = req.body;
      
      // Validate required fields
      if (!planData.name || !planData.slug) {
        return res.status(400).json({
          success: false,
          error: 'Plan name and slug are required'
        });
      }

      // Validate price is not negative - Fixes TC_ADMIN_SUB_03
      if (planData.price_monthly < 0 || planData.price_yearly < 0) {
        return res.status(400).json({
          success: false,
          error: 'Price cannot be negative'
        });
      }

      // Validate features JSON
      if (!planData.features || typeof planData.features !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Features must be a valid JSON object'
        });
      }

      const plan = await subscriptionService.createPlan(planData);

      console.log('📋 Admin created subscription plan:', {
        planId: plan.id,
        name: plan.name,
        slug: plan.slug
      });

      res.status(201).json({
        success: true,
        data: plan,
        message: 'Subscription plan created successfully'
      });
    } catch (error: any) {
      console.error('❌ Error creating subscription plan:', error);
      
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Plan with this slug already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subscription plan'
      });
    }
  }

  /**
   * POST /api/admin/users/:userId/cancel-subscription
   * Cancel a user's subscription - Fixes TC_ADMIN_SUB_02 and TC_ADMIN_SUB_05
   */
  async cancelUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const result = await subscriptionService.adminCancelSubscription(userId);

      console.log('🚫 Admin cancelled user subscription:', {
        userId: userId,
        adminId: req.user?.id,
        reason: result.message
      });

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('❌ Error cancelling user subscription:', error);
      
      if (error.message.includes('No active subscription')) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found for this user'
        });
      }

      if (error.message.includes('already expired')) {
        return res.status(400).json({
          success: false,
          error: 'Subscription is already expired'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel subscription'
      });
    }
  }

  /**
   * PUT /api/admin/plans/:id
   * Update an existing subscription plan
   */
  async updatePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID is required'
        });
      }

      // Validate price is not negative
      if (updateData.price_monthly < 0 || updateData.price_yearly < 0) {
        return res.status(400).json({
          success: false,
          error: 'Price cannot be negative'
        });
      }

      const plan = await subscriptionService.updatePlan(id, updateData);

      console.log('📝 Admin updated subscription plan:', {
        planId: id,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        data: plan,
        message: 'Subscription plan updated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error updating subscription plan:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update subscription plan'
      });
    }
  }

  /**
   * GET /api/admin/users/:userId/subscription
   * Get a user's subscription details
   */
  async getUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const subscription = await subscriptionService.getUserSubscription(userId);

      res.json({
        success: true,
        data: subscription
      });
    } catch (error: any) {
      console.error('❌ Error fetching user subscription:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user subscription'
      });
    }
  }

  /**
   * POST /api/admin/users/:userId/extend-subscription
   * Extend a user's subscription period
   */
  async extendUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { days } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      if (!days || days <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid extension period (days) is required'
        });
      }

      const result = await subscriptionService.extendSubscription(userId, days);

      console.log('📅 Admin extended user subscription:', {
        userId: userId,
        days: days,
        adminId: req.user?.id
      });

      res.json({
        success: true,
        data: result.subscription,
        message: `Subscription extended by ${days} days`
      });
    } catch (error: any) {
      console.error('❌ Error extending user subscription:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to extend subscription'
      });
    }
  }
}
