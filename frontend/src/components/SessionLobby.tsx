import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Video,
  Clock,
  User,
  Users,
  Loader2,
  Play,
  LogIn,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';

// ============================================
// INTERFACES
// ============================================

export interface InterviewSession {
  id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  instructor_id: string;
  student_id?: string;
  start_time: string;
  title?: string;
  topic?: string;
  instructor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export type UserRole = 'instructor' | 'student';

interface SessionLobbyProps {
  session: InterviewSession;
  currentUserRole: UserRole;
  onSessionStart?: () => void;
  onJoinSession?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export default function SessionLobby({
  session,
  currentUserRole,
  onSessionStart,
  onJoinSession,
}: SessionLobbyProps) {
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [currentStatus, setCurrentStatus] = useState<InterviewSession['status']>(session.status);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DEBUG: Log on mount
  useEffect(() => {
    console.log('🏠 SessionLobby MOUNTED');
    console.log('📋 Session:', session);
    console.log('👤 Role:', currentUserRole);
    console.log('📊 Initial status:', session.status);
  }, []);

  // ============================================
  // SUPABASE REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    // Create a unique channel name for this session
    const channelName = `session-lobby-${session.id}`;

    console.log(`🔌 Setting up realtime subscription for session: ${session.id}`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mock_interview_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          console.log('📡 Realtime update received:', payload);

          const newStatus = payload.new.status as InterviewSession['status'];
          const oldStatus = currentStatus;

          if (newStatus !== oldStatus) {
            setCurrentStatus(newStatus);

            // Show toast notification based on status change
            if (newStatus === 'in_progress') {
              toast.success('🎉 Session is now live!', {
                description: currentUserRole === 'student'
                  ? 'The instructor has started the session. You can join now!'
                  : 'Session started successfully.',
                duration: 5000,
              });
            } else if (newStatus === 'completed') {
              toast.info('Session has ended', {
                description: 'Thank you for participating!',
                duration: 5000,
              });
            } else if (newStatus === 'cancelled') {
              toast.error('Session cancelled', {
                description: 'This session has been cancelled by the instructor.',
                duration: 5000,
              });
            }
          }
        }
      )
      .on('system', { event: 'disconnect' }, () => {
        console.log('⚠️ Realtime disconnected');
        setIsConnected(false);
        toast.warning('Connection lost', {
          description: 'Attempting to reconnect...',
        });
      })
      .on('system', { event: 'reconnect' }, () => {
        console.log('✅ Realtime reconnected');
        setIsConnected(true);
        toast.success('Reconnected!');
      })
      .subscribe((status) => {
        console.log(`📡 Subscription status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log(`🔌 Cleaning up subscription for session: ${session.id}`);
      supabase.removeChannel(channel);
    };
  }, [session.id, currentUserRole]);

  // ============================================
  // API CALLS
  // ============================================

  const startSession = useCallback(async () => {
    console.log('🎬 ============ START SESSION CALLED ============');
    console.log('📊 State:', { currentStatus, isLoading, sessionId: session.id });
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Step 1: Getting auth session...');
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();

      if (authError || !authSession?.access_token) {
        console.error('❌ Auth failed:', authError);
        throw new Error('Authentication required. Please login again.');
      }

      console.log('✅ Step 1: Auth OK');

      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

      console.log('🚀 Step 2: Starting session:', { sessionId: session.id, API_URL });

      const response = await fetch(`${API_URL}/mock-interviews/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({ session_id: session.id }),
      });

      console.log('📡 Step 3: Response received:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        throw new Error(errorData.error || errorData.message || 'Failed to start session');
      }

      const data = await response.json();
      console.log('✅ Step 4: Session started successfully:', data);

      // Update local status immediately (don't wait for realtime)
      console.log('🔄 Step 5: Updating local status to in_progress');
      setCurrentStatus('in_progress');

      // Show success toast
      toast.success('Session started!', {
        description: 'Redirecting to interview room...',
      });

      // Callback for parent component
      console.log('📞 Step 6: Calling onSessionStart callback');
      onSessionStart?.();

      // Small delay to ensure state updates before navigation
      console.log('⏳ Step 7: Waiting 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to the interview room - use window.location for hard redirect
      const targetPath = `/interview/room/${session.id}`;
      console.log('🎯 Step 8: Navigating to:', targetPath);
      
      // Use window.location.href instead of navigate() to ensure hard redirect
      window.location.href = targetPath;
      
      console.log('✅ Step 9: window.location.href set - should redirect now');
      console.log('🏁 ============ END START SESSION ============');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      console.error('💥 ============ START SESSION ERROR ============');
      console.error('❌ Error:', errorMessage);
      console.error('❌ Full error:', err);
      setError(errorMessage);
      toast.error('Failed to start session', {
        description: errorMessage,
      });
    } finally {
      console.log('🔚 Finally: Setting isLoading to false');
      setIsLoading(false);
    }
  }, [session.id, navigate, onSessionStart, currentStatus, isLoading]);

  const joinSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();

      if (authError || !authSession?.access_token) {
        throw new Error('Authentication required. Please login again.');
      }

      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

      const response = await fetch(`${API_URL}/mock-interviews/join-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({ session_id: session.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to join session');
      }

      console.log('✅ Joined session successfully:', data);

      // Callback for parent component
      onJoinSession?.();

      // Navigate to the interview room
      navigate(`/interview/room/${session.id}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join session';
      console.error('❌ Error joining session:', errorMessage);
      setError(errorMessage);
      toast.error('Failed to join session', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [session.id, navigate, onJoinSession]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderConnectionBadge = () => (
    <div className="absolute top-4 right-4 z-10">
      <Badge
        variant={isConnected ? 'default' : 'destructive'}
        className={`flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-sm ${
          isConnected
            ? 'bg-green-100 text-green-700 border-green-300'
            : 'bg-red-100 text-red-700 border-red-300'
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span className="text-xs font-semibold">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 animate-pulse" />
            <span className="text-xs font-semibold">Reconnecting...</span>
          </>
        )}
      </Badge>
    </div>
  );

  const renderStatusBadge = () => {
    const statusConfig = {
      scheduled: {
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: Clock,
        text: 'Scheduled',
        pulse: false,
      },
      in_progress: {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle2,
        text: 'Live Now',
        pulse: true,
      },
      completed: {
        color: 'bg-slate-100 text-gray-800 border-slate-300',
        icon: CheckCircle2,
        text: 'Completed',
        pulse: false,
      },
      cancelled: {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: AlertCircle,
        text: 'Cancelled',
        pulse: false,
      },
    };

    const config = statusConfig[currentStatus];
    const Icon = config.icon;

    return (
      <Badge
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold ${config.color} backdrop-blur-sm`}
      >
        {config.pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-700"></span>
          </span>
        )}
        <Icon className="w-4 h-4" />
        {config.text}
      </Badge>
    );
  };

  const renderWaitingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Pulsing rings animation */}
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-20" />
        <div className="absolute inset-3 rounded-full border-4 border-indigo-300 animate-ping animation-delay-200 opacity-30" />
        <div className="absolute inset-6 rounded-full border-4 border-purple-300 animate-ping animation-delay-400 opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <Video className="w-12 h-12 text-gray-900" />
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold !text-gray-900 mb-3">
        {currentUserRole === 'student'
          ? 'Waiting for Host to Start'
          : 'Ready to Begin'}
      </h3>
      <p className="!text-gray-700 text-center max-w-md leading-relaxed">
        {currentUserRole === 'student'
          ? "You'll be notified automatically when the session begins. Please stay on this page."
          : "When you're ready, click the button below to start the interview session."}
      </p>
    </div>
  );

  const renderInstructorView = () => (
    <div className="flex flex-col items-center">
      {currentStatus === 'scheduled' && renderWaitingAnimation()}

      {currentStatus === 'in_progress' && (
        <div className="flex flex-col items-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 ring-8 ring-green-50">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold !text-gray-900 mb-3">Session is Live!</h3>
          <p className="!text-gray-700">You can now enter the interview room.</p>
        </div>
      )}

      <Button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('🖱️ ============ BUTTON CLICKED ============');
          console.log('📊 Current status:', currentStatus);
          console.log('🔒 Is disabled?', isLoading || currentStatus === 'completed' || currentStatus === 'cancelled');
          console.log('🔄 Is loading?', isLoading);
          
          if (currentStatus === 'scheduled') {
            console.log('➡️ Calling startSession...');
            startSession();
          } else {
            console.log('➡️ Navigating directly to room...');
            navigate(`/interview/room/${session.id}`);
          }
        }}
        disabled={isLoading || currentStatus === 'completed' || currentStatus === 'cancelled'}
        className={`mt-8 px-10 py-7 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 ${
          currentStatus === 'scheduled'
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-gray-900'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-gray-900'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Starting Session...
          </>
        ) : currentStatus === 'scheduled' ? (
          <>
            <Play className="w-5 h-5 mr-2" />
            Start Session
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Enter Room
          </>
        )}
      </Button>
    </div>
  );

  const renderStudentView = () => (
    <div className="flex flex-col items-center">
      {currentStatus === 'scheduled' && renderWaitingAnimation()}

      {currentStatus === 'in_progress' && (
        <div className="flex flex-col items-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce ring-8 ring-green-50">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold !text-gray-900 mb-3">Session is Live!</h3>
          <p className="!text-gray-700">The host has started. Join now!</p>
        </div>
      )}

      <Button
        onClick={joinSession}
        disabled={isLoading || currentStatus !== 'in_progress'}
        className={`mt-8 px-10 py-7 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 ${
          currentStatus === 'in_progress'
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-gray-900'
            : 'bg-slate-200 cursor-not-allowed opacity-70 text-gray-600'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Joining...
          </>
        ) : currentStatus === 'in_progress' ? (
          <>
            <LogIn className="w-6 h-6 mr-3" />
            Join Interview
          </>
        ) : (
          <>
            <Clock className="w-6 h-6 mr-3 animate-pulse" />
            Waiting for host to start...
          </>
        )}
      </Button>

      {currentStatus === 'scheduled' && (
        <p className="mt-6 text-sm !text-gray-700 flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Live status updates enabled
        </p>
      )}
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
        {/* Connection Status Badge */}
        {renderConnectionBadge()}

        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {renderStatusBadge()}
                <Badge
                  variant="outline"
                  className="bg-white/20 text-gray-900 border-white/30 backdrop-blur-sm"
                >
                  {currentUserRole === 'instructor' ? (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Host
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      Participant
                    </>
                  )}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold !text-gray-900 mb-3 drop-shadow-lg">
                {session.title || 'Mock Interview Session'}
              </h1>

              {session.topic && (
                <p className="!text-gray-700 mb-4 text-lg">{session.topic}</p>
              )}

              <div className="flex items-center gap-6 text-sm !text-gray-700">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Clock className="w-4 h-4" />
                  {formatTime(session.start_time)}
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">{formatDate(session.start_time)}</span>
              </div>
            </div>

            {/* Instructor Avatar */}
            {session.instructor && (
              <div className="flex flex-col items-center ml-4">
                <div className="w-20 h-20 rounded-full bg-white ring-4 ring-white/30 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-xl">
                  {session.instructor.avatar_url ? (
                    <img
                      src={session.instructor.avatar_url}
                      alt={session.instructor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    session.instructor.name?.charAt(0).toUpperCase() || 'I'
                  )}
                </div>
                <span className="text-xs text-gray-900 mt-2 font-medium bg-white/10 px-3 py-1 rounded-full">
                  {session.instructor.name || 'Instructor'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-10 bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {currentUserRole === 'instructor' ? renderInstructorView() : renderStudentView()}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-mono">Session ID: {session.id.slice(0, 8)}...</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Secure Connection
            </span>
          </div>
        </div>
      </Card>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
