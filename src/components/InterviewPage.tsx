import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Video,
  Code,
  Calendar,
  Users,
  Clock,
  Play,
  Pencil,
  Plus,
  TrendingUp,
  Award,
  Target,
  CheckCircle
} from "lucide-react";
import InterviewRoomPage from "./InterviewRoomPage";
import InterviewSchedulePage from "./InterviewSchedulePage";

interface InterviewPageProps {
  onNavigate?: (page: string) => void;
}

export default function InterviewPage({ onNavigate }: InterviewPageProps) {
  const [currentView, setCurrentView] = useState<"dashboard" | "room" | "schedule">("dashboard");

  const stats = [
    { label: "Total Interviews", value: 12, icon: Video, color: "bg-blue-500" },
    { label: "Upcoming", value: 3, icon: Calendar, color: "bg-green-500" },
    { label: "Hours Practiced", value: 24, icon: Clock, color: "bg-purple-500" },
    { label: "Success Rate", value: "85%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      type: "Mock Technical Interview",
      interviewer: "Sarah Chen",
      date: "Nov 15, 2024",
      time: "2:00 PM",
      duration: "60 min",
      status: "Confirmed"
    },
    {
      id: 2,
      type: "System Design Practice",
      interviewer: "Mike Johnson",
      date: "Nov 17, 2024",
      time: "4:30 PM",
      duration: "90 min",
      status: "Confirmed"
    },
    {
      id: 3,
      type: "Behavioral Interview",
      interviewer: "Emily Rodriguez",
      date: "Nov 20, 2024",
      time: "10:00 AM",
      duration: "45 min",
      status: "Pending"
    },
  ];

  const pastInterviews = [
    {
      id: 1,
      type: "Data Structures & Algorithms",
      interviewer: "David Kim",
      date: "Nov 10, 2024",
      score: 85,
      feedback: "Great problem-solving approach. Work on time complexity analysis."
    },
    {
      id: 2,
      type: "Frontend Development",
      interviewer: "Lisa Wang",
      date: "Nov 8, 2024",
      score: 92,
      feedback: "Excellent React knowledge. Good component design patterns."
    },
    {
      id: 3,
      type: "System Design",
      interviewer: "Alex Thompson",
      date: "Nov 5, 2024",
      score: 78,
      feedback: "Good understanding of scalability. Practice database design more."
    },
  ];

  const interviewTopics = [
    { name: "Algorithms", count: 5, color: "bg-blue-100 text-blue-700" },
    { name: "System Design", count: 3, color: "bg-green-100 text-green-700" },
    { name: "Frontend", count: 2, color: "bg-purple-100 text-purple-700" },
    { name: "Behavioral", count: 2, color: "bg-orange-100 text-orange-700" },
  ];

  if (currentView === "room") {
    return <InterviewRoomPage onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "schedule") {
    return <InterviewSchedulePage onBack={() => setCurrentView("dashboard")} />;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Mock Interviews</h2>
          <p className="text-muted-foreground mt-1">
            Practice technical interviews with peers and mentors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentView("schedule")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCurrentView("room")}
          >
            <Video className="w-4 h-4 mr-2" />
            Start Interview
          </Button>
        </div>
      </div>

      {/* Placeholder Notice */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="mb-1">🚧 Mock Interview System (Placeholder)</h4>
            <p className="text-sm text-muted-foreground">
              This is a placeholder for the professional mock interview platform. 
              All features including video recording, live code collaboration, whiteboard, 
              and scheduling are designed but not yet functional.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl mt-1">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Interviews */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3>Upcoming Interviews</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView("schedule")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule New
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4>{interview.type}</h4>
                      <Badge className={
                        interview.status === "Confirmed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }>
                        {interview.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      with {interview.interviewer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {interview.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {interview.time}
                  </span>
                  <span>{interview.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setCurrentView("room")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Room
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Interview Topics */}
        <div>
          <h3 className="mb-4">Interview Topics</h3>
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              {interviewTopics.map((topic) => (
                <div key={topic.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">{topic.name}</span>
                  </div>
                  <Badge className={topic.color}>{topic.count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div>
            <h4 className="mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setCurrentView("room")}
              >
                <Code className="w-4 h-4 mr-2" />
                Practice Coding
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Pencil className="w-4 h-4 mr-2" />
                Whiteboard Session
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Users className="w-4 h-4 mr-2" />
                Find Practice Partner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Past Interviews */}
      <div>
        <h3 className="mb-4">Past Interviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastInterviews.map((interview) => (
            <Card key={interview.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  interview.score >= 90 ? 'bg-green-100' :
                  interview.score >= 80 ? 'bg-blue-100' :
                  'bg-yellow-100'
                }`}>
                  <span className={`font-medium ${
                    interview.score >= 90 ? 'text-green-700' :
                    interview.score >= 80 ? 'text-blue-700' :
                    'text-yellow-700'
                  }`}>
                    {interview.score}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm truncate">{interview.type}</h4>
                  <p className="text-xs text-muted-foreground">{interview.date}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Interviewer: {interview.interviewer}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {interview.feedback}
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Play className="w-3 h-3 mr-2" />
                View Recording
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Strong Areas</p>
              <p className="text-sm font-medium">Problem Solving, Communication</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Areas to Improve</p>
              <p className="text-sm font-medium">System Design, Time Management</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Milestone</p>
              <p className="text-sm font-medium">Complete 5 more system design interviews</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
