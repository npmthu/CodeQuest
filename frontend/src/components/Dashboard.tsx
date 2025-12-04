import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { 
  Code, 
  FileText, 
  CheckSquare, 
  FolderKanban,
  TrendingUp,
  Award,
  Target,
  Flame
} from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "./ui/chart";
import { 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useUserStats, useLeaderboard } from "../hooks/useApi";

interface LeaderboardEntry {
  user_id: string;
  display_name?: string | null;
  reputation: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);

  if (statsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const statsCards = [
    { label: "Total Submissions", value: stats?.totalSubmissions || 0, icon: Code, color: "bg-blue-500" },
    { label: "Problems Solved", value: stats?.problemsSolved || 0, icon: CheckSquare, color: "bg-green-500" },
    { label: "Lessons Completed", value: stats?.lessonsCompleted || 0, icon: FileText, color: "bg-purple-500" },
    { label: "Current Reputation", value: stats?.reputation || 0, icon: Award, color: "bg-orange-500" },
  ];

  // Transform API language stats to chart data
  const languageData = stats?.languageStats
    ? Object.entries(stats.languageStats).map(([name, count], index) => ({
        name,
        value: count as number,
        color: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE", "#BFDBFE"][index % 5],
      }))
    : [];

  // Calculate total for percentages
  const totalLanguageSubmissions = languageData.reduce((sum, lang) => sum + lang.value, 0);

  // Transform difficulty stats to weekly-like activity (reuse for now)
  const difficultyActivity = stats?.difficultyBreakdown
    ? [
        { day: "Easy", hours: stats.difficultyBreakdown.easy || 0 },
        { day: "Medium", hours: stats.difficultyBreakdown.medium || 0 },
        { day: "Hard", hours: stats.difficultyBreakdown.hard || 0 },
      ]
    : [];

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2>Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'Learner'}! 👋</h2>
        <p className="text-muted-foreground mt-1">Here's your learning progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="mt-2">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3>Learning Progress</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Data Structures & Algorithms</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Web Development</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Python Programming</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Database & SQL</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Streak */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Performance Stats</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Acceptance Rate</span>
                <span className="text-blue-600">{stats?.acceptanceRate?.toFixed(1) || 0}%</span>
              </div>
              <Progress value={stats?.acceptanceRate || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Study Time</span>
                <span>{((stats?.totalStudyTime || 0) / 60).toFixed(1)} hrs</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quiz Attempts</span>
              <span>{stats?.quizAttempts || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Reputation</span>
              <span className="text-blue-600">{stats?.reputation || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <Card className="p-6">
          <h3 className="mb-6">Language Distribution</h3>
          {languageData.length > 0 ? (
            <>
              <ChartContainer
                config={{
                  value: {
                    label: "Submissions",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-64"
              >
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {languageData.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }}></div>
                    <span className="text-sm">{lang.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {totalLanguageSubmissions > 0 
                        ? `${((lang.value / totalLanguageSubmissions) * 100).toFixed(0)}%`
                        : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No language data yet
            </div>
          )}
        </Card>

        {/* Difficulty Activity */}
        <Card className="p-6">
          <h3 className="mb-6">Problems by Difficulty</h3>
          {difficultyActivity.length > 0 ? (
            <ChartContainer
              config={{
                hours: {
                  label: "Problems",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-64"
            >
              <BarChart data={difficultyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No problem data yet
            </div>
          )}
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Leaderboard - Top 10</h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>

        {leaderboardLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((leader: LeaderboardEntry, index: number) => {
              const isCurrentUser = leader.user_id === user?.id;

              const initials =
                leader.display_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "??";

              return (
                <div
                  key={leader.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    isCurrentUser ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm text-muted-foreground w-8">#{index + 1}</div>

                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm text-blue-600">{initials}</span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm">
                      {leader.display_name || "Anonymous"}
                      {isCurrentUser && <span className="text-blue-600 ml-2">(You)</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{leader.reputation} REP</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No leaderboard data available
          </div>
        )}
      </Card>

    </div>
  );
}
