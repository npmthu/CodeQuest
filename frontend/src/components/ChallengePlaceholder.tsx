import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Zap,
  Code
} from "lucide-react";

interface ChallengePlaceholderProps {
  challengeType: "interview" | "daily";
  onBack: () => void;
}

export default function ChallengePlaceholder({ challengeType, onBack }: ChallengePlaceholderProps) {
  const challengeInfo = challengeType === "interview" 
    ? {
        title: "Interview Prep Challenge",
        subtitle: "Top 50 Coding Interview Questions",
        description: "Practice the most commonly asked coding problems in technical interviews at top tech companies.",
        icon: Trophy,
        color: "blue"
      }
    : {
        title: "Daily Coding Challenge",
        subtitle: "Today's Problem",
        description: "Solve today's challenge to maintain your streak and earn bonus XP. New problem available every 24 hours.",
        icon: Zap,
        color: "purple"
      };

  const Icon = challengeInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
          
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 bg-${challengeInfo.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-8 h-8 text-${challengeInfo.color}-600`} />
            </div>
            <div className="flex-1">
              <h2>{challengeInfo.title}</h2>
              <p className="text-muted-foreground mt-2">{challengeInfo.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Placeholder Notice */}
        <Card className={`p-8 bg-gradient-to-br from-${challengeInfo.color}-50 to-indigo-50 border-${challengeInfo.color}-200 mb-8`}>
          <div className="text-center max-w-2xl mx-auto">
            <div className={`w-16 h-16 bg-${challengeInfo.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-3">🚧 Challenge Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              {challengeInfo.description}
            </p>
            <p className="text-sm text-muted-foreground">
              This is a placeholder page. The actual challenge content and coding interface will be implemented here.
            </p>
          </div>
        </Card>

        {/* Challenge Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h4>Real Interview Questions</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Curated problems from actual technical interviews at leading companies.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h4>Timed Practice</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Simulate real interview conditions with time-limited challenges.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <h4>Earn Rewards</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete challenges to earn XP, badges, and climb the leaderboard.
            </p>
          </Card>
        </div>

        {/* Mock Challenge List */}
        {challengeType === "interview" && (
          <div>
            <h3 className="mb-6">Challenge Categories</h3>
            <div className="space-y-4">
              {[
                { category: "Arrays & Strings", problems: 12, difficulty: "Easy to Medium" },
                { category: "Linked Lists", problems: 8, difficulty: "Medium" },
                { category: "Trees & Graphs", problems: 10, difficulty: "Medium to Hard" },
                { category: "Dynamic Programming", problems: 8, difficulty: "Hard" },
                { category: "System Design", problems: 6, difficulty: "Hard" },
              ].map((item, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-all cursor-not-allowed opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="mb-2">{item.category}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.problems} problems</span>
                        <Badge variant="outline">{item.difficulty}</Badge>
                      </div>
                    </div>
                    <Button disabled>Start</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {challengeType === "daily" && (
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-3">Today's Challenge</h3>
              <p className="text-muted-foreground mb-6">
                A new coding problem is released every day at midnight UTC. 
                Solve it to maintain your streak!
              </p>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <p className="text-3xl mb-1">🔥</p>
                  <p className="text-sm text-muted-foreground">45 day streak</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <p className="text-3xl mb-1">⭐</p>
                  <p className="text-sm text-muted-foreground">2,450 XP</p>
                </div>
              </div>
              <Button disabled className="w-full">
                <Code className="w-4 h-4 mr-2" />
                View Today's Problem (Coming Soon)
              </Button>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
