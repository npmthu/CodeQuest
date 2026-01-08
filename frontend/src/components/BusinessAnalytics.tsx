import { Card } from "./ui/card";
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
  Download,
  Award,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "./ui/chart";
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,

  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGenerateBusinessPDF, useGenerateBusinessCSV } from "../hooks/useReports";

export default function BusinessAnalytics() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('q2-2024');
  
  const generatePDF = useGenerateBusinessPDF();
  const generateCSV = useGenerateBusinessCSV();
  const overviewStats = [
    {
      label: "Total Investment",
      value: "$2.4M",
      change: "+$240K this quarter",
      trend: "up",
      icon: DollarSign,
      color: "bg-blue-500"
    },
    {
      label: "ROI on Training",
      value: "285%",
      change: "+18% from last quarter",
      trend: "up",
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      label: "Avg. Training Hours",
      value: "42h",
      change: "+6h from last quarter",
      trend: "up",
      icon: Clock,
      color: "bg-purple-500"
    },
    {
      label: "Certification Rate",
      value: "68%",
      change: "+5% from last quarter",
      trend: "up",
      icon: Award,
      color: "bg-orange-500"
    },
  ];

  const enrollmentTrend = [
    { month: "Jan", enrollments: 180, cost: 45000, roi: 220 },
    { month: "Feb", enrollments: 220, cost: 55000, roi: 240 },
    { month: "Mar", enrollments: 195, cost: 48750, roi: 235 },
    { month: "Apr", enrollments: 280, cost: 70000, roi: 265 },
    { month: "May", enrollments: 310, cost: 77500, roi: 275 },
    { month: "Jun", enrollments: 284, cost: 71000, roi: 285 },
  ];

  const departmentROI = [
    { department: "Engineering", investment: 850000, revenue: 2550000, roi: 300 },
    { department: "Data Science", investment: 580000, revenue: 1624000, roi: 280 },
    { department: "Design", investment: 320000, revenue: 864000, roi: 270 },
    { department: "Marketing", investment: 240000, revenue: 624000, roi: 260 },
    { department: "Product", investment: 180000, revenue: 450000, roi: 250 },
  ];

  const skillsDevelopment = [
    { skill: "Technical", current: 78, target: 90 },
    { skill: "Leadership", current: 65, target: 85 },
    { skill: "Communication", current: 72, target: 88 },
    { skill: "Problem Solving", current: 82, target: 92 },
    { skill: "Collaboration", current: 75, target: 87 },
    { skill: "Innovation", current: 68, target: 86 },
  ];

  const trainingCostBreakdown = [
    { name: "Course Licenses", value: 45, color: "#2563EB" },
    { name: "Instructor Fees", value: 28, color: "#10B981" },
    { name: "Platform Fees", value: 15, color: "#F59E0B" },
    { name: "Learning Materials", value: 8, color: "#8B5CF6" },
    { name: "Other", value: 4, color: "#EC4899" },
  ];

  const productivityMetrics = [
    { month: "Jan", before: 72, after: 78 },
    { month: "Feb", before: 73, after: 80 },
    { month: "Mar", before: 74, after: 82 },
    { month: "Apr", before: 75, after: 85 },
    { month: "May", before: 76, after: 88 },
    { month: "Jun", before: 77, after: 91 },
  ];

  const cohortComparison = [
    { metric: "Completion Rate", "Q1 2024": 68, "Q2 2024": 72, "Q3 2024": 78 },
    { metric: "Avg. Score", "Q1 2024": 75, "Q2 2024": 78, "Q3 2024": 82 },
    { metric: "Engagement", "Q1 2024": 70, "Q2 2024": 75, "Q3 2024": 80 },
    { metric: "Satisfaction", "Q1 2024": 72, "Q2 2024": 76, "Q3 2024": 81 },
  ];

  const keyInsights = [
    {
      title: "High ROI in Engineering",
      description: "Engineering department shows 300% ROI, highest across all departments",
      impact: "positive",
      recommendation: "Consider increasing investment in engineering training programs"
    },
    {
      title: "Improving Completion Rates",
      description: "Overall completion rate increased by 10% over the last quarter",
      impact: "positive",
      recommendation: "Continue current engagement strategies and expand to other cohorts"
    },
    {
      title: "Skills Gap in Leadership",
      description: "Leadership skills are 20 points below target across organization",
      impact: "neutral",
      recommendation: "Implement targeted leadership development programs"
    },
    {
      title: "Strong Productivity Gains",
      description: "Post-training productivity shows 18% average improvement",
      impact: "positive",
      recommendation: "Measure and track long-term productivity impact"
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your organization's learning and training
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1-2024">Q1 2024</SelectItem>
              <SelectItem value="q2-2024">Q2 2024</SelectItem>
              <SelectItem value="q3-2024">Q3 2024</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => generatePDF.mutate(selectedPeriod)}
            disabled={generatePDF.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            {generatePDF.isPending ? 'Generating...' : 'Export Full Report'}
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
                  <p className="text-xs">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Enrollment & ROI Trend */}
      <Card className="p-6">
        <h3 className="mb-6">Enrollment & ROI Trends</h3>
        <ChartContainer
          config={{
            enrollments: {
              label: "Enrollments",
              color: "hsl(var(--chart-1))",
            },
            roi: {
              label: "ROI (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-80"
        >
          <AreaChart data={enrollmentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="enrollments"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="roi"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Department ROI & Training Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department ROI */}
        <Card className="p-6">
          <h3 className="mb-6">ROI by Department</h3>
          <ChartContainer
            config={{
              roi: {
                label: "ROI (%)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-80"
          >
            <BarChart data={departmentROI}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="roi" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Training Cost Breakdown */}
        <Card className="p-6">
          <h3 className="mb-6">Training Cost Breakdown</h3>
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
                data={trainingCostBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {trainingCostBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {trainingCostBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm">{item.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Skills Development & Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Development Radar */}
        <Card className="p-6">
          <h3 className="mb-6">Skills Development Progress</h3>
          <ChartContainer
            config={{
              current: {
                label: "Current Level",
                color: "hsl(var(--chart-1))",
              },
              target: {
                label: "Target Level",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-80"
          >
            <RadarChart data={skillsDevelopment}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 12 }} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </Card>

        {/* Productivity Impact */}
        <Card className="p-6">
          <h3 className="mb-6">Productivity Impact (Before vs After Training)</h3>
          <ChartContainer
            config={{
              before: {
                label: "Before Training",
                color: "hsl(var(--chart-1))",
              },
              after: {
                label: "After Training",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-80"
          >
            <LineChart data={productivityMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[70, 95]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="before"
                stroke="#94A3B8"
                strokeWidth={2}
                dot={{ fill: "#94A3B8", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="after"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Cohort Comparison */}
      <Card className="p-6">
        <h3 className="mb-6">Cohort Performance Comparison</h3>
        <ChartContainer
          config={{
            "Q1 2024": {
              label: "Q1 2024",
              color: "#94A3B8",
            },
            "Q2 2024": {
              label: "Q2 2024",
              color: "#2563EB",
            },
            "Q3 2024": {
              label: "Q3 2024",
              color: "#10B981",
            },
          }}
          className="h-80"
        >
          <BarChart data={cohortComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="Q1 2024" fill="#94A3B8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Q2 2024" fill="#2563EB" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Q3 2024" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="mb-6">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyInsights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                insight.impact === "positive"
                  ? "bg-green-50 border-green-200"
                  : insight.impact === "neutral"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    insight.impact === "positive"
                      ? "bg-green-100"
                      : insight.impact === "neutral"
                      ? "bg-blue-100"
                      : "bg-red-100"
                  }`}
                >
                  <Activity
                    className={`w-4 h-4 ${
                      insight.impact === "positive"
                        ? "text-green-600"
                        : insight.impact === "neutral"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  <p className="text-xs font-medium text-blue-600">
                    → {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-2">Export Comprehensive Report</h3>
            <p className="text-sm text-muted-foreground">
              Download detailed analytics reports for stakeholder presentations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => generatePDF.mutate(selectedPeriod)}
              disabled={generatePDF.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              {generatePDF.isPending ? 'Generating...' : 'Export as PDF'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => generateCSV.mutate(selectedPeriod)}
              disabled={generateCSV.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              {generateCSV.isPending ? 'Generating...' : 'Export as CSV'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
