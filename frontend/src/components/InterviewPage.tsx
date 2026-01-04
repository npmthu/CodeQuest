import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import InterviewRoomPage from "./InterviewRoomPage";
import InterviewSchedulePage from "./InterviewSchedulePage";
import { useQuery } from "@tanstack/react-query";
import type { InterviewSessionWithUsers } from "../interfaces";

export default function InterviewPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "room" | "schedule">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const itemsPerPage = 6;
  
  // Fetch mock interview sessions from API
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['mockInterviewSessions'],
    queryFn: async () => {
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Session expired. Please login again.');
      }
      
      const token = session.access_token;
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/mock-interviews/sessions?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const result = await response.json();
      console.log('🔍 Mock Interview API Response:', {
        success: result.success,
        totalSessions: result.data?.total,
        sessionsCount: result.data?.sessions?.length,
        resultKeys: Object.keys(result),
        dataKeys: result.data ? Object.keys(result.data) : null
      });
      
      const sessionsData = result.data?.sessions || [];
      
      // Map mock interview structure to InterviewSessionWithUsers structure
      const mapped = sessionsData.map((s: any) => ({
        id: s.id,
        intervieweeId: '', // Mock interviews don't have specific interviewee until booked
        interviewerId: s.instructor_id,
        interviewType: s.topic?.includes('System') ? 'system_design' : 
                      s.topic?.includes('Behavioral') ? 'behavioral' : 'coding',
        difficulty: s.difficulty_level as 'easy' | 'medium' | 'hard',
        status: s.status,
        scheduledAt: s.session_date,
        durationMin: s.duration_minutes,
        communicationMode: s.communication_mode,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        interviewer: s.instructor ? {
          id: s.instructor.id,
          displayName: s.instructor.display_name,
          avatarUrl: s.instructor.avatar_url
        } : undefined,
        interviewee: [],
        // Additional mock interview fields
        title: s.title,
        description: s.description,
        topic: s.topic,
        price: s.price,
        maxSlots: s.max_slots,
        slotsAvailable: s.slots_available
      }));
      
      console.log('✅ Mapped sessions:', {
        count: mapped.length,
        firstSession: mapped[0]?.title,
        statuses: mapped.map((s: any) => s.status)
      });
      
      return mapped;
    }
  });

  // Separate upcoming and past interviews
  const allUpcomingInterviews = sessions.filter((s: InterviewSessionWithUsers) => 
    s.status === 'scheduled' || s.status === 'in_progress'
  );
  
  const allPastInterviews = sessions.filter((s: InterviewSessionWithUsers) => 
    s.status === 'completed'
  );

  // Filter by search query
  const filterBySearch = (interview: InterviewSessionWithUsers) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const interviewer = Array.isArray(interview.interviewer) ? interview.interviewer[0] : interview.interviewer;
    const interviewee = Array.isArray(interview.interviewee) ? interview.interviewee[0] : interview.interviewee;
    
    return (
      interview.interviewType?.toLowerCase().includes(query) ||
      interview.difficulty?.toLowerCase().includes(query) ||
      interview.status?.toLowerCase().includes(query) ||
      interviewer?.displayName?.toLowerCase().includes(query) ||
      interviewee?.displayName?.toLowerCase().includes(query)
    );
  };

  const filteredUpcomingInterviews = allUpcomingInterviews.filter(filterBySearch);
  const filteredPastInterviews = allPastInterviews.filter(filterBySearch);

  // Pagination
  const totalUpcomingPages = Math.ceil(filteredUpcomingInterviews.length / itemsPerPage);
  const totalPastPages = Math.ceil(filteredPastInterviews.length / itemsPerPage);
  
  const paginatedUpcomingInterviews = filteredUpcomingInterviews.slice(
    (upcomingPage - 1) * itemsPerPage,
    upcomingPage * itemsPerPage
  );
  
  const paginatedPastInterviews = filteredPastInterviews.slice(
    (pastPage - 1) * itemsPerPage,
    pastPage * itemsPerPage
  );

  const stats = [
    { label: "Total Interviews", value: sessions.length, icon: Video, color: "bg-blue-500" },
    { label: "Upcoming", value: allUpcomingInterviews.length, icon: Calendar, color: "bg-green-500" },
    { label: "Completed", value: allPastInterviews.length, icon: Clock, color: "bg-purple-500" },
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

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by instructor name, type, difficulty, or status..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setUpcomingPage(1); // Reset to first page on search
              setPastPage(1);
            }}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredUpcomingInterviews.length} upcoming and {filteredPastInterviews.length} past interviews
          </p>
        )}
      </Card>

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
            <div className="flex items-center gap-2">
              {filteredUpcomingInterviews.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {((upcomingPage - 1) * itemsPerPage) + 1}-{Math.min(upcomingPage * itemsPerPage, filteredUpcomingInterviews.length)} of {filteredUpcomingInterviews.length}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentView("schedule")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule New
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {filteredUpcomingInterviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{searchQuery ? "No interviews found" : "No upcoming interviews"}</h3>
                <p className="text-muted-foreground mb-4">{searchQuery ? "Try adjusting your search terms" : "Schedule your first mock interview to practice"}</p>
                {!searchQuery && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setCurrentView("schedule")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                )}
              </Card>
            ) : (
              <>
              {paginatedUpcomingInterviews.map((interview: InterviewSessionWithUsers) => {

                const interviewer = Array.isArray(interview.interviewer) ? interview.interviewer[0] : interview.interviewer;
                
                return (
                  <Card key={interview.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{(interview as any).title || (interview.interviewType === 'coding' ? 'Coding Interview' : 
                               interview.interviewType === 'system_design' ? 'System Design' : 
                               'Behavioral Interview')}</h4>
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
                        <p className="text-sm font-medium text-blue-600 mb-1">
                          👨‍🏫 Instructor: {interviewer?.displayName || 'TBA'}
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
              })}
              
              {/* Upcoming Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((upcomingPage - 1) * itemsPerPage) + 1} to {Math.min(upcomingPage * itemsPerPage, filteredUpcomingInterviews.length)} of {filteredUpcomingInterviews.length} interviews
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpcomingPage(p => Math.max(1, p - 1))}
                      disabled={upcomingPage === 1}
                      className="px-3"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalUpcomingPages, 7) }, (_, i) => {
                        let page;
                        if (totalUpcomingPages <= 7) {
                          page = i + 1;
                        } else if (upcomingPage <= 4) {
                          page = i + 1;
                        } else if (upcomingPage >= totalUpcomingPages - 3) {
                          page = totalUpcomingPages - 6 + i;
                        } else {
                          page = upcomingPage - 3 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={page === upcomingPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUpcomingPage(page)}
                            className={`w-9 h-9 p-0 ${
                              page === upcomingPage 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpcomingPage(p => Math.min(totalUpcomingPages, p + 1))}
                      disabled={upcomingPage === totalUpcomingPages}
                      className="px-3"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
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
        <div className="flex items-center justify-between mb-4">
          <h3>Past Interviews</h3>
          {filteredPastInterviews.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Showing {((pastPage - 1) * itemsPerPage) + 1}-{Math.min(pastPage * itemsPerPage, filteredPastInterviews.length)} of {filteredPastInterviews.length}
            </span>
          )}
        </div>
        {filteredPastInterviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No past interviews found" : "No completed interviews yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "Your interview history will appear here"}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedPastInterviews.map((interview: InterviewSessionWithUsers) => {
                const interviewer = Array.isArray(interview.interviewer) ? interview.interviewer[0] : interview.interviewer;
                
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
                    <p className="text-xs font-medium text-blue-600 mb-3">
                      👨‍🏫 Instructor: {interviewer?.displayName || 'N/A'}
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
            
            {/* Past Interviews Pagination */}
            {totalPastPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pastPage - 1) * itemsPerPage) + 1} to {Math.min(pastPage * itemsPerPage, filteredPastInterviews.length)} of {filteredPastInterviews.length} interviews
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPastPage(p => Math.max(1, p - 1))}
                    disabled={pastPage === 1}
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPastPages, 7) }, (_, i) => {
                      let page;
                      if (totalPastPages <= 7) {
                        page = i + 1;
                      } else if (pastPage <= 4) {
                        page = i + 1;
                      } else if (pastPage >= totalPastPages - 3) {
                        page = totalPastPages - 6 + i;
                      } else {
                        page = pastPage - 3 + i;
                      }
                      return (
                        <Button
                          key={page}
                          variant={page === pastPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPastPage(page)}
                          className={`w-9 h-9 p-0 ${
                            page === pastPage 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPastPage(p => Math.min(totalPastPages, p + 1))}
                    disabled={pastPage === totalPastPages}
                    className="px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
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
