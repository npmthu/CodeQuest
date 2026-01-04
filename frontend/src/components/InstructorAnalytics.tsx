import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Eye,
  CheckCircle,
  Download,
  Target,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "./ui/chart";
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

interface AnalyticsData {
  overviewStats: {
    totalViews: number;
    newEnrollments: number;
    revenue: number;
    avgCompletion: number;
  };
  chartData: Array<{
    date: string;
    completions: number;
    submissions: number;
    engagements: number;
    revenue: number;
  }>;
  topContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    completion: number;
  }>;
  weekdayEngagement: Array<{
    day: string;
    avgTime: number;
    completion: number;
  }>;
  period: string;
}

export default function InstructorAnalytics() {
  const { t, language } = useLanguage();
  const { session } = useAuth();
  
  const [period, setPeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.access_token) {
        setError(language === 'vi' ? 'Vui lòng đăng nhập để xem thống kê' : 'Please login to view analytics');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/instructor/analytics?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();
        if (result.success) {
          setAnalyticsData(result.data);
        } else {
          throw new Error(result.error || 'Failed to load analytics');
        }
      } catch (err: any) {
        console.error('Analytics fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session, period, language]);

  // Translate day names based on language
  const translateDay = (day: string) => {
    const dayMap: Record<string, string> = {
      'Mon': t('day.mon'),
      'Tue': t('day.tue'),
      'Wed': t('day.wed'),
      'Thu': t('day.thu'),
      'Fri': t('day.fri'),
      'Sat': t('day.sat'),
      'Sun': t('day.sun'),
    };
    return dayMap[day] || day;
  };

  const overviewStats = analyticsData ? [
    {
      label: t('analytics.totalViews'),
      value: analyticsData.overviewStats.totalViews.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Eye,
      color: "bg-blue-500"
    },
    {
      label: t('analytics.newEnrollments'),
      value: analyticsData.overviewStats.newEnrollments.toLocaleString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Users,
      color: "bg-green-500"
    },
    {
      label: t('analytics.revenue'),
      value: `$${analyticsData.overviewStats.revenue.toLocaleString()}`,
      change: "+18.3%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      label: t('analytics.avgCompletion'),
      value: `${analyticsData.overviewStats.avgCompletion}%`,
      change: analyticsData.overviewStats.avgCompletion > 50 ? "+5.1%" : "-2.1%",
      trend: analyticsData.overviewStats.avgCompletion > 50 ? "up" as const : "down" as const,
      icon: CheckCircle,
      color: "bg-orange-500"
    },
  ] : [];

  // Traffic sources
  const trafficSources = [
    { name: "Direct", value: 35, color: "#2563EB" },
    { name: language === 'vi' ? "Tìm kiếm" : "Search", value: 28, color: "#10B981" },
    { name: language === 'vi' ? "Mạng xã hội" : "Social Media", value: 20, color: "#F59E0B" },
    { name: language === 'vi' ? "Giới thiệu" : "Referral", value: 12, color: "#8B5CF6" },
    { name: "Email", value: 5, color: "#EC4899" },
  ];

  // Export report function
  const exportReport = () => {
    if (!analyticsData) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      selectedPeriod: period,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('label.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('label.error')}</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {language === 'vi' ? 'Thử lại' : 'Try Again'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>{t('analytics.title')}</h2>
          <p className="text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.last7days')}</SelectItem>
              <SelectItem value="30d">{t('analytics.last30days')}</SelectItem>
              <SelectItem value="90d">{t('analytics.last90days')}</SelectItem>
              <SelectItem value="1y">{t('analytics.lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.exportReport')}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="mt-1">{stat.value}</h3>
                <div className={`flex items-center gap-1 mt-2 ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <p className="text-xs">{stat.change} {t('analytics.vsLastPeriod')}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Chart */}
      {analyticsData && analyticsData.chartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>{t('analytics.revenueTrend')}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Hoàn thành' : 'Completions'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Bài nộp' : 'Submissions'}
                </span>
              </div>
            </div>
          </div>
          <ChartContainer
            config={{
              completions: { label: "Completions", color: "hsl(var(--chart-1))" },
              submissions: { label: "Submissions", color: "hsl(var(--chart-2))" },
            }}
            className="h-80"
          >
            <AreaChart data={analyticsData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="completions"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </Card>
      )}

      {/* Top Content & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content */}
        <Card className="p-6">
          <h3 className="mb-6">{t('analytics.coursePerformance')}</h3>
          {analyticsData && analyticsData.topContent.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topContent.map((content, index) => (
                <div key={content.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600">
                          #{index + 1}
                        </span>
                        <h4 className="text-sm truncate">{content.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{content.views} {language === 'vi' ? 'lượt xem' : 'views'}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {content.type === 'lesson' 
                            ? (language === 'vi' ? 'Bài học' : 'Lesson')
                            : (language === 'vi' ? 'Bài tập' : 'Problem')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">{content.completion}%</p>
                      <p className="text-xs text-muted-foreground">{t('courses.completion')}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${content.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('label.noData')}</p>
              <p className="text-sm mt-2">
                {language === 'vi' 
                  ? 'Tạo bài học hoặc bài tập để xem thống kê' 
                  : 'Create lessons or problems to see statistics'}
              </p>
            </div>
          )}
        </Card>

        {/* Traffic Sources */}
        <Card className="p-6">
          <h3 className="mb-6">{t('analytics.trafficSources')}</h3>
          <ChartContainer
            config={{
              value: { label: "Percentage", color: "hsl(var(--chart-1))" },
            }}
            className="h-64"
          >
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {trafficSources.map((source) => (
              <div key={source.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                <span className="text-sm">{source.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{source.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Engagement */}
      {analyticsData && analyticsData.weekdayEngagement && (
        <Card className="p-6">
          <h3 className="mb-6">{t('analytics.studentEngagement')}</h3>
          <ChartContainer
            config={{
              avgTime: { label: language === 'vi' ? "Thời gian TB (phút)" : "Avg Time (min)", color: "hsl(var(--chart-1))" },
              completion: { label: language === 'vi' ? "Hoàn thành" : "Completions", color: "hsl(var(--chart-2))" },
            }}
            className="h-64"
          >
            <BarChart data={analyticsData.weekdayEngagement.map(d => ({
              ...d,
              day: translateDay(d.day)
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avgTime" fill="#2563EB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completion" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Thời gian TB (phút)' : 'Avg Time (min)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Hoàn thành' : 'Completions'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
