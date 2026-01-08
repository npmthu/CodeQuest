import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

export default function SubscriptionStatus() {
  const navigate = useNavigate();
  const { 
    userSubscription, 
    currentPlan, 
    loading, 
    error,
    isSubscribed,
    canUpgrade
  } = useSubscription();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading subscription...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to load subscription</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!isSubscribed || !currentPlan) {
    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Free Plan</h3>
              <p className="text-sm text-muted-foreground">Limited features</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              Free
            </Badge>
            <Button size="sm" onClick={() => navigate('/pricing')}>
              Upgrade
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const isCanceled = userSubscription?.cancel_at_period_end;
  const nextBillingDate = userSubscription?.current_period_end 
    ? new Date(userSubscription.current_period_end).toLocaleDateString()
    : 'Unknown';

  return (
    <Card className={`p-6 ${isCanceled ? 'bg-orange-50 border-orange-200' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentPlan.name === 'Business Plan' ? 'bg-purple-600' : 
            currentPlan.name === 'Pro Plan' ? 'bg-blue-600' : 'bg-green-600'
          }`}>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{currentPlan.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isCanceled 
                ? `Access until ${nextBillingDate}` 
                : `Next billing: ${nextBillingDate}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={
            isCanceled ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
          }>
            {isCanceled ? 'Canceled' : 'Active'}
          </Badge>
          {canUpgrade && (
            <Button size="sm" variant="outline" onClick={() => navigate('/pricing')}>
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Show key features */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <div className="flex flex-wrap gap-2">
          {currentPlan.features.aiGeneration && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              AI Generation
            </span>
          )}
          {currentPlan.features.aiMindmap && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              AI Mindmap
            </span>
          )}
          {currentPlan.features.advancedAnalytics && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Advanced Analytics
            </span>
          )}
          {currentPlan.features.prioritySupport && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Priority Support
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
