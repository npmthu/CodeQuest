import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionLobby, { InterviewSession, UserRole } from './SessionLobby';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { toast } from 'sonner';

export default function InterviewLobbyPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !user) {
      setError('Session ID or user not found');
      setLoading(false);
      return;
    }

    fetchSessionData();
  }, [sessionId, user]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();

      if (authError || !authSession?.access_token) {
        throw new Error('Authentication required. Please login again.');
      }

      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

      // Fetch session details - FIX: Don't add /api prefix again
      const response = await fetch(`${API_URL}/mock-interviews/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load session' }));
        throw new Error(errorData.error || 'Failed to load session');
      }

      const result = await response.json();
      const sessionData = result.data || result;

      // Transform the data to match InterviewSession interface
      const transformedSession: InterviewSession = {
        id: sessionData.id,
        status: sessionData.status,
        instructor_id: sessionData.instructor_id,
        student_id: sessionData.student_id,
        start_time: sessionData.session_date,
        title: sessionData.title,
        topic: sessionData.topic,
        instructor: sessionData.instructor,
      };

      setSession(transformedSession);

      // Determine user role
      let isStudent = false;
      if (user && user.id === sessionData.instructor_id) {
        setUserRole('instructor');
      } else {
        setUserRole('student');
        isStudent = true;
      }

      // If student, automatically book session if not already booked
      if (isStudent) {
        await ensureStudentBooked(sessionData.id, authSession.access_token, API_URL);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      console.error('❌ Error loading session:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ensureStudentBooked = async (sessionId: string, token: string, apiUrl: string) => {
    try {
      // Check if already booked
      const bookingResponse = await fetch(`${apiUrl}/mock-interviews/bookings?session_id=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        // If there's at least one booking with confirmed or pending status, we're good
        if (bookingData.data && Array.isArray(bookingData.data) && bookingData.data.length > 0) {
          const hasValidBooking = bookingData.data.some((b: any) => 
            b.booking_status === 'confirmed' || b.booking_status === 'pending'
          );
          if (hasValidBooking) {
            console.log('✅ Student already has a valid booking');
            return;
          }
        }
      }

      // If no valid booking, attempt to book
      console.log('📝 Attempting to auto-book session...');
      const bookResponse = await fetch(`${apiUrl}/mock-interviews/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          notes: '',
        }),
      });

      if (!bookResponse.ok) {
        const bookError = await bookResponse.json();
        // If booking fails due to no slots, that's a different error
        if (bookError.error && bookError.error.includes('No slots available')) {
          setError(bookError.error);
          return;
        }
        console.warn('⚠️ Failed to auto-book session:', bookError.error);
        // Don't throw - let user try to book manually
        return;
      }

      console.log('✅ Session auto-booked successfully');
    } catch (err) {
      console.warn('⚠️ Error checking/booking session:', err);
      // Don't throw - session lobby will handle booking errors when user clicks Join
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-600 font-medium">Loading session...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !session || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Unable to Load Session</h2>
            <p className="text-slate-600">{error || 'Session not found'}</p>
            <button
              onClick={() => navigate('/interview')}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg"
            >
              Back to Interviews
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <SessionLobby
      session={session}
      currentUserRole={userRole}
      onSessionStart={() => {
        console.log('✅ Session started callback');
      }}
      onJoinSession={() => {
        console.log('✅ Joined session callback');
      }}
    />
  );
}
