import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, X, ArrowLeft, Loader2, Crown, Star, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";
import { toast } from "sonner";

export default function PricingPage() {
  const navigate = useNavigate();
  const { 
    plans, 
    userSubscription, 
    loading, 
    error, 
    subscribe, 
    cancelSubscription,
    refreshSubscription,
    currentPlan,
    isSubscribed 
  } = useSubscription();

  const handleSubscribe = async (planSlug: string) => {
    try {
      const subscription = await subscribe(planSlug);
      toast.success(`Successfully subscribed to ${subscription.plan.name}!`);
      await refreshSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    }
  };

  const handleCancel = async () => {
    if (!userSubscription) return;
    
    try {
      await cancelSubscription();
      toast.success('Subscription will be canceled at the end of the billing period');
      await refreshSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const getPlanFeatures = (plan: any) => {
    const features = plan.features || {};
    
    // Convert backend features to frontend format
    const featureList = [
      { 
        name: "Access to basic lessons", 
        included: true 
      },
      { 
        name: `${features.maxSubmissions === -1 ? 'Unlimited' : features.maxSubmissions || 50} coding problems`, 
        included: true 
      },
      { 
        name: "Community forum access", 
        included: true 
      },
      { 
        name: `Personal notebook (${features.maxNotes === -1 ? 'unlimited' : features.maxNotes || 5} notes)`, 
        included: true 
      },
      { 
        name: "Progress tracking", 
        included: true 
      },
      { 
        name: `AI code review (${features.maxSubmissions === -1 ? 'unlimited' : features.maxSubmissions || 5}/month)`, 
        included: features.aiGeneration || false 
      },
      { 
        name: "AI mindmap generation", 
        included: features.aiMindmap || false 
      },
      { 
        name: "Advanced lessons & tutorials", 
        included: features.advancedAnalytics || false 
      },
      { 
        name: "Mock interview practice", 
        included: features.advancedAnalytics || false 
      },
      { 
        name: "Progress analytics", 
        included: features.advancedAnalytics || false 
      },
      { 
        name: "Priority support", 
        included: features.prioritySupport || false 
      },
      { 
        name: "Downloadable certificates", 
        included: features.prioritySupport || false 
      },
      { 
        name: "Custom themes", 
        included: features.customThemes || false 
      },
      { 
        name: `Export formats: ${features.exportFormats?.join(', ') || 'txt'}`, 
        included: (features.exportFormats?.length || 0) > 1 
      },
      { 
        name: `Collaboration (${features.collaborationLimit === -1 ? 'unlimited' : features.collaborationLimit || 0} users)`, 
        included: (features.collaborationLimit || 0) > 0 
      }
    ];

    return featureList;
  };

  const getPlanButton = (plan: any) => {
    const isCurrentPlan = currentPlan?.slug === plan.slug;
    const isUpgrade = (plan.price_monthly || 0) > (currentPlan?.price_monthly || 0);
    const isDowngrade = (plan.price_monthly || 0) < (currentPlan?.price_monthly || 0);
    const isPopular = plan.name === 'Pro'; // Determine popular plan by name

    if (loading) {
      return (
        <Button disabled className="w-full mb-6">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (isCurrentPlan) {
      if (userSubscription?.cancel_at_period_end) {
        return (
          <Button variant="outline" className="w-full mb-6" disabled>
            Resubscribe (Canceled)
          </Button>
        );
      }
      return (
        <div className="space-y-2">
          <Button variant="outline" className="w-full mb-2" disabled>
            Current Plan
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-red-600 hover:text-red-700"
            onClick={handleCancel}
          >
            Cancel Subscription
          </Button>
        </div>
      );
    }

    if (!isSubscribed && plan.price_monthly === 0) {
      return (
        <Button variant="outline" className="w-full mb-6" disabled>
          Current Plan
        </Button>
      );
    }

    const buttonText = isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscribe';
    const buttonVariant = isPopular ? "default" : "outline";

    return (
      <Button
        className={`w-full mb-6 ${
          buttonVariant === "default" ? "bg-blue-600 hover:bg-blue-700" : ""
        }`}
        variant={buttonVariant}
        onClick={() => handleSubscribe(plan.slug)}
      >
        {buttonText} to {plan.name}
      </Button>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Error Loading Plans</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Plans</h3>
            <p className="text-muted-foreground">Please wait while we load subscription plans...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Current Subscription Status */}
        {isSubscribed && currentPlan && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Current Plan: {currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userSubscription?.cancel_at_period_end 
                      ? `Canceled - Access until ${new Date(userSubscription.current_period_end || '').toLocaleDateString()}`
                      : `Next billing: ${new Date(userSubscription?.current_period_end || '').toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </Card>
        )}

        <div className="text-center mb-12">
          <h2 className="mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your learning journey. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.slug === plan.slug;
            const isPopular = plan.name === 'Pro';
            
            return (
              <Card
                key={plan.id}
                className={`p-8 relative transition-all duration-200 hover:shadow-lg ${
                  isPopular ? "border-2 border-blue-500 shadow-xl" : ""
                } ${
                  isCurrentPlan ? "ring-2 ring-green-500 bg-green-50" : ""
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600">
                    Current Plan
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-4xl font-bold">
                      {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
                    </span>
                    {plan.price_monthly && plan.price_monthly > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {getPlanButton(plan)}

                <div className="space-y-3">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "" : "text-muted-foreground"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="mb-2">Can I switch plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, 
                while downgrades take effect at the end of your billing period.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2">Is there a student discount?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Students with a valid .edu email address get 50% off the Pro plan.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and various local payment methods.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2">Can I cancel my subscription?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.
              </p>
            </Card>
          </div>
        </div>

        {/* Enterprise */}
        <Card className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
          <div className="text-center">
            <h3 className="text-white mb-2">Enterprise Solution</h3>
            <p className="mb-6 text-blue-100">
              Need a custom solution for your organization? We offer tailored plans for schools and companies.
            </p>
            <Button variant="secondary" size="lg">
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
