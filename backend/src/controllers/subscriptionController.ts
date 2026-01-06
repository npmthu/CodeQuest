import { Request, Response } from "express";
import { subscriptionService } from "../services/subscriptionService";
import { CheckoutRequest } from "../types/subscription";
import { supabaseAdmin } from "../config/database";
import { AuthRequest } from "../middleware/auth";

export class SubscriptionController {
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await subscriptionService.getPlans();
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error("Error in getPlans:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch subscription plans",
      });
    }
  }

  async getUserSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error("Error in getUserSubscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user subscription",
      });
    }
  }

  async checkout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { planSlug, paymentMethod } = req.body as CheckoutRequest;

      if (!planSlug) {
        return res.status(400).json({
          success: false,
          message: "Plan slug is required",
        });
      }

      const result = await subscriptionService.subscribeUser(userId, planSlug);

      if (result.success) {
        res.json({
          success: true,
          data: result.subscription,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in checkout:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process checkout",
      });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await subscriptionService.cancelSubscription(userId);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in cancelSubscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel subscription",
      });
    }
  }

  async checkFeatureAccess(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { featureName } = req.params;

      if (!featureName) {
        return res.status(400).json({
          success: false,
          message: "Feature name is required",
        });
      }

      const result = await subscriptionService.canAccessFeature(
        userId,
        featureName
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in checkFeatureAccess:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check feature access",
      });
    }
  }

  async getFeatureLimit(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { featureName } = req.params;

      if (!featureName) {
        return res.status(400).json({
          success: false,
          message: "Feature name is required",
        });
      }

      const limit = await subscriptionService.getFeatureLimit(
        userId,
        featureName
      );

      res.json({
        success: true,
        data: { featureName, limit },
      });
    } catch (error) {
      console.error("Error in getFeatureLimit:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get feature limit",
      });
    }
  }
  /**
   * POST /api/subscription/upload-payment-proof
   * User submits payment proof for subscription upgrade
   */
  async uploadPaymentProof(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const {
        plan_id,
        billing_cycle,
        amount,
        proof_image_url,
        payment_method,
        transaction_id,
        notes,
      } = req.body;

      // Validate required fields
      if (!plan_id || !billing_cycle || !amount || !proof_image_url) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: plan_id, billing_cycle, amount, proof_image_url",
        });
      }

      // Validate plan exists
      const { data: plan, error: planError } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("id", plan_id)
        .eq("is_active", true)
        .single();

      if (planError || !plan) {
        return res.status(404).json({
          success: false,
          message: "Invalid subscription plan",
        });
      }

      // Validate amount matches plan price
      const expectedAmount =
        billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
      if (Number(amount) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: `Amount must be ${expectedAmount} for ${billing_cycle} billing`,
        });
      }

      // Check for pending payment proofs
      const { data: pendingProofs } = await supabaseAdmin
        .from("payment_proofs")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "pending");

      if (pendingProofs && pendingProofs.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a pending payment proof. Please wait for admin review.",
        });
      }

      // Create payment proof record
      const { data: proof, error: createError } = await supabaseAdmin
        .from("payment_proofs")
        .insert({
          user_id: userId,
          plan_id,
          billing_cycle,
          amount: Number(amount),
          proof_image_url,
          payment_method: payment_method || null,
          transaction_id: transaction_id || null,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (createError) throw createError;

      res.json({
        success: true,
        data: proof,
        message:
          "Payment proof submitted successfully. Please wait for admin verification.",
      });
    } catch (error: any) {
      console.error("Error in uploadPaymentProof:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to submit payment proof",
      });
    }
  }

  /**
   * GET /api/subscription/payment-proofs
   * Get user's payment proof history
   */
  async getUserPaymentProofs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { data: proofs, error } = await supabaseAdmin
        .from("payment_proofs")
        .select(
          `
          *,
          plan:subscription_plans(id, name, slug, price_monthly, price_yearly),
          reviewer:reviewed_by(email, display_name)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: proofs || [],
      });
    } catch (error: any) {
      console.error("Error in getUserPaymentProofs:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch payment proofs",
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
