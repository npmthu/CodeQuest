import { supabaseAdmin } from "../config/database";
import {
  SubscriptionPlan,
  Subscription,
  SubscriptionWithPlan,
  FeatureCheckResult,
  CheckoutRequest,
  CheckoutResponse,
} from "../types/subscription";

export class SubscriptionService {
  private static instance: SubscriptionService;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPlans:", error);
      throw error;
    }
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch all plans: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllPlans:", error);
      throw error;
    }
  }

  async getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Failed to fetch plan: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getPlanBySlug:", error);
      throw error;
    }
  }

  async getUserSubscription(
    userId: string
  ): Promise<SubscriptionWithPlan | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Failed to fetch user subscription: ${error.message}`);
      }

      return data as SubscriptionWithPlan;
    } catch (error) {
      console.error("Error in getUserSubscription:", error);
      throw error;
    }
  }

  async subscribeUser(
    userId: string,
    planSlug: string
  ): Promise<CheckoutResponse> {
    try {
      const plan = await this.getPlanBySlug(planSlug);
      if (!plan) {
        return {
          success: false,
          message: "Plan does not exist",
        };
      }

      const existingSubscription = await this.getUserSubscription(userId);

      if (existingSubscription) {
        return await this.handleUpgradeDowngrade(
          userId,
          plan,
          existingSubscription
        );
      } else {
        return await this.createNewSubscription(userId, plan);
      }
    } catch (error) {
      console.error("Error in subscribeUser:", error);
      return {
        success: false,
        message: "Failed to process subscription",
      };
    }
  }

  private async handleUpgradeDowngrade(
    userId: string,
    newPlan: SubscriptionPlan,
    existingSubscription: SubscriptionWithPlan
  ): Promise<CheckoutResponse> {
    try {
      const isUpgrade =
        (newPlan.price_monthly || 0) >
        (existingSubscription.plan.price_monthly || 0);

      const periodEnd = new Date();
      if (isUpgrade) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setTime(
          existingSubscription.current_period_end
            ? new Date(existingSubscription.current_period_end).getTime()
            : periodEnd.getTime()
        );
      }

      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan_id: newPlan.id,
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscription.id)
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: data as SubscriptionWithPlan,
        message: isUpgrade
          ? "Subscription upgraded successfully"
          : "Subscription will be downgraded at period end",
      };
    } catch (error) {
      console.error("Error in handleUpgradeDowngrade:", error);
      return {
        success: false,
        message: "Failed to update subscription",
      };
    }
  }

  private async createNewSubscription(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<CheckoutResponse> {
    try {
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          status: "active",
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          provider: "mock",
          provider_subscription_id: `mock_${Date.now()}`,
          provider_metadata: { simulated: true },
        })
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: data as SubscriptionWithPlan,
        message: "Subscription created successfully",
      };
    } catch (error) {
      console.error("Error in createNewSubscription:", error);
      return {
        success: false,
        message: "Failed to create subscription",
      };
    }
  }

  async cancelSubscription(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return {
          success: false,
          message: "No active subscription found",
        };
      }

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }

      return {
        success: true,
        message: "Subscription will be canceled at period end",
      };
    } catch (error) {
      console.error("Error in cancelSubscription:", error);
      return {
        success: false,
        message: "Failed to cancel subscription",
      };
    }
  }

  async canAccessFeature(
    userId: string,
    featureName: string
  ): Promise<FeatureCheckResult> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        const freePlan = await this.getPlanBySlug("free");
        return {
          canAccess: false,
          reason: "No active subscription",
          plan: freePlan || undefined,
        };
      }

      const featureValue = subscription.plan.features[featureName];

      if (featureValue === undefined || featureValue === null) {
        return {
          canAccess: false,
          reason: `Feature '${featureName}' not found in plan`,
          plan: subscription.plan,
          subscription,
        };
      }

      if (typeof featureValue === "boolean") {
        return {
          canAccess: featureValue,
          plan: subscription.plan,
          subscription,
        };
      }

      if (typeof featureValue === "number") {
        return {
          canAccess: featureValue > 0,
          reason: featureValue > 0 ? `Limit: ${featureValue}` : "Limit reached",
          plan: subscription.plan,
          subscription,
        };
      }

      return {
        canAccess: !!featureValue,
        plan: subscription.plan,
        subscription,
      };
    } catch (error) {
      console.error("Error in canAccessFeature:", error);
      return {
        canAccess: false,
        reason: "Failed to check feature access",
      };
    }
  }

  async getFeatureLimit(userId: string, featureName: string): Promise<number> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        const freePlan = await this.getPlanBySlug("free");
        return freePlan?.features[featureName] || 0;
      }

      const featureValue = subscription.plan.features[featureName];
      return typeof featureValue === "number" ? featureValue : 0;
    } catch (error) {
      console.error("Error in getFeatureLimit:", error);
      return 0;
    }
  }

  // Admin methods - Fixes TC_ADMIN_SUB_01, TC_ADMIN_SUB_02, TC_ADMIN_SUB_05
  async createPlan(planData: any): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .insert({
          ...planData,
          is_active: planData.is_active !== false, // Default to true
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error creating plan:", error);
      throw new Error(`Failed to create plan: ${error.message}`);
    }
  }

  async adminCancelSubscription(userId: string): Promise<{ message: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        throw new Error("No active subscription found for this user");
      }

      // Check if already expired - Fixes TC_ADMIN_SUB_05
      const currentDate = new Date();
      const periodEnd = new Date(subscription.current_period_end || "");

      if (periodEnd < currentDate) {
        throw new Error("Subscription is already expired");
      }

      // Check if already canceled
      if (subscription.cancel_at_period_end) {
        throw new Error("Subscription is already canceled");
      }

      // Set cancel_at_period_end to true - Fixes TC_ADMIN_SUB_02
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (error) throw error;

      return {
        message:
          "Subscription canceled successfully. Access will end at the current period end.",
      };
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  async updatePlan(planId: string, updateData: any): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .update(updateData)
        .eq("id", planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error updating plan:", error);
      throw new Error(`Failed to update plan: ${error.message}`);
    }
  }

  async extendSubscription(
    userId: string,
    days: number
  ): Promise<{ subscription: SubscriptionWithPlan }> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        throw new Error("No active subscription found for this user");
      }

      // Calculate new end date
      const currentEnd = new Date(subscription.current_period_end || "");
      const newEnd = new Date(currentEnd);
      newEnd.setDate(newEnd.getDate() + days);

      // Update subscription
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          current_period_end: newEnd.toISOString(),
          cancel_at_period_end: false, // Remove cancellation if any
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id)
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        subscription: data as SubscriptionWithPlan,
      };
    } catch (error: any) {
      console.error("Error extending subscription:", error);
      throw error;
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();
