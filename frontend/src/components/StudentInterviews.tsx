import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Video, 
  Calendar,
  Clock,
  DollarSign,
  Search,
  ChevronRight,
  Loader2,
  User,
  Crown,
  Users,
  VideoOff
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
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface InterviewBooking {
  id: string;
  session_id: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_amount?: number;
  booked_at: string;
  confirmed_at?: string;
  session?: MockInterviewSession;
}

export default function StudentInterviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableSessions, setAvailableSessions] = useState<MockInterviewSession[]>([]);
  const [myBookings, setMyBookings] = useState<InterviewBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'my-bookings'>('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get token from useAuth context instead of localStorage
      if (!user) {
        throw new Error('Not authenticated. Please login first.');
      }
      
      // Get fresh session token from Supabase
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Session expired. Please login again.');
      }
      
      const token = session.access_token;
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      console.log('📌 Using token for API call:', {
        userId: user.id,
        tokenLength: token?.length,
        hasToken: !!token
      });
      
      // Fetch available sessions (no /api prefix - already in VITE_API_BASE)
      const sessionsResponse = await fetch(`${API_URL}/mock-interviews/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch user bookings (no /api prefix - already in VITE_API_BASE)
      const bookingsResponse = await fetch(`${API_URL}/mock-interviews/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (sessionsResponse.ok) {
        const sessionsResult = await sessionsResponse.json();
        setAvailableSessions(sessionsResult.data?.sessions || []);
      } else {
        console.error('Sessions response error:', sessionsResponse.status, await sessionsResponse.text());
      }

      if (bookingsResponse.ok) {
        const bookingsResult = await bookingsResponse.json();
        setMyBookings(bookingsResult.data?.bookings || []);
      } else {
        console.error('Bookings response error:', bookingsResponse.status, await bookingsResponse.text());
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load interview data');
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (sessionId: string) => {
    try {
      if (!user) {
        throw new Error('Not authenticated. Please login first.');
      }
      
      // Get fresh session token from Supabase
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Session expired. Please login again.');
      }
      
      const token = session.access_token;
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      console.log('🔑 Booking with token:', {
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 30)
      });
      
      const response = await fetch(`${API_URL}/mock-interviews/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          session_id: sessionId,
          notes: 'Looking forward to this interview session!'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book session');
      }

      await response.json();
      toast.success('Session booked successfully!');
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error booking session:', error);
      toast.error(error.message || 'Failed to book session');
    }
  };

  const joinSession = async (sessionId: string) => {
    // Navigate to lobby/waiting room instead of directly joining
    navigate(`/interview/lobby/${sessionId}`);
  };

  const filteredSessions = availableSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasSlots = session.slots_available > 0;
    const isUpcoming = new Date(session.session_date) > new Date();
    return matchesSearch && hasSlots && isUpcoming;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no_show': return 'bg-red-100 text-red-700';
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
          <p className="text-muted-foreground">Practice with expert instructors</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">{filteredSessions.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booked</p>
              <p className="text-2xl font-bold">{myBookings.filter(b => b.booking_status === 'confirmed').length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{myBookings.filter(b => b.booking_status === 'completed').length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                ${myBookings.reduce((total, booking) => total + (booking.payment_amount || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'available'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Available Sessions
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my-bookings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Bookings
        </button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={activeTab === 'available' ? "Search available sessions..." : "Search your bookings..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No available sessions</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Check back later for new interview sessions'}
              </p>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{session.title}</h3>
                      <Badge className={getDifficultyColor(session.difficulty_level)}>
                        {session.difficulty_level}
                      </Badge>
                      <Badge variant="outline">{session.topic}</Badge>
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
                        {session.slots_available} slots left
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${session.price}
                      </div>
                    </div>
                    
                    {/* Instructor Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.instructor?.name}</p>
                        <p className="text-sm text-muted-foreground">Expert Instructor</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => bookSession(session.id)}
                      className="flex items-center gap-2"
                      disabled={session.slots_available === 0}
                    >
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Book your first mock interview session to get started
              </p>
              <Button onClick={() => setActiveTab('available')}>
                Browse Available Sessions
              </Button>
            </Card>
          ) : (
            myBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{booking.session?.title}</h3>
                      <Badge className={getStatusColor(booking.booking_status)}>
                        {booking.booking_status}
                      </Badge>
                      {booking.session && (
                        <Badge className={getDifficultyColor(booking.session.difficulty_level)}>
                          {booking.session.difficulty_level}
                        </Badge>
                      )}
                    </div>
                    
                    {booking.session?.description && (
                      <p className="text-muted-foreground mb-3">{booking.session.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.session ? new Date(booking.session.session_date).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.session?.duration_minutes} minutes
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${booking.payment_amount}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {booking.session?.instructor?.name}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Booked on: {new Date(booking.booked_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {booking.booking_status === 'confirmed' && (
                      <Button 
                        onClick={() => joinSession(booking.session_id)}
                        className="flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Session
                      </Button>
                    )}
                    
                    {booking.booking_status === 'completed' && (
                      <Button variant="outline" disabled>
                        <VideoOff className="w-4 h-4" />
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
