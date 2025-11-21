import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, X, ArrowLeft } from "lucide-react";

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const plans = [
    {
      name: "Student",
      price: "Free",
      description: "Perfect for individual learners getting started",
      features: [
        { name: "Access to basic lessons", included: true },
        { name: "50 coding problems", included: true },
        { name: "Community forum access", included: true },
        { name: "Personal notebook (5 notes)", included: true },
        { name: "Progress tracking", included: true },
        { name: "AI code review (5/month)", included: true },
        { name: "Advanced lessons", included: false },
        { name: "Unlimited problems", included: false },
        { name: "Mock interviews", included: false },
        { name: "Priority support", included: false },
        { name: "Certificates", included: false },
      ],
      popular: false,
      cta: "Current Plan",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For serious learners preparing for interviews",
      features: [
        { name: "All Student features", included: true },
        { name: "Unlimited coding problems", included: true },
        { name: "Advanced lessons & tutorials", included: true },
        { name: "Unlimited AI code reviews", included: true },
        { name: "Mock interview practice", included: true },
        { name: "Personal notebook (unlimited)", included: true },
        { name: "Progress analytics", included: true },
        { name: "Downloadable certificates", included: true },
        { name: "Priority support", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Early access to new features", included: true },
      ],
      popular: true,
      cta: "Upgrade to Pro",
      variant: "default" as const,
    },
    {
      name: "Instructor",
      price: "$19.99",
      period: "/month",
      description: "For educators and content creators",
      features: [
        { name: "All Pro features", included: true },
        { name: "Create custom lessons", included: true },
        { name: "Create custom problems", included: true },
        { name: "Student progress tracking", included: true },
        { name: "Class management tools", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "Bulk student invites", included: true },
        { name: "Custom badges & rewards", included: true },
        { name: "API access", included: true },
        { name: "White-label option", included: true },
        { name: "Dedicated support", included: true },
      ],
      popular: false,
      cta: "Upgrade to Instructor",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <h2 className="mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your learning journey. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular ? "border-2 border-blue-500 shadow-xl" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-4xl">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.variant === "default"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
                variant={plan.variant}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
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
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="mb-2">Can I switch plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
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
