import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, X, ArrowLeft, Loader2, Crown, Star, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";
import { toast } from "sonner";
import { FeatureGate, UpgradePrompt, FeatureBadge } from "./FeatureGate";

// Example: Protected AI Mindmap Component
export default function AIMindmapPage() {
  const navigate = useNavigate();
  const { currentPlan } = useSubscription();

  const handleGenerateMindmap = async () => {
    // This would call your AI API
    toast.success("Mindmap generation started!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Mindmap Generator</h1>
          <p className="text-muted-foreground">
            Transform your notes into beautiful mindmaps using AI
          </p>
        </div>

        {/* Protected Content */}
        <FeatureGate featureName="aiMindmap">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">AI Mindmap Generation</h2>
              <p className="text-muted-foreground mb-4">
                Current plan: <span className="font-medium">{currentPlan?.name || 'Free'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✨ Premium Feature Active</h3>
                <p className="text-sm text-green-700">
                  You have access to unlimited AI mindmap generation with your {currentPlan?.name} subscription.
                </p>
              </div>

              <Button onClick={handleGenerateMindmap} className="w-full" size="lg">
                Generate AI Mindmap
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Smart Analysis</h4>
                  <p className="text-sm text-muted-foreground">AI analyzes your content structure</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">Visual Layout</h4>
                  <p className="text-sm text-muted-foreground">Beautiful, organized mindmaps</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Export Options</h4>
                  <p className="text-sm text-muted-foreground">Multiple export formats available</p>
                </div>
              </div>
            </div>
          </Card>
        </FeatureGate>
      </div>
    </div>
  );
}

// Example: Dashboard with protected features
export function DashboardWithFeatures() {
  const { currentPlan, isSubscribed } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Subscription</h2>
        <AIMindmapPage />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Free Feature */}
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Basic Notes</h3>
          <p className="text-sm text-muted-foreground mb-4">Create and organize your study notes</p>
          <Button className="w-full">Open Notes</Button>
        </Card>

        {/* Protected AI Feature */}
        <Card className="p-6 relative">
          <div className="absolute top-2 right-2">
            <FeatureBadge featureName="AI Generation" />
          </div>
          <h3 className="font-semibold mb-2">AI Code Review</h3>
          <p className="text-sm text-muted-foreground mb-4">Get AI-powered feedback on your code</p>
          <FeatureGate featureName="aiGeneration">
            <Button className="w-full">Start Review</Button>
          </FeatureGate>
        </Card>

        {/* Protected Analytics Feature */}
        <Card className="p-6 relative">
          <div className="absolute top-2 right-2">
            <FeatureBadge featureName="Advanced Analytics" />
          </div>
          <h3 className="font-semibold mb-2">Progress Analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">Detailed insights into your learning</p>
          <FeatureGate featureName="advancedAnalytics">
            <Button className="w-full">View Analytics</Button>
          </FeatureGate>
        </Card>
      </div>

      {/* Usage Limits Display */}
      {isSubscribed && currentPlan && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Your Usage Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentPlan.features.maxNotes === -1 ? '∞' : currentPlan.features.maxNotes}
              </div>
              <p className="text-sm text-muted-foreground">Notes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentPlan.features.maxSubmissions === -1 ? '∞' : currentPlan.features.maxSubmissions}
              </div>
              <p className="text-sm text-muted-foreground">Submissions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {currentPlan.features.aiGeneration ? '∞' : '0'}
              </div>
              <p className="text-sm text-muted-foreground">AI Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentPlan.features.collaborationLimit === -1 ? '∞' : currentPlan.features.collaborationLimit}
              </div>
              <p className="text-sm text-muted-foreground">Collaborators</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
