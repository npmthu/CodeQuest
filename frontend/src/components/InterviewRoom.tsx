import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js';
// @ts-ignore
declare module 'simple-peer/simplepeer.min.js';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  Users, 
  AlertCircle,
  Loader2,
  Crown,
  User,
  RefreshCw,
  WifiOff,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import InterviewFeedbackModal from './InterviewFeedbackModal';

interface Participant {
  userId: string;
  role: string;
  joinedAt: string;
  mediaState?: {
    audioEnabled: boolean;
    videoEnabled: boolean;
  };
}

interface InterviewRoomProps {
  sessionId?: string;
}

export default function InterviewRoom({ sessionId: propSessionId }: InterviewRoomProps) {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const sessionId = propSessionId || urlSessionId;
  
  const navigate = useNavigate();
  const { user, session: authSession, profile } = useAuth();
  
  // Get user role from profile
  const userRole = profile?.role || 'learner';
  
  // Socket and WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // UI state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndReason, setSessionEndReason] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [disconnectedUsers, setDisconnectedUsers] = useState<Set<string>>(new Set());
  
  // Session details for feedback
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState<string>('Instructor');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, InstanceType<typeof Peer>>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const initiatedCallsRef = useRef<Set<string>>(new Set()); // Track initiated calls to prevent duplicates
  const pendingCallsRef = useRef<Array<{callerUserId: string, offer: any}>>([]); // Store pending incoming calls
  const maxReconnectAttempts = 5;

  // Fetch session and booking details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId || !authSession?.access_token) return;

      try {
        // Fetch session details
        const sessionResponse = await fetch(
          `${import.meta.env.VITE_API_BASE}/mock-interviews/sessions/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${authSession.access_token}`
            }
          }
        );

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.data?.instructor?.name) {
            setInstructorName(sessionData.data.instructor.name);
          }
        }

        // Fetch booking details (for learners only)
        if (userRole === 'learner') {
          const bookingsResponse = await fetch(
            `${import.meta.env.VITE_API_BASE}/mock-interviews/my-bookings`,
            {
              headers: {
                'Authorization': `Bearer ${authSession.access_token}`
              }
            }
          );

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            const booking = bookingsData.data?.bookings?.find(
              (b: any) => b.session_id === sessionId
            );
            if (booking?.id) {
              setBookingId(booking.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
      }
    };

    fetchSessionDetails();
  }, [sessionId, authSession?.access_token, userRole]);

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId || !authSession?.access_token) return;

    const API_URL = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:3000';
    const newSocket = io(API_URL, {
      auth: {
        token: authSession.access_token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to signaling server');
      // Join the interview room
      newSocket.emit('join-room', { sessionId });
    });

    newSocket.on('room-joined', (data) => {
      console.log('📱 Joined room:', data);
      setParticipants(data.participants || []);
      setIsConnecting(false);
      setConnectionError(null);
    });

    newSocket.on('room-join-error', (error) => {
      console.error('❌ Room join error:', error);
      setConnectionError(error.error);
      setIsConnecting(false);
      toast.error(error.error);
    });

    newSocket.on('user-joined', (data) => {
      console.log('👋 User joined:', data);
      setParticipants(prev => {
        // Avoid duplicates
        if (prev.some(p => p.userId === data.userId)) {
          return prev;
        }
        return [...prev, {
          userId: data.userId,
          role: data.role,
          joinedAt: new Date().toISOString()
        }];
      });
    });

    newSocket.on('user-left', (data) => {
      console.log('👋 User left:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      
      // Clean up peer connection
      const peer = peersRef.current.get(data.userId);
      if (peer) {
        peer.destroy();
        peersRef.current.delete(data.userId);
      }
      
      // Clean up tracking
      initiatedCallsRef.current.delete(data.userId);
      
      // Clean up remote stream
      const remoteStream = remoteStreams.get(data.userId);
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(data.userId);
          return newStreams;
        });
      }
    });

    newSocket.on('incoming-call', async (data) => {
      console.log('📞 [SOCKET] Incoming call event received from:', data.callerUserId);
      // Will be handled by separate useEffect
    });

    newSocket.on('call-answered', async (data) => {
      console.log('✅ Call answered:', data);
      // Will be handled by separate useEffect
    });

    newSocket.on('ice-candidate', async (data) => {
      console.log('🧊 ICE candidate from:', data);
      // Will be handled by separate useEffect
    });

    newSocket.on('media-toggled', (data) => {
      console.log('🎥 Media toggled:', data);
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId 
          ? { 
              ...p, 
              mediaState: {
                audioEnabled: p.mediaState?.audioEnabled ?? true,
                videoEnabled: p.mediaState?.videoEnabled ?? true,
                [data.mediaType]: data.isEnabled
              }
            }
          : p
      ));
    });

    // Handle session ended by instructor
    newSocket.on('session-ended', (data) => {
      console.log('🏁 Session ended:', data);
      setSessionEnded(true);
      setSessionEndReason(data.message || 'Session has ended');
      toast.info(data.message || 'The interview session has ended');
      cleanup();
    });

    // Handle user temporarily disconnected (may reconnect)
    newSocket.on('user-disconnected', (data) => {
      console.log('⚠️ User disconnected (may reconnect):', data);
      setDisconnectedUsers(prev => new Set(prev).add(data.userId));
      toast.warning(`${data.userId === user?.id ? 'You' : 'A participant'} lost connection. Waiting for reconnection...`);
    });

    // Handle reconnection events
    newSocket.on('reconnect-success', (data) => {
      console.log('🔄 Reconnected successfully:', data);
      setIsReconnecting(false);
      setIsConnecting(false);
      reconnectAttempts.current = 0;
      toast.success('Reconnected to session successfully!');
    });

    newSocket.on('reconnect-failed', (data) => {
      console.log('❌ Reconnection failed:', data);
      setIsReconnecting(false);
      if (data.status === 'completed' || data.status === 'cancelled') {
        setSessionEnded(true);
        setSessionEndReason('Session has ended');
      } else {
        setConnectionError(data.error || 'Failed to reconnect');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from signaling server');
      setIsConnecting(true);
      
      // Attempt automatic reconnection
      if (!sessionEnded && reconnectAttempts.current < maxReconnectAttempts) {
        setIsReconnecting(true);
        reconnectAttempts.current += 1;
        console.log(`🔄 Attempting reconnection (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        
        setTimeout(() => {
          if (socketRef.current?.connected) return;
          socketRef.current?.connect();
        }, 2000 * reconnectAttempts.current); // Exponential backoff
      }
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to signaling server');
      // If this is a reconnection, request to rejoin room
      if (isReconnecting && sessionId) {
        newSocket.emit('reconnect-request', { sessionId });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionError('Failed to connect to signaling server');
      setIsConnecting(false);
    });

    return () => {
      newSocket.close();
      cleanup();
    };
  }, [sessionId, authSession?.access_token, userRole]);

  // Initialize local media stream
  useEffect(() => {
    let mounted = true;

    const initializeMedia = async () => {
      try {
        console.log('🎥 Requesting camera/microphone access...');
        
        // Check if permissions are already granted
        if (navigator.permissions) {
          try {
            const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log('📋 Permissions:', {
              camera: cameraPermission.state,
              microphone: micPermission.state
            });
          } catch (err) {
            console.log('⚠️ Permission API not fully supported, proceeding anyway');
          }
        }

        // Request media with constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!mounted) {
          // Component unmounted, stop tracks
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        console.log('✅ Local media stream initialized:', {
          video: stream.getVideoTracks().length > 0,
          audio: stream.getAudioTracks().length > 0
        });

        setConnectionError(null);
      } catch (error: any) {
        if (!mounted) return;

        console.error('❌ Failed to get media stream:', error);
        
        // More detailed error messages
        let errorMessage = 'Failed to access camera/microphone. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Please allow camera and microphone permissions in your browser.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera or microphone found. Please connect a device.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += 'Camera or microphone is already in use by another application. Please close other apps using the camera.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Could not satisfy video/audio constraints. Trying with basic settings...';
          
          // Retry with minimal constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            
            if (mounted) {
              setLocalStream(basicStream);
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = basicStream;
              }
              console.log('✅ Initialized with basic settings');
              return;
            }
          } catch (retryError) {
            console.error('❌ Retry also failed:', retryError);
          }
        } else {
          errorMessage += `Error: ${error.message || 'Unknown error'}`;
        }
        
        setConnectionError(errorMessage);
        toast.error(errorMessage, { duration: 8000 });
      }
    };

    initializeMedia();

    return () => {
      mounted = false;
      // Don't cleanup stream here, let cleanup() handle it
    };
  }, []);

  // Ensure video element is updated when localStream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('🎥 Setting localVideoRef.srcObject');
      localVideoRef.current.srcObject = localStream;
      // Force play
      localVideoRef.current.play().catch(err => {
        console.warn('Auto-play prevented:', err);
      });
    }
  }, [localStream]);

  // Ensure remote video element is updated when remoteStreams changes
  useEffect(() => {
    console.log('🎥 [useEffect] Remote streams changed, size:', remoteStreams.size);
    
    if (remoteStreams.size > 0 && remoteVideoRef.current) {
      const stream = Array.from(remoteStreams.values())[0];
      console.log('🎥 Setting remoteVideoRef.srcObject, stream tracks:', stream.getTracks().length);
      remoteVideoRef.current.srcObject = stream;
      // Force play
      remoteVideoRef.current.play().catch(err => {
        console.warn('Auto-play prevented for remote video:', err);
      });
    } else if (remoteStreams.size === 0 && remoteVideoRef.current) {
      console.log('🎥 No remote streams, clearing video');
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStreams]);

  // WebRTC Functions
  const createPeer = useCallback((userId: string, initiator: boolean): InstanceType<typeof Peer> => {
    if (!localStream) {
      throw new Error('Local stream is not available');
    }
    
    if (localStream.getTracks().length === 0) {
      throw new Error('Local stream has no tracks');
    }
    
    const peer = new Peer({
      initiator,
      trickle: true,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (data: any) => {
      if (data.type === 'offer') {
        console.log('📤 [createPeer] Emitting call-user to:', userId);
        socketRef.current?.emit('call-user', {
          targetUserId: userId,
          offer: data
        });
      } else if (data.type === 'answer') {
        console.log('📤 [createPeer] Emitting answer-call to:', userId);
        socketRef.current?.emit('answer-call', {
          callerUserId: userId,
          answer: data
        });
      } else if (data.candidate) {
        console.log('🧊 [createPeer] Emitting ice-candidate to:', userId);
        socketRef.current?.emit('ice-candidate', {
          targetUserId: userId,
          candidate: data
        });
      }
    });

    peer.on('stream', (stream: any) => {
      console.log('📹 [createPeer] Received remote stream from:', userId, 'tracks:', stream.getTracks().length);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, stream);
        console.log('📹 [createPeer] Updated remoteStreams Map, size:', newMap.size);
        return newMap;
      });
    });

    peer.on('connect', () => {
      console.log('🤝 [createPeer] Peer connected:', userId);
    });

    peer.on('close', () => {
      console.log('🔌 [createPeer] Peer connection closed:', userId);
    });

    peer.on('error', (error: any) => {
      console.error('❌ [createPeer] Peer connection error:', error);
    });

    return peer;
  }, [localStream]);

  // Helper function to initiate call to a specific user
  const initiateCallToUser = useCallback((targetUserId: string, targetRole: string) => {
    if (!localStream || !socketRef.current || !user?.id) {
      console.log('⏳ Cannot initiate call: missing localStream, socket or user');
      return;
    }

    // Check if already connected or already initiated
    if (peersRef.current.has(targetUserId) || initiatedCallsRef.current.has(targetUserId)) {
      console.log('ℹ️ Already have peer connection or initiated call with:', targetUserId);
      return;
    }

    // Role-based: Instructor always initiates to learner
    let shouldInitiate = false;
    if (userRole === 'instructor' && targetRole === 'learner') {
      shouldInitiate = true;
    } else if (userRole === 'learner' && targetRole === 'instructor') {
      shouldInitiate = false; // Wait for instructor
    } else {
      // Same role - use user ID comparison as fallback
      shouldInitiate = user.id < targetUserId;
    }

    if (!shouldInitiate) {
      console.log(`⏳ Not initiating to ${targetRole} (waiting for them to initiate)`);
      return;
    }

    console.log('📞 Initiating call to:', targetUserId, 'role:', targetRole);
    
    // Mark as initiated to prevent duplicates
    initiatedCallsRef.current.add(targetUserId);
    
    try {
      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (data: any) => {
        if (data.type === 'offer') {
          console.log('📤 Emitting call-user to:', targetUserId);
          socketRef.current?.emit('call-user', {
            targetUserId: targetUserId,
            offer: data
          });
        } else if (data.candidate) {
          console.log('🧊 Emitting ice-candidate to:', targetUserId);
          socketRef.current?.emit('ice-candidate', {
            targetUserId: targetUserId,
            candidate: data
          });
        }
      });

      peer.on('stream', (stream: any) => {
        console.log('📹 [initiateCallToUser] Received remote stream from:', targetUserId, 'tracks:', stream.getTracks().length);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(targetUserId, stream);
          console.log('📹 Updated remoteStreams Map, size:', newMap.size);
          return newMap;
        });
      });

      peer.on('error', (error: any) => {
        console.error('❌ Peer connection error:', error);
        peersRef.current.delete(targetUserId);
        initiatedCallsRef.current.delete(targetUserId); // Allow retry
      });

      peer.on('close', () => {
        console.log('🔌 Peer connection closed:', targetUserId);
        peersRef.current.delete(targetUserId);
        initiatedCallsRef.current.delete(targetUserId); // Allow reconnect
      });

      peersRef.current.set(targetUserId, peer);
    } catch (err) {
      console.error('❌ Error creating peer connection:', err);
      initiatedCallsRef.current.delete(targetUserId); // Allow retry
    }
  }, [localStream, userRole, user?.id]);

  // Initiate calls to participants when localStream becomes available
  useEffect(() => {
    console.log('📞 Call initiation effect: localStream=', !!localStream, 'socket=', !!socketRef.current, 'participants=', participants.length);
    
    if (!localStream || !socketRef.current || !user?.id) {
      return;
    }
    
    // Check if localStream has tracks ready
    if (localStream.getTracks().length === 0) {
      console.log('⏳ Local stream has no tracks yet');
      return;
    }
    
    // Initiate calls to all participants
    participants.forEach(participant => {
      if (participant.userId !== user.id) {
        initiateCallToUser(participant.userId, participant.role);
      }
    });
  }, [localStream, participants, user?.id, initiateCallToUser]);
  // Remove old complex logic below
  // [Old useEffect removed]
  const handleIncomingCall = useCallback(async (callerUserId: string, offer: any) => {
    console.log('📞 [handleIncomingCall] Called from:', callerUserId, 'localStream ready?', !!localStream);
    
    if (!localStream) {
      console.warn('⚠️ Cannot handle incoming call: localStream not ready. Storing for later processing.');
      // Store this call to process later when localStream is ready
      pendingCallsRef.current.push({ callerUserId, offer });
      return;
    }

    console.log('📞 Handling incoming call from:', callerUserId);
    
    try {
      const peer = createPeer(callerUserId, false);
      peersRef.current.set(callerUserId, peer);
      
      peer.signal(offer);
    } catch (err) {
      console.error('❌ Error handling incoming call:', err);
    }
  }, [createPeer, localStream]);

  const handleCallAnswered = useCallback(async (answererUserId: string, answer: any) => {
    console.log('✅ [handleCallAnswered] Received answer from:', answererUserId);
    const peer = peersRef.current.get(answererUserId);
    if (peer && !peer.destroyed) {
      try {
        peer.signal(answer);
      } catch (err) {
        console.warn('⚠️ Failed to signal answer (peer may be destroyed):', err);
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: any) => {
    console.log('🧊 [handleIceCandidate] Received ICE candidate from:', fromUserId);
    const peer = peersRef.current.get(fromUserId);
    if (peer && !peer.destroyed) {
      try {
        peer.signal(candidate);
      } catch (err) {
        console.warn('⚠️ Failed to signal ICE candidate (peer may be destroyed):', err);
      }
    }
  }, []);

  // Setup socket event handlers with proper dependencies
  useEffect(() => {
    if (!socketRef.current) return;

    // Store previous handlers to clean them up
    const handleIncomingCallWrapper = async (data: any) => {
      console.log('📞 Handling incoming call wrapper from:', data.callerUserId);
      await handleIncomingCall(data.callerUserId, data.offer);
    };

    const handleCallAnsweredWrapper = async (data: any) => {
      console.log('✅ Call answered wrapper from:', data.answererUserId);
      await handleCallAnswered(data.answererUserId, data.answer);
    };

    const handleIceCandidateWrapper = async (data: any) => {
      console.log('🧊 ICE candidate wrapper from:', data.fromUserId);
      await handleIceCandidate(data.fromUserId, data.candidate);
    };

    // Register handlers
    socketRef.current.off('incoming-call');
    socketRef.current.off('call-answered');
    socketRef.current.off('ice-candidate');

    socketRef.current.on('incoming-call', handleIncomingCallWrapper);
    socketRef.current.on('call-answered', handleCallAnsweredWrapper);
    socketRef.current.on('ice-candidate', handleIceCandidateWrapper);

    return () => {
      socketRef.current?.off('incoming-call', handleIncomingCallWrapper);
      socketRef.current?.off('call-answered', handleCallAnsweredWrapper);
      socketRef.current?.off('ice-candidate', handleIceCandidateWrapper);
    };
  }, [handleIncomingCall, handleCallAnswered, handleIceCandidate]);

  // Process pending incoming calls when localStream becomes ready
  useEffect(() => {
    if (!localStream || pendingCallsRef.current.length === 0) {
      return;
    }

    console.log('📞 Processing', pendingCallsRef.current.length, 'pending incoming calls');
    
    const pending = [...pendingCallsRef.current];
    pendingCallsRef.current = []; // Clear the queue
    
    pending.forEach(({ callerUserId, offer }) => {
      console.log('📞 Processing pending call from:', callerUserId);
      handleIncomingCall(callerUserId, offer);
    });
  }, [localStream, handleIncomingCall]);

  // Media control functions
  const toggleAudio = useCallback(() => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isAudioEnabled;
      setIsAudioEnabled(!isAudioEnabled);
      
      socketRef.current?.emit('toggle-audio', {
        isEnabled: !isAudioEnabled
      });
    }
  }, [localStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
      
      socketRef.current?.emit('toggle-video', {
        isEnabled: !isVideoEnabled
      });
    }
  }, [localStream, isVideoEnabled]);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
    }
    cleanup();
    navigate('/dashboard');
  }, [navigate]);

  // End session - instructor only
  const endSession = useCallback(async () => {
    if (userRole !== 'instructor') {
      toast.error('Only instructor can end the session');
      return;
    }

    // Confirm before ending
    if (!window.confirm('Are you sure you want to end this interview session? This will disconnect all participants.')) {
      return;
    }

    try {
      // Emit end-session event via socket
      socketRef.current?.emit('end-session');
      
      // Also call API to update database
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/mock-interviews/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession?.access_token}`
        }
      });

      if (!response.ok) {
        console.warn('API call to end session failed, but socket event was sent');
      }

      toast.success('Session ended successfully');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  }, [userRole, sessionId, authSession?.access_token]);

  // Manual reconnect attempt
  const attemptReconnect = useCallback(() => {
    if (!sessionId || sessionEnded) return;
    
    setIsReconnecting(true);
    reconnectAttempts.current = 0;
    
    if (socketRef.current?.disconnected) {
      socketRef.current.connect();
    } else if (socketRef.current?.connected) {
      socketRef.current.emit('reconnect-request', { sessionId });
    }
  }, [sessionId, sessionEnded]);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up media streams and peer connections...');
    
    // Stop local stream tracks
    if (localStream) {
      console.log('🛑 Stopping', localStream.getTracks().length, 'local tracks');
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('  ✓ Stopped', track.kind, 'track');
      });
    }
    setLocalStream(null);

    // Stop local video element
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    // Stop remote video element
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const tracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    // Destroy all peer connections
    peersRef.current.forEach((peer, userId) => {
      console.log('🔌 Destroying peer connection:', userId);
      peer.destroy();
    });
    peersRef.current.clear();
    
    // Clear tracking
    initiatedCallsRef.current.clear();

    // Clear remote streams and stop their tracks
    remoteStreams.forEach((stream, userId) => {
      console.log('🛑 Stopping remote stream from:', userId);
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped remote track:', track.kind);
      });
    });
    setRemoteStreams(new Map());
    
    console.log('✅ Cleanup complete');
  }, [localStream, remoteStreams]);

  // Get the main remote stream (first available)
  const mainRemoteStream = remoteStreams.size > 0 
    ? Array.from(remoteStreams.values())[0] 
    : null;

  // Session ended screen
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 p-8 text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <PhoneOff className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-2">Session Ended</h2>
            <p className="text-gray-400">{sessionEndReason || 'The interview session has ended.'}</p>
          </div>
          <div className="space-y-3">
            {/* Feedback button for both learner and instructor */}
            <Button 
              onClick={() => setShowFeedbackModal(true)}
              className="w-full"
              variant="default"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {userRole === 'instructor' ? 'Rate System' : 'Leave Feedback'}
            </Button>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
              variant={userRole === 'learner' ? 'outline' : 'default'}
            >
              Return to Dashboard
            </Button>
            
            {userRole === 'learner' && (
              <Button 
                variant="ghost"
                onClick={() => navigate('/interviews')}
                className="w-full"
              >
                View More Sessions
              </Button>
            )}
          </div>
        </Card>

        {/* Feedback Modal */}
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
          }}
          sessionId={sessionId!}
          bookingId={bookingId || undefined}
          instructorName={instructorName}
          userRole={userRole as 'instructor' | 'learner'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Interview Room</h1>
              <p className="text-sm text-gray-400">Session ID: {sessionId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participants.length + 1} participants</span>
            </div>
            <Badge variant={userRole === 'instructor' ? 'default' : 'secondary'}>
              {userRole === 'instructor' ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Instructor
                </>
              ) : (
                <>
                  <User className="w-3 h-3 mr-1" />
                  Learner
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Connection Status Banner */}
        {isConnecting && (
          <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
            <p className="text-yellow-200">Connecting to interview room...</p>
          </div>
        )}

        {connectionError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <div className="flex items-center gap-3 text-red-200">
              <AlertCircle className="w-5 h-5" />
              <div className="flex-1">
                <h3 className="font-semibold">Connection Error</h3>
                <p className="text-sm text-red-300">{connectionError}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
                variant="outline"
                className="text-red-200 border-red-500"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Reconnecting Status Banner */}
        {isReconnecting && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <div>
                <p className="text-blue-200 font-medium">Reconnecting to session...</p>
                <p className="text-sm text-blue-300">
                  Attempt {reconnectAttempts.current} of {maxReconnectAttempts}
                </p>
              </div>
            </div>
            <Button 
              onClick={attemptReconnect} 
              size="sm"
              variant="outline"
              className="text-blue-200 border-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Now
            </Button>
          </div>
        )}

        {/* Disconnected Users Indicator */}
        {disconnectedUsers.size > 0 && (
          <div className="mb-4 p-3 bg-orange-900 border border-orange-700 rounded-lg">
            <div className="flex items-center gap-3 text-orange-200">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  {disconnectedUsers.size} participant(s) temporarily disconnected
                </p>
                <p className="text-sm text-orange-300">
                  They may be experiencing network issues. Waiting for reconnection...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Always show video grid */}
        <div className="max-w-7xl mx-auto">
            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Remote Video (Main) */}
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {mainRemoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400">Waiting for participant...</p>
                    </div>
                  </div>
                )}
                
                {/* Remote User Info */}
                {participants.length > 0 && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {participants[0].role === 'instructor' ? 'Instructor' : 'Learner'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400">Camera off</p>
                    </div>
                  </div>
                )}
                
                {/* Local User Info */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">You ({userRole})</span>
                  </div>
                </div>

                {/* Media Status Indicators */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {!isAudioEnabled && (
                    <div className="bg-red-600 p-2 rounded-full">
                      <MicOff className="w-4 h-4" />
                    </div>
                  )}
                  {!isVideoEnabled && (
                    <div className="bg-red-600 p-2 rounded-full">
                      <VideoOff className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <Card className="bg-gray-800 border-gray-700 px-6 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isAudioEnabled ? 'default' : 'destructive'}
                    size="lg"
                    onClick={toggleAudio}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant={isVideoEnabled ? 'default' : 'destructive'}
                    size="lg"
                    onClick={toggleVideo}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={leaveRoom}
                    className="rounded-full w-12 h-12 p-0"
                    title="Leave Room (Session continues)"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>

                  {/* End Session button - only for instructor */}
                  {userRole === 'instructor' && (
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={endSession}
                      className="flex items-center gap-2 px-4"
                      title="End Session for All"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span className="hidden sm:inline">End Session</span>
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <Card className="mt-4 bg-gray-800 border-gray-700 p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants ({participants.length + 1})
                </h3>
                <div className="space-y-2 text-white">
                  {/* Self */}
                  <div className="flex items-center justify-between text-sm text-white">
                    <div className="flex items-center gap-2 text-white">
                      <span className="font-medium">You</span>
                      <Badge variant="outline" className="text-xs text-white">
                        {userRole}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      {isAudioEnabled ? <Mic className="w-3 h-3 text-green-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                      {isVideoEnabled ? <Video className="w-3 h-3 text-green-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                  
                  {/* Other participants */}
                  {participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between text-sm text-white">
                      <div className="flex items-center gap-2">
                        <span>{participant.role === 'instructor' ? 'Instructor' : 'Learner'}</span>
                        <Badge variant="outline" className="text-xs text-white">
                          {participant.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.mediaState?.audioEnabled !== false ? <Mic className="w-3 h-3 text-green-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                        {participant.mediaState?.videoEnabled !== false ? <Video className="w-3 h-3 text-green-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
      </div>
    </div>
  );
}
