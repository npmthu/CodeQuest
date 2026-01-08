import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscriptionService, SubscriptionWithPlan, SubscriptionPlan, FeatureCheckResult } from '../services/subscription.service';

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  userSubscription: SubscriptionWithPlan | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  subscribe: (planSlug: string) => Promise<SubscriptionWithPlan>;
  cancelSubscription: () => Promise<void>;
  checkFeatureAccess: (featureName: string) => Promise<FeatureCheckResult>;
  getFeatureLimit: (featureName: string) => Promise<number>;
  isSubscribed: boolean;
  currentPlan: SubscriptionPlan | null;
  canUpgrade: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const plansData = await subscriptionService.getPlans();
      setPlans(plansData);
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
      setError(err.message || 'Failed to load subscription plans');
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const subscription = await subscriptionService.getUserSubscription();
      setUserSubscription(subscription);
    } catch (err: any) {
      // Don't set error for 404 (no subscription)
      if (!err.message.includes('404')) {
        console.error('Failed to fetch user subscription:', err);
        setError(err.message || 'Failed to load subscription');
      }
      setUserSubscription(null);
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchPlans(), fetchUserSubscription()]);
    setLoading(false);
  };

  const subscribe = async (planSlug: string): Promise<SubscriptionWithPlan> => {
    try {
      setError(null);
      const newSubscription = await subscriptionService.subscribe(planSlug);
      setUserSubscription(newSubscription);
      return newSubscription;
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      setError(err.message || 'Failed to subscribe');
      throw err;
    }
  };

  const cancelSubscription = async () => {
    try {
      setError(null);
      await subscriptionService.cancelSubscription();
      // Refresh subscription to show updated cancel_at_period_end status
      await fetchUserSubscription();
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    }
  };

  const checkFeatureAccess = async (featureName: string): Promise<FeatureCheckResult> => {
    try {
      return await subscriptionService.checkFeatureAccess(featureName);
    } catch (err: any) {
      console.error('Failed to check feature access:', err);
      return {
        canAccess: false,
        reason: err.message || 'Failed to check feature access'
      };
    }
  };

  const getFeatureLimit = async (featureName: string): Promise<number> => {
    try {
      return await subscriptionService.getFeatureLimit(featureName);
    } catch (err: any) {
      console.error('Failed to get feature limit:', err);
      return 0;
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const isSubscribed = !!userSubscription;
  const currentPlan = userSubscription?.plan || null;
  const canUpgrade = plans.some(plan => 
    (plan.price_monthly || 0) > (currentPlan?.price_monthly || 0)
  );

  const value: SubscriptionContextType = {
    plans,
    userSubscription,
    loading,
    error,
    refreshSubscription,
    subscribe,
    cancelSubscription,
    checkFeatureAccess,
    getFeatureLimit,
    isSubscribed,
    currentPlan,
    canUpgrade
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;