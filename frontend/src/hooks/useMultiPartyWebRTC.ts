import { useState, useCallback, useRef, useEffect } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { Socket } from 'socket.io-client';

// Types
export interface PeerConnection {
  peerId: string;
  userId: string;
  peer: InstanceType<typeof Peer>;
  stream: MediaStream | null;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

export interface UseMultiPartyWebRTCOptions {
  socket: Socket | null;
  localStream: MediaStream | null;
  currentUserId: string;
  currentUserRole: string;
  maxParticipants?: number;
  iceServers?: RTCIceServer[];
  onParticipantJoined?: (userId: string) => void;
  onParticipantLeft?: (userId: string) => void;
  onStreamAdded?: (userId: string, stream: MediaStream) => void;
  onStreamRemoved?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export interface UseMultiPartyWebRTCReturn {
  peers: Map<string, PeerConnection>;
  remoteStreams: Map<string, MediaStream>;
  initiateCall: (targetUserId: string, targetRole: string) => void;
  handleIncomingCall: (callerUserId: string, offer: any) => void;
  handleCallAnswered: (answererUserId: string, answer: any) => void;
  handleIceCandidate: (fromUserId: string, candidate: any) => void;
  removePeer: (userId: string) => void;
  cleanup: () => void;
  connectionStats: {
    totalPeers: number;
    connectedPeers: number;
    failedPeers: number;
  };
}

// Default ICE servers
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
];

// Maximum participants for mesh topology (beyond this, SFU is recommended)
const MESH_MAX_PARTICIPANTS = 6;

/**
 * Custom hook for managing multi-party WebRTC connections
 * Supports mesh topology for small groups (< 6 participants)
 */
export function useMultiPartyWebRTC({
  socket,
  localStream,
  currentUserId,
  currentUserRole,
  maxParticipants = MESH_MAX_PARTICIPANTS,
  iceServers = DEFAULT_ICE_SERVERS,
  onParticipantJoined,
  onParticipantLeft,
  onStreamAdded,
  onStreamRemoved,
  onError
}: UseMultiPartyWebRTCOptions): UseMultiPartyWebRTCReturn {
  
  // State
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Refs for stable access in callbacks
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const initiatedCallsRef = useRef<Set<string>>(new Set());
  const pendingCallsRef = useRef<Array<{ callerUserId: string; offer: any }>>([]);
  
  // Sync ref with state
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  /**
   * Create a new peer connection
   */
  const createPeerConnection = useCallback((
    targetUserId: string,
    initiator: boolean
  ): InstanceType<typeof Peer> | null => {
    if (!localStream) {
      console.error('[WebRTC] Cannot create peer: no local stream');
      return null;
    }

    if (localStream.getTracks().length === 0) {
      console.error('[WebRTC] Cannot create peer: local stream has no tracks');
      return null;
    }

    // Check mesh limit
    if (peersRef.current.size >= maxParticipants - 1) {
      console.warn(`[WebRTC] Mesh limit reached (${maxParticipants} participants). Consider using SFU.`);
      onError?.(new Error('Maximum participants reached for mesh topology'));
      return null;
    }

    console.log(`[WebRTC] Creating peer connection to ${targetUserId}, initiator: ${initiator}`);

    const peer = new Peer({
      initiator,
      trickle: true,
      stream: localStream,
      config: {
        iceServers,
        iceCandidatePoolSize: 10,
      }
    });

    // Signal handler - emit to signaling server
    peer.on('signal', (data: any) => {
      if (!socket) return;

      if (data.type === 'offer') {
        console.log(`[WebRTC] Sending offer to ${targetUserId}`);
        socket.emit('call-user', {
          targetUserId,
          offer: data
        });
      } else if (data.type === 'answer') {
        console.log(`[WebRTC] Sending answer to ${targetUserId}`);
        socket.emit('answer-call', {
          callerUserId: targetUserId,
          answer: data
        });
      } else if (data.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${targetUserId}`);
        socket.emit('ice-candidate', {
          targetUserId,
          candidate: data
        });
      }
    });

    // Stream received
    peer.on('stream', (stream: MediaStream) => {
      console.log(`[WebRTC] Received stream from ${targetUserId}, tracks: ${stream.getTracks().length}`);
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(targetUserId, stream);
        return newMap;
      });

      onStreamAdded?.(targetUserId, stream);
    });

    // Connection established
    peer.on('connect', () => {
      console.log(`[WebRTC] Connected to ${targetUserId}`);
      
      setPeers(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(targetUserId);
        if (existing) {
          newMap.set(targetUserId, { ...existing, connectionState: 'connected' });
        }
        return newMap;
      });

      onParticipantJoined?.(targetUserId);
    });

    // Connection closed
    peer.on('close', () => {
      console.log(`[WebRTC] Connection closed with ${targetUserId}`);
      removePeer(targetUserId);
    });

    // Error handling
    peer.on('error', (error: Error) => {
      console.error(`[WebRTC] Peer error with ${targetUserId}:`, error);
      
      setPeers(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(targetUserId);
        if (existing) {
          newMap.set(targetUserId, { ...existing, connectionState: 'failed' });
        }
        return newMap;
      });

      onError?.(error);
    });

    return peer;
  }, [localStream, socket, maxParticipants, iceServers, onParticipantJoined, onStreamAdded, onError]);

  /**
   * Initiate a call to a specific user
   * Role-based: Instructor initiates to learners, or use ID comparison for same roles
   */
  const initiateCall = useCallback((targetUserId: string, targetRole: string) => {
    if (!localStream || !socket || !currentUserId) {
      console.log('[WebRTC] Cannot initiate: missing requirements');
      return;
    }

    // Check if already connected or initiated
    if (peersRef.current.has(targetUserId) || initiatedCallsRef.current.has(targetUserId)) {
      console.log(`[WebRTC] Already have connection to ${targetUserId}`);
      return;
    }

    // Role-based call initiation logic
    let shouldInitiate = false;
    
    if (currentUserRole === 'instructor' && targetRole === 'learner') {
      // Instructor always initiates to learner
      shouldInitiate = true;
    } else if (currentUserRole === 'learner' && targetRole === 'instructor') {
      // Learner waits for instructor
      shouldInitiate = false;
    } else {
      // Same role - use ID comparison (lower ID initiates)
      shouldInitiate = currentUserId < targetUserId;
    }

    if (!shouldInitiate) {
      console.log(`[WebRTC] Waiting for ${targetUserId} to initiate (role: ${targetRole})`);
      return;
    }

    console.log(`[WebRTC] Initiating call to ${targetUserId} (${targetRole})`);
    
    // Mark as initiated
    initiatedCallsRef.current.add(targetUserId);

    const peer = createPeerConnection(targetUserId, true);
    if (!peer) {
      initiatedCallsRef.current.delete(targetUserId);
      return;
    }

    // Store peer connection
    const peerConnection: PeerConnection = {
      peerId: `${currentUserId}-${targetUserId}`,
      userId: targetUserId,
      peer,
      stream: null,
      connectionState: 'connecting'
    };

    setPeers(prev => {
      const newMap = new Map(prev);
      newMap.set(targetUserId, peerConnection);
      return newMap;
    });

  }, [localStream, socket, currentUserId, currentUserRole, createPeerConnection]);

  /**
   * Handle incoming call (create answering peer)
   */
  const handleIncomingCall = useCallback((callerUserId: string, offer: any) => {
    console.log(`[WebRTC] Incoming call from ${callerUserId}`);

    if (!localStream) {
      console.warn('[WebRTC] Local stream not ready, queuing call');
      pendingCallsRef.current.push({ callerUserId, offer });
      return;
    }

    // Check if we already have a connection
    if (peersRef.current.has(callerUserId)) {
      console.log(`[WebRTC] Already connected to ${callerUserId}, ignoring duplicate call`);
      return;
    }

    const peer = createPeerConnection(callerUserId, false);
    if (!peer) return;

    // Store peer connection
    const peerConnection: PeerConnection = {
      peerId: `${callerUserId}-${currentUserId}`,
      userId: callerUserId,
      peer,
      stream: null,
      connectionState: 'connecting'
    };

    setPeers(prev => {
      const newMap = new Map(prev);
      newMap.set(callerUserId, peerConnection);
      return newMap;
    });

    // Signal the offer to the peer
    peer.signal(offer);

  }, [localStream, currentUserId, createPeerConnection]);

  /**
   * Handle call answered (signal answer to initiating peer)
   */
  const handleCallAnswered = useCallback((answererUserId: string, answer: any) => {
    console.log(`[WebRTC] Call answered by ${answererUserId}`);
    
    const peerConnection = peersRef.current.get(answererUserId);
    if (!peerConnection || peerConnection.peer.destroyed) {
      console.warn(`[WebRTC] No valid peer for ${answererUserId}`);
      return;
    }

    try {
      peerConnection.peer.signal(answer);
    } catch (err) {
      console.warn('[WebRTC] Failed to signal answer:', err);
    }
  }, []);

  /**
   * Handle ICE candidate
   */
  const handleIceCandidate = useCallback((fromUserId: string, candidate: any) => {
    const peerConnection = peersRef.current.get(fromUserId);
    if (!peerConnection || peerConnection.peer.destroyed) {
      return;
    }

    try {
      peerConnection.peer.signal(candidate);
    } catch (err) {
      console.warn('[WebRTC] Failed to signal ICE candidate:', err);
    }
  }, []);

  /**
   * Remove a peer connection
   */
  const removePeer = useCallback((userId: string) => {
    console.log(`[WebRTC] Removing peer ${userId}`);

    const peerConnection = peersRef.current.get(userId);
    if (peerConnection) {
      if (!peerConnection.peer.destroyed) {
        peerConnection.peer.destroy();
      }
    }

    // Clean up refs
    initiatedCallsRef.current.delete(userId);

    // Update state
    setPeers(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      const stream = newMap.get(userId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        newMap.delete(userId);
      }
      return newMap;
    });

    onParticipantLeft?.(userId);
    onStreamRemoved?.(userId);
  }, [onParticipantLeft, onStreamRemoved]);

  /**
   * Cleanup all peer connections
   */
  const cleanup = useCallback(() => {
    console.log('[WebRTC] Cleaning up all peer connections');

    peersRef.current.forEach((peerConnection, userId) => {
      if (!peerConnection.peer.destroyed) {
        peerConnection.peer.destroy();
      }
    });

    initiatedCallsRef.current.clear();
    pendingCallsRef.current = [];

    setRemoteStreams(prev => {
      prev.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      return new Map();
    });

    setPeers(new Map());
  }, []);

  // Process pending calls when localStream becomes available
  useEffect(() => {
    if (localStream && pendingCallsRef.current.length > 0) {
      console.log(`[WebRTC] Processing ${pendingCallsRef.current.length} pending calls`);
      
      const pendingCalls = [...pendingCallsRef.current];
      pendingCallsRef.current = [];
      
      pendingCalls.forEach(({ callerUserId, offer }) => {
        handleIncomingCall(callerUserId, offer);
      });
    }
  }, [localStream, handleIncomingCall]);

  // Calculate connection stats
  const connectionStats = {
    totalPeers: peers.size,
    connectedPeers: Array.from(peers.values()).filter(p => p.connectionState === 'connected').length,
    failedPeers: Array.from(peers.values()).filter(p => p.connectionState === 'failed').length
  };

  return {
    peers,
    remoteStreams,
    initiateCall,
    handleIncomingCall,
    handleCallAnswered,
    handleIceCandidate,
    removePeer,
    cleanup,
    connectionStats
  };
}

// Export type for mesh vs SFU decision
export function shouldUseSFU(participantCount: number): boolean {
  return participantCount > MESH_MAX_PARTICIPANTS;
}

export default useMultiPartyWebRTC;
