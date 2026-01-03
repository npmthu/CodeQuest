import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Video, 
  VideoOff, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  Crown,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface MockInterviewSession {
  id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  session_date: string;
  duration_minutes: number;
  price: number;
  max_slots: number;
  slots_available: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function InstructorInterviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Session expired. Please login again.');
      }
      
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/mock-interviews/sessions?instructor_id=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const result = await response.json();
      setSessions(result.data?.sessions || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setError(error.message);
      toast.error('Failed to load interview sessions');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    // Navigate to lobby/waiting room instead of starting directly
    navigate(`/interview/lobby/${sessionId}`);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Interviews</h1>
          <p className="text-muted-foreground">Manage your interview sessions</p>
        </div>
        <Button onClick={() => navigate('/instructor/create-session')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{sessions.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'scheduled').length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">
                {sessions.reduce((total, session) => total + (session.max_slots - session.slots_available), 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">
                ${sessions.reduce((total, session) => total + (session.max_slots - session.slots_available) * session.price, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No interview sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first mock interview session to get started'
              }
            </p>
            <Button onClick={() => navigate('/instructor/create-session')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{session.title}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <Badge className={getDifficultyColor(session.difficulty_level)}>
                      {session.difficulty_level}
                    </Badge>
                  </div>
                  
                  {session.description && (
                    <p className="text-muted-foreground mb-3">{session.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.session_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration_minutes} minutes
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.max_slots - session.slots_available}/{session.max_slots} booked
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${session.price}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{session.topic}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {session.status === 'scheduled' && (
                    <Button 
                      onClick={() => startSession(session.id)}
                      className="flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Start Session
                    </Button>
                  )}
                  
                  {session.status === 'in_progress' && (
                    <Button 
                      onClick={() => navigate(`/interview/lobby/${session.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Room
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar for Bookings */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Bookings</span>
                  <span>{session.max_slots - session.slots_available} / {session.max_slots}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${((session.max_slots - session.slots_available) / session.max_slots) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
