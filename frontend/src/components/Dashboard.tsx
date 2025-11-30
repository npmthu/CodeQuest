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
import { useUserStats, useUserProgress } from "../hooks/useApi";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: progress, isLoading: progressLoading } = useUserProgress();

  if (statsLoading || progressLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const statsCards = [
    { label: "Submissions", value: stats?.submissions || 0, icon: Code, color: "bg-blue-500" },
    { label: "Problems Solved", value: stats?.problemsSolved || 0, icon: CheckSquare, color: "bg-green-500" },
    { label: "Lessons Completed", value: stats?.lessonsCompleted || 0, icon: FileText, color: "bg-purple-500" },
    { label: "Current XP", value: stats?.xp || 0, icon: Award, color: "bg-orange-500" },
  ];

  const languageData = [
    { name: "Python", value: 35, color: "#3B82F6" },
    { name: "JavaScript", value: 28, color: "#60A5FA" },
    { name: "C++", value: 20, color: "#93C5FD" },
    { name: "Java", value: 17, color: "#DBEAFE" },
  ];

  const weeklyActivity = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 4.1 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 5.2 },
    { day: "Sun", hours: 2.8 },
  ];

  const leaderboard = [
    { rank: 1, name: "Alice Chen", xp: 2850, avatar: "AC" },
    { rank: 2, name: "Bob Smith", xp: 2720, avatar: "BS" },
    { rank: 3, name: "You (Bug Quýt)", xp: 2580, avatar: "BQ", isUser: true },
    { rank: 4, name: "Diana Lee", xp: 2410, avatar: "DL" },
    { rank: 5, name: "Erik Johnson", xp: 2290, avatar: "EJ" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2>Welcome back, {user?.email?.split('@')[0] || 'Learner'}! 👋</h2>
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
            <h3>Current Streak</h3>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <h2 className="text-blue-600">14 Days</h2>
            <p className="text-sm text-muted-foreground mt-2">Keep it up!</p>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Longest streak</span>
              <span>28 days</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total XP</span>
              <span className="text-blue-600">2,580</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <Card className="p-6">
          <h3 className="mb-6">Language Distribution</h3>
          <ChartContainer
            config={{
              value: {
                label: "Percentage",
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
                <span className="text-sm text-muted-foreground ml-auto">{lang.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Activity */}
        <Card className="p-6">
          <h3 className="mb-6">Weekly Activity</h3>
          <ChartContainer
            config={{
              hours: {
                label: "Hours",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-64"
          >
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hours" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Leaderboard</h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                user.isUser ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
              }`}
            >
              <div className="text-sm text-muted-foreground w-8">#{user.rank}</div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm text-blue-600">{user.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">{user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
