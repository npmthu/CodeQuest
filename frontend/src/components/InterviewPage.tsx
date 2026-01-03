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

  Pencil,
  Plus,
  TrendingUp,
  Award,

} from "lucide-react";
import InterviewRoomPage from "./InterviewRoomPage";
import InterviewSchedulePage from "./InterviewSchedulePage";
import { useInterviewSessions } from "../hooks/useApi";
import type { InterviewSessionWithUsers } from "../interfaces";

export default function InterviewPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "room" | "schedule">("dashboard");
  
  // Fetch interview sessions from API
  const { data: sessionsData, isLoading } = useInterviewSessions();
  const sessions = sessionsData || [];

  // Separate upcoming and past interviews
  const upcomingInterviews = sessions.filter((s: InterviewSessionWithUsers) => 
    s.status === 'scheduled' || s.status === 'in_progress'
  );
  
  const pastInterviews = sessions.filter((s: InterviewSessionWithUsers) => 
    s.status === 'completed'
  );

  const stats = [
    { label: "Total Interviews", value: sessions.length, icon: Video, color: "bg-blue-500" },
    { label: "Upcoming", value: upcomingInterviews.length, icon: Calendar, color: "bg-green-500" },
    { label: "Completed", value: pastInterviews.length, icon: Clock, color: "bg-purple-500" },
    { label: "Success Rate", value: "N/A", icon: TrendingUp, color: "bg-orange-500" },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            {upcomingInterviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No upcoming interviews</h3>
                <p className="text-muted-foreground mb-4">Schedule your first mock interview to practice</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCurrentView("schedule")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </Card>
            ) : (
              upcomingInterviews.map((interview: InterviewSessionWithUsers) => {

                const interviewer = Array.isArray(interview.interviewer) ? interview.interviewer[0] : interview.interviewer;
                
                return (
                  <Card key={interview.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{interview.interviewType === 'coding' ? 'Coding Interview' : 
                               interview.interviewType === 'system_design' ? 'System Design' : 
                               'Behavioral Interview'}</h4>
                          <Badge className={
                            interview.status === "scheduled" 
                              ? "bg-green-100 text-green-700" 
                              : interview.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }>
                            {interview.status}
                          </Badge>
                          {interview.difficulty && (
                            <Badge variant="outline">{interview.difficulty}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {interviewer ? `with ${interviewer.displayName}` : 'Interviewer TBA'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : 'Not scheduled'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBA'}
                      </span>
                      {interview.durationMin && (
                        <span>{interview.durationMin} min</span>
                      )}
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
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Interview Topics */}
        <div>
          <h3 className="mb-4">Interview Topics</h3>
          <Card className="p-6 mb-6">
            <p className="text-sm text-muted-foreground text-center py-4">
              Topic statistics will be available after completing interviews
            </p>
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
        {pastInterviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No completed interviews yet</h3>
            <p className="text-muted-foreground">Your interview history will appear here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastInterviews.map((interview: InterviewSessionWithUsers) => {
              const interviewer = Array.isArray(interview.interviewer) ? interview.interviewer[0] : interview.interviewer;
              Array.isArray(interview.interviewee) ? interview.interviewee[0] : interview.interviewee;
              
              return (
                <Card key={interview.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                  <div className="mb-3">
                    <h4 className="text-sm truncate mb-1">
                      {interview.interviewType === 'coding' ? 'Coding Interview' : 
                       interview.interviewType === 'system_design' ? 'System Design' : 
                       'Behavioral Interview'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {interview.endedAt ? new Date(interview.endedAt).toLocaleDateString() : 
                       interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Interviewer: {interviewer?.displayName || 'N/A'}
                  </p>
                  {interview.difficulty && (
                    <Badge variant="outline" className="mb-3">{interview.difficulty}</Badge>
                  )}
                  {interview.durationMin && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Duration: {interview.durationMin} minutes
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="mb-6">Performance Insights</h3>
        <div className="text-center text-muted-foreground py-8">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Complete more interviews to see your performance insights</p>
        </div>
      </Card>
    </div>
  );
}
