import { supabase } from "../../lib/supabaseClient";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  provider?: string;
  provider_subscription_id?: string;
  provider_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
}

export interface FeatureCheckResult {
  canAccess: boolean;
  reason?: string;
  plan?: SubscriptionPlan;
  subscription?: Subscription;
}

class SubscriptionService {
  private API_BASE =
    (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:3000/api";

  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`${this.API_BASE}/subscription/plans`, {
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  }

  async getUserSubscription(): Promise<SubscriptionWithPlan | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${this.API_BASE}/subscription/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      throw error;
    }
  }

  async subscribe(planSlug: string): Promise<SubscriptionWithPlan> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${this.API_BASE}/subscription/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planSlug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to subscribe: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error subscribing:", error);
      throw error;
    }
  }

  async cancelSubscription(): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${this.API_BASE}/subscription/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            `Failed to cancel subscription: ${response.statusText}`
        );
      }

      // Success - no return data needed
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  async checkFeatureAccess(featureName: string): Promise<FeatureCheckResult> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return {
          canAccess: false,
          reason: "User not authenticated",
        };
      }

      const response = await fetch(
        `${this.API_BASE}/subscription/features/${featureName}/check`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to check feature access: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error checking feature access:", error);
      return {
        canAccess: false,
        reason: "Failed to check feature access",
      };
    }
  }

  async getFeatureLimit(featureName: string): Promise<number> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return 0;
      }

      const response = await fetch(
        `${this.API_BASE}/subscription/features/${featureName}/limit`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get feature limit: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data?.limit || 0;
    } catch (error) {
      console.error("Error getting feature limit:", error);
      return 0;
    }
  }

  async uploadPaymentProof(data: {
    plan_id: string;
    billing_cycle: "monthly" | "yearly";
    amount: number;
    proof_image_url: string;
    payment_method?: string;
    transaction_id?: string;
    notes?: string;
  }): Promise<any> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${this.API_BASE}/subscription/upload-payment-proof`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload payment proof");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      throw error;
    }
  }

  async getUserPaymentProofs(): Promise<any[]> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${this.API_BASE}/subscription/payment-proofs`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment proofs");
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching payment proofs:", error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
