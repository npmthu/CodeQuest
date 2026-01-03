import { supabaseAdmin } from '../config/database';
import { 
  SubscriptionPlan, 
  Subscription, 
  SubscriptionWithPlan, 
  FeatureCheckResult,
  CheckoutRequest,
  CheckoutResponse
} from '../types/subscription';

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
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPlans:', error);
      throw error;
    }
  }

  async getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch plan: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getPlanBySlug:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch user subscription: ${error.message}`);
      }

      return data as SubscriptionWithPlan;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      throw error;
    }
  }

  async subscribeUser(userId: string, planSlug: string): Promise<CheckoutResponse> {
    try {
      const plan = await this.getPlanBySlug(planSlug);
      if (!plan) {
        return {
          success: false,
          message: 'Plan does not exist'
        };
      }

      const existingSubscription = await this.getUserSubscription(userId);
      
      if (existingSubscription) {
        return await this.handleUpgradeDowngrade(userId, plan, existingSubscription);
      } else {
        return await this.createNewSubscription(userId, plan);
      }
    } catch (error) {
      console.error('Error in subscribeUser:', error);
      return {
        success: false,
        message: 'Failed to process subscription'
      };
    }
  }

  private async handleUpgradeDowngrade(
    userId: string, 
    newPlan: SubscriptionPlan, 
    existingSubscription: SubscriptionWithPlan
  ): Promise<CheckoutResponse> {
    try {
      const isUpgrade = (newPlan.price_monthly || 0) > (existingSubscription.plan.price_monthly || 0);
      
      const periodEnd = new Date();
      if (isUpgrade) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setTime(existingSubscription.current_period_end ? 
          new Date(existingSubscription.current_period_end).getTime() : 
          periodEnd.getTime()
        );
      }

      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan_id: newPlan.id,
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: data as SubscriptionWithPlan,
        message: isUpgrade ? 'Subscription upgraded successfully' : 'Subscription will be downgraded at period end'
      };
    } catch (error) {
      console.error('Error in handleUpgradeDowngrade:', error);
      return {
        success: false,
        message: 'Failed to update subscription'
      };
    }
  }

  private async createNewSubscription(userId: string, plan: SubscriptionPlan): Promise<CheckoutResponse> {
    try {
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          provider: 'mock',
          provider_subscription_id: `mock_${Date.now()}`,
          provider_metadata: { simulated: true }
        })
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: data as SubscriptionWithPlan,
        message: 'Subscription created successfully'
      };
    } catch (error) {
      console.error('Error in createNewSubscription:', error);
      return {
        success: false,
        message: 'Failed to create subscription'
      };
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return {
          success: false,
          message: 'No active subscription found'
        };
      }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }

      return {
        success: true,
        message: 'Subscription will be canceled at period end'
      };
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription'
      };
    }
  }

  async canAccessFeature(userId: string, featureName: string): Promise<FeatureCheckResult> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        const freePlan = await this.getPlanBySlug('free');
        return {
          canAccess: false,
          reason: 'No active subscription',
          plan: freePlan || undefined
        };
      }

      const featureValue = subscription.plan.features[featureName];
      
      if (featureValue === undefined || featureValue === null) {
        return {
          canAccess: false,
          reason: `Feature '${featureName}' not found in plan`,
          plan: subscription.plan,
          subscription
        };
      }

      if (typeof featureValue === 'boolean') {
        return {
          canAccess: featureValue,
          plan: subscription.plan,
          subscription
        };
      }

      if (typeof featureValue === 'number') {
        return {
          canAccess: featureValue > 0,
          reason: featureValue > 0 ? `Limit: ${featureValue}` : 'Limit reached',
          plan: subscription.plan,
          subscription
        };
      }

      return {
        canAccess: !!featureValue,
        plan: subscription.plan,
        subscription
      };
    } catch (error) {
      console.error('Error in canAccessFeature:', error);
      return {
        canAccess: false,
        reason: 'Failed to check feature access'
      };
    }
  }

  async getFeatureLimit(userId: string, featureName: string): Promise<number> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return 0;
      }

      const featureValue = subscription.plan.features[featureName];
      
      if (typeof featureValue === 'number') {
        return featureValue;
      }
      
      return typeof featureValue === 'boolean' && featureValue ? -1 : 0;
    } catch (error) {
      console.error('Error in getFeatureLimit:', error);
      return 0;
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();
