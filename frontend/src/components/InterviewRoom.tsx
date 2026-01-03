import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users, 
  AlertCircle,
  Loader2,
  Crown,
  User,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<Map<string, any>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // UI state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, any>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId || !authSession?.access_token) return;

    const API_URL = (import.meta as any).env?.VITE_API_BASE?.replace('/api', '') || 'http://localhost:3000';
    const newSocket = io(API_URL, {
      auth: {
        token: authSession.access_token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

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
      
      // Note: Call initiation will happen in a separate useEffect when localStream is ready
    });

    newSocket.on('user-left', (data) => {
      console.log('👋 User left:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      
      // Clean up peer connection
      const peer = peersRef.current.get(data.userId);
      if (peer) {
        peer.destroy();
        peersRef.current.delete(data.userId);
        setPeers(new Map(peersRef.current));
      }
      
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
      console.log('📞 Incoming call from:', data);
      await handleIncomingCall(data);
    });

    newSocket.on('call-answered', async (data) => {
      console.log('✅ Call answered:', data);
      await handleCallAnswered(data.answererUserId, data.answer);
    });

    newSocket.on('ice-candidate', async (data) => {
      console.log('🧊 ICE candidate from:', data);
      await handleIceCandidate(data.fromUserId, data.candidate);
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

    // Chat event handlers
    newSocket.on('receive-message', (data) => {
      console.log('💬 Received message:', data);
      const newMessage: Message = {
        sender: data.senderName || 'Unknown',
        text: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from signaling server');
      setIsConnecting(true);
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
  }, [sessionId, authSession?.access_token, userRole, isChatOpen]);

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
    if (remoteStreams.size > 0 && remoteVideoRef.current) {
      const stream = Array.from(remoteStreams.values())[0];
      console.log('🎥 Setting remoteVideoRef.srcObject', stream);
      remoteVideoRef.current.srcObject = stream;
      // Force play
      remoteVideoRef.current.play().catch(err => {
        console.warn('Auto-play prevented for remote video:', err);
      });
    }
  }, [remoteStreams]);

  // WebRTC Functions
  const createPeer = useCallback((userId: string, initiator: boolean): any => {
    try {
      // Use dynamic import with polyfills in place
      return import('simple-peer').then(({ default: SimplePeer }) => {
        if (!SimplePeer) {
          console.error('❌ SimplePeer is not available');
          return null;
        }

        const peer = new SimplePeer({
          initiator,
          trickle: false, // Disable trickle for better compatibility
          stream: localStream || undefined,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        return peer;
      });
    } catch (error) {
      console.error('❌ Failed to create peer in createPeer:', error);
      return Promise.resolve(null);
    }
  }, [localStream]);

  // Handle incoming calls from other participants
  const handleIncomingCall = useCallback(async (data: any) => {
    console.log('📞 Incoming call from:', data.callerUserId);
    
    if (!localStream || !socketRef.current) return;

    const peerPromise = createPeer(data.callerUserId, false);
    const peer = await peerPromise;
    if (!peer) return;

    // Signal the offer
    peer.signal(data.offer);

    // Store the peer
    peersRef.current.set(data.callerUserId, peer);

    // Set up peer event handlers
    peer.on('signal', (answerData: any) => {
      if (answerData.type === 'answer') {
        socketRef.current?.emit('answer-call', {
          callerUserId: data.callerUserId,
          answer: answerData
        });
      } else if (answerData.candidate) {
        socketRef.current?.emit('ice-candidate', {
          targetUserId: data.callerUserId,
          candidate: answerData.candidate
        });
      }
    });

    peer.on('stream', (stream: any) => {
      console.log('📹 Received remote stream from:', data.callerUserId);
      setRemoteStreams(prev => new Map(prev.set(data.callerUserId, stream)));
      
      // Set the first remote stream to the main video element
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(err => {
          console.warn('Auto-play prevented for remote video:', err);
        });
      }
    });

    peer.on('connect', () => {
      console.log('🤝 Peer connected:', data.callerUserId);
    });

    peer.on('error', (error: any) => {
      console.error('❌ Peer connection error:', error);
      peersRef.current.delete(data.callerUserId);
    });

    peer.on('close', () => {
      console.log('📞 Peer connection closed:', data.callerUserId);
      peersRef.current.delete(data.callerUserId);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.callerUserId);
        return newMap;
      });
    });
  }, [localStream, createPeer]);

  // Initiate calls to participants when localStream becomes available (for instructor)
  useEffect(() => {
    if (!localStream || !socketRef.current) return;
    
    // If we're the instructor, initiate calls to all existing participants
    if (userRole === 'instructor') {
      participants.forEach(participant => {
        // Only call if we haven't already established a peer connection
        if (participant.userId !== user?.id && !peersRef.current.has(participant.userId)) {
          console.log('📞 Initiating call to participant:', participant.userId);
          
          // Create peer with proper error handling
          (async () => {
            const peerPromise = createPeer(participant.userId, true);
            const peer = await peerPromise;
            if (!peer) {
              console.error('❌ Failed to create peer for participant:', participant.userId);
              return;
            }

          peer.on('signal', (data: any) => {
            if (data.type === 'offer') {
              socketRef.current?.emit('call-user', {
                targetUserId: participant.userId,
                offer: data
              });
            } else if (data.candidate) {
              socketRef.current?.emit('ice-candidate', {
                targetUserId: participant.userId,
                candidate: data.candidate
              });
            }
          });

          peer.on('stream', (stream: any) => {
            console.log('📹 Received remote stream from:', participant.userId);
            setRemoteStreams(prev => new Map(prev.set(participant.userId, stream)));
          });

          peer.on('connect', () => {
            console.log('🤝 Peer connected:', participant.userId);
          });

          peer.on('error', (error: any) => {
            console.error('❌ Peer connection error:', error);
          });

          peersRef.current.set(participant.userId, peer);
          setPeers(new Map(peersRef.current));
        })();
      }
      });
    }
  }, [localStream, participants, userRole, user?.id, createPeer]);

  const handleCallAnswered = useCallback(async (answererUserId: string, answer: any) => {
    const peer = peersRef.current.get(answererUserId);
    if (peer) {
      peer.signal(answer);
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: any) => {
    const peer = peersRef.current.get(fromUserId);
    if (peer) {
      peer.signal(candidate);
    }
  }, []);

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

  // Chat functions
  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !socketRef.current || !user) return;
    
    const message = messageInput.trim();
    const newMessage: Message = {
      sender: user.user_metadata?.full_name || user.email || 'Me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    // Add to local state immediately
    setMessages(prev => [...prev, newMessage]);
    
    // Send to server
    socketRef.current.emit('send-message', {
      sessionId,
      message,
      senderName: newMessage.sender
    });
    
    // Clear input
    setMessageInput('');
  }, [messageInput, sessionId, user]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => {
      if (prev) {
        // Closing chat, reset unread count
        setUnreadCount(0);
      }
      return !prev;
    });
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
    }
    cleanup();
    navigate('/dashboard');
  }, [navigate]);

  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Destroy all peer connections
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();
    setPeers(new Map());

    // Clear remote streams
    remoteStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    setRemoteStreams(new Map());
  }, [localStream, remoteStreams]);

  // Get the main remote stream (first available)
  const mainRemoteStream = remoteStreams.size > 0 
    ? Array.from(remoteStreams.values())[0] 
    : null;

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
            
            {/* Chat Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="relative text-gray-300 hover:text-white"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
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
      <div className="flex-1 flex">
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

          {/* Video Grid */}
          <div className="max-w-7xl mx-auto">
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
                    variant="destructive"
                    size="lg"
                    onClick={leaveRoom}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
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

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-center text-sm">No messages yet. Start a conversation!</p>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {!message.isMe && (
                          <p className="text-xs font-medium mb-1 opacity-75">{message.sender}</p>
                        )}
                        <p className="text-sm break-words">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
