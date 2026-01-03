import { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Lock, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({ 
  featureName, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { checkFeatureAccess, currentPlan, loading } = useSubscription();
  const [featureCheck, setFeatureCheck] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setChecking(true);
        const result = await checkFeatureAccess(featureName);
        setFeatureCheck(result);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setFeatureCheck({ canAccess: false, reason: 'Failed to check access' });
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [featureName, checkFeatureAccess]);

  if (checking || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (featureCheck?.canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt featureName={featureName} currentPlanName={currentPlan?.name} />;
  }

  return null;
}

interface UpgradePromptProps {
  featureName: string;
  currentPlanName?: string;
  onUpgrade?: () => void;
}

export function UpgradePrompt({ featureName, currentPlanName, onUpgrade }: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
        <p className="text-muted-foreground mb-4">
          {featureName} is available with our Pro plan or higher.
        </p>
        {currentPlanName && (
          <p className="text-sm text-muted-foreground mb-4">
            Current plan: <span className="font-medium">{currentPlanName}</span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button onClick={handleUpgrade} className="w-full">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/pricing')} className="w-full">
          View All Plans
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
        <p>✨ Unlock unlimited AI features</p>
        <p>📊 Advanced analytics & insights</p>
        <p>🎯 Priority support</p>
      </div>
    </Card>
  );
}

interface FeatureBadgeProps {
  featureName: string;
  plan?: string;
}

export function FeatureBadge({ featureName, plan = 'Pro' }: FeatureBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-xs">
      <Crown className="w-3 h-3 text-blue-600" />
      <span className="text-blue-700 font-medium">{plan}</span>
    </div>
  );
}

export function FeatureLock({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-gray-100 rounded-full`}>
      <Lock className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
}