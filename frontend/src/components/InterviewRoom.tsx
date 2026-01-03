import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user, session: authSession } = useAuth();
  
  // Socket and WebRTC state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer.Instance>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // UI state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId || !authSession?.access_token) return;

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
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
      setParticipants(prev => [...prev, {
        userId: data.userId,
        role: data.role,
        joinedAt: new Date().toISOString()
      }]);
      
      // If we're the instructor, initiate call with new user
      if (user?.role === 'instructor' && data.userId !== user.id) {
        initiateCall(data.userId);
      }
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
      await handleIncomingCall(data.callerUserId, data.offer);
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
                ...p.mediaState,
                [data.mediaType]: data.isEnabled
              }
            }
          : p
      ));
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
  }, [sessionId, authSession?.access_token, user?.role]);

  // Initialize local media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        console.log('📹 Local media stream initialized');
      } catch (error) {
        console.error('❌ Failed to get media stream:', error);
        setConnectionError('Failed to access camera/microphone');
        toast.error('Failed to access camera/microphone. Please check permissions.');
      }
    };

    initializeMedia();

    return () => {
      cleanup();
    };
  }, []);

  // WebRTC Functions
  const createPeer = useCallback((userId: string, initiator: boolean): Peer.Instance => {
    const peer = new Peer({
      initiator,
      trickle: true,
      stream: localStream || undefined,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        socketRef.current?.emit('call-user', {
          targetUserId: userId,
          offer: data
        });
      } else if (data.type === 'answer') {
        socketRef.current?.emit('answer-call', {
          callerUserId: userId,
          answer: data
        });
      } else if (data.candidate) {
        socketRef.current?.emit('ice-candidate', {
          targetUserId: userId,
          candidate: data.candidate
        });
      }
    });

    peer.on('stream', (stream) => {
      console.log('📹 Received remote stream from:', userId);
      setRemoteStreams(prev => new Map(prev.set(userId, stream)));
      
      // Set the first remote stream to the main video element
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('connect', () => {
      console.log('🤝 Peer connected:', userId);
    });

    peer.on('close', () => {
      console.log('🔌 Peer connection closed:', userId);
    });

    peer.on('error', (error) => {
      console.error('❌ Peer connection error:', error);
    });

    return peer;
  }, [localStream]);

  const initiateCall = useCallback(async (targetUserId: string) => {
    if (!localStream) return;

    console.log('📞 Initiating call to:', targetUserId);
    
    const peer = createPeer(targetUserId, true);
    peersRef.current.set(targetUserId, peer);
    setPeers(new Map(peersRef.current));
  }, [createPeer, localStream]);

  const handleIncomingCall = useCallback(async (callerUserId: string, offer: any) => {
    if (!localStream) return;

    console.log('📞 Handling incoming call from:', callerUserId);
    
    const peer = createPeer(callerUserId, false);
    peersRef.current.set(callerUserId, peer);
    setPeers(new Map(peersRef.current));
    
    peer.signal(offer);
  }, [createPeer, localStream]);

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
            <Badge variant={user?.role === 'instructor' ? 'default' : 'secondary'}>
              {user?.role === 'instructor' ? (
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
        {isConnecting && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Connecting to interview room...</p>
            </div>
          </div>
        )}

        {connectionError && (
          <div className="flex items-center justify-center h-96">
            <Card className="p-6 bg-red-900 border-red-700 max-w-md">
              <div className="flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Connection Error</h3>
                  <p className="text-sm text-red-300">{connectionError}</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </Card>
          </div>
        )}

        {!isConnecting && !connectionError && (
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
                    <span className="text-sm">You ({user?.role})</span>
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
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants ({participants.length + 1})
                </h3>
                <div className="space-y-2">
                  {/* Self */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">You</span>
                      <Badge variant="outline" className="text-xs">
                        {user?.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAudioEnabled ? <Mic className="w-3 h-3 text-green-500" /> : <MicOff className="w-3 h-3 text-red-500" />}
                      {isVideoEnabled ? <Video className="w-3 h-3 text-green-500" /> : <VideoOff className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                  
                  {/* Other participants */}
                  {participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{participant.role === 'instructor' ? 'Instructor' : 'Learner'}</span>
                        <Badge variant="outline" className="text-xs">
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
        )}
      </div>
    </div>
  );
}
