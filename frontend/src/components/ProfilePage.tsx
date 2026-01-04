import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Award, 
  Trophy, 
  Target, 
  Calendar,
  Code,
  BookOpen,
  CheckCircle2,
  Edit,
  Github,
  Linkedin,
  Globe
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUserStats } from "../hooks/useApi";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { data: stats, isLoading } = useUserStats();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const email = profile?.email || user?.email || '';
  const avatarInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const badges = [
    { id: 1, name: "First Steps", icon: "🎯", earned: true, date: "Oct 1, 2025" },
    { id: 2, name: "Week Warrior", icon: "🔥", earned: true, date: "Oct 8, 2025" },
    { id: 3, name: "Code Master", icon: "💻", earned: true, date: "Oct 15, 2025" },
    { id: 4, name: "Problem Solver", icon: "🧩", earned: true, date: "Oct 20, 2025" },
    { id: 5, name: "Team Player", icon: "🤝", earned: false },
    { id: 6, name: "Speed Demon", icon: "⚡", earned: false },
  ];

  // Recent activity from API
  const activities = (stats?.recentActivity || []).map((activity: any) => ({
    date: new Date(activity.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    action: activity.passed ? "Solved problem" : "Attempted problem",
    title: activity.problems?.title || 'Unknown Problem',
    xp: activity.points || 0,
    status: activity.status
  }));

  // Language skills from stats
  const languageStats = stats?.languageStats || {};
  const totalLanguageSubmissions = Object.values(languageStats).reduce((a: number, b: any) => a + (b as number), 0) as number;
  const skills = Object.entries(languageStats).map(([name, count]: [string, any]) => ({
    name,
    level: totalLanguageSubmissions > 0 ? Math.round((count / totalLanguageSubmissions) * 100) : 0,
    problems: count
  }));

  return (
    <div className="p-8 space-y-6">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-5xl text-white">{avatarInitials}</span>
              </div>
            )}
            <Button 
              className="w-full mt-4" 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2">{displayName}</h2>
                <p className="text-muted-foreground mb-2">{email}</p>
                {profile?.bio && (
                  <p className="text-muted-foreground mb-4 text-sm">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-blue-600">{stats?.level || 'Beginner'}</Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>{stats?.reputation || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span>{badges.filter(b => b.earned).length} Badges</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Github className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Linkedin className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Member since</div>
                <div className="text-sm">
                  {stats?.createdAt ? new Date(stats.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Recently'}
                </div>
                <div className="text-sm text-muted-foreground mt-3 mb-1">Current Streak</div>
                <div className="text-2xl text-blue-600">{stats?.currentStreak || 0} days 🔥</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Code className="w-8 h-8 text-blue-600" />
          </div>
          <h3>{stats?.problemsSolved || 0}</h3>
          <p className="text-sm text-muted-foreground">Problems Solved</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h3>{stats?.lessonsCompleted || 0}</h3>
          <p className="text-sm text-muted-foreground">Lessons Completed</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <h3>{stats?.acceptanceRate || 0}%</h3>
          <p className="text-sm text-muted-foreground">Acceptance Rate</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
          <h3>{stats?.totalStudyTimeHours || 0}h</h3>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Earned Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-lg border-2 transition-all ${
                    badge.earned
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-sm mb-1">{badge.name}</p>
                  {badge.earned && (
                    <p className="text-xs text-muted-foreground">{badge.date}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground mt-1">{activity.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-blue-600">+{activity.xp} XP</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.date}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Skill Progress</h3>
            <div className="space-y-6">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.problems} problems</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{skill.level}% mastery</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
