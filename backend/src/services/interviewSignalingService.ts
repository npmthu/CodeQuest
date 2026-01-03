import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { supabaseAdmin } from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

interface RoomInfo {
  sessionId: string;
  participants: Map<string, {
    userId: string;
    socketId: string;
    role: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
}

export class InterviewSignalingService {
  private io: SocketIOServer;
  private rooms: Map<string, RoomInfo> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🔥 Interview signaling server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware for Socket.io
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify the token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
          return next(new Error('Invalid authentication token'));
        }

        // Fetch user profile to get role
        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        socket.userId = user.id;
        socket.userRole = profile?.role || 'student';
        socket.userEmail = user.email || '';
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`👤 User connected: ${socket.userId} (${socket.userRole})`);

      // Join interview room
      socket.on('join-room', async (data: { sessionId: string }) => {
        await this.handleJoinRoom(socket, data.sessionId);
      });

      // WebRTC signaling events
      socket.on('call-user', (data: { targetUserId: string; offer: any }) => {
        this.handleCallUser(socket, data);
      });

      socket.on('answer-call', (data: { callerUserId: string; answer: any }) => {
        this.handleAnswerCall(socket, data);
      });

      socket.on('ice-candidate', (data: { targetUserId: string; candidate: any }) => {
        this.handleIceCandidate(socket, data);
      });

      // Media control events
      socket.on('toggle-audio', (data: { isEnabled: boolean }) => {
        this.handleMediaToggle(socket, 'audio', data.isEnabled);
      });

      socket.on('toggle-video', (data: { isEnabled: boolean }) => {
        this.handleMediaToggle(socket, 'video', data.isEnabled);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Leave room explicitly
      socket.on('leave-room', () => {
        this.handleLeaveRoom(socket);
      });
    });
  }

  private async handleJoinRoom(socket: AuthenticatedSocket, sessionId: string) {
    try {
      // Validate booking/session access
      const hasAccess = await this.validateSessionAccess(socket.userId!, socket.userRole!, sessionId);
      
      if (!hasAccess) {
        socket.emit('room-join-error', { 
          error: 'Access denied: No valid booking found for this session' 
        });
        return;
      }

      // Get or create room
      let room = this.rooms.get(sessionId);
      if (!room) {
        room = {
          sessionId,
          participants: new Map(),
          createdAt: new Date()
        };
        this.rooms.set(sessionId, room);
      }

      // Add user to room
      socket.join(sessionId);
      
      room.participants.set(socket.userId!, {
        userId: socket.userId!,
        socketId: socket.id,
        role: socket.userRole!,
        joinedAt: new Date()
      });

      // Notify others in the room
      socket.to(sessionId).emit('user-joined', {
        userId: socket.userId,
        role: socket.userRole,
        participantCount: room.participants.size
      });

      // Send room info to the joining user
      const participants = Array.from(room.participants.values()).filter(
        p => p.userId !== socket.userId
      );

      socket.emit('room-joined', {
        sessionId,
        participantCount: room.participants.size,
        participants: participants.map(p => ({
          userId: p.userId,
          role: p.role,
          joinedAt: p.joinedAt
        }))
      });

      console.log(`📱 User ${socket.userId} joined room ${sessionId}. Participants: ${room.participants.size}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('room-join-error', { error: 'Failed to join room' });
    }
  }

  private async validateSessionAccess(userId: string, userRole: string, sessionId: string): Promise<boolean> {
    try {
      if (userRole === 'instructor' || userRole === 'business_partner') {
        // Check if user is the instructor for this session
        const { data: session } = await supabaseAdmin
          .from('mock_interview_sessions')
          .select('instructor_id')
          .eq('id', sessionId)
          .single();

        return session?.instructor_id === userId;
      } else {
        // Check if learner has a confirmed or pending booking for this session
        const { data: booking } = await supabaseAdmin
          .from('interview_bookings')
          .select('id')
          .eq('learner_id', userId)
          .eq('session_id', sessionId)
          .in('booking_status', ['confirmed', 'pending'])
          .single();

        return !!booking;
      }
    } catch (error) {
      console.error('Error validating session access:', error);
      return false;
    }
  }

  private handleCallUser(socket: AuthenticatedSocket, data: { targetUserId: string; offer: any }) {
    const room = this.findUserRoom(socket.userId!);
    if (!room) return;

    const targetParticipant = room.participants.get(data.targetUserId);
    if (!targetParticipant) {
      socket.emit('call-error', { error: 'Target user not found in room' });
      return;
    }

    // Relay the offer to the target user
    this.io.to(targetParticipant.socketId).emit('incoming-call', {
      callerUserId: socket.userId,
      callerRole: socket.userRole,
      offer: data.offer
    });

    console.log(`📞 Call initiated: ${socket.userId} -> ${data.targetUserId}`);
  }

  private handleAnswerCall(socket: AuthenticatedSocket, data: { callerUserId: string; answer: any }) {
    const room = this.findUserRoom(socket.userId!);
    if (!room) return;

    const callerParticipant = room.participants.get(data.callerUserId);
    if (!callerParticipant) return;

    // Relay the answer to the caller
    this.io.to(callerParticipant.socketId).emit('call-answered', {
      answererUserId: socket.userId,
      answer: data.answer
    });

    console.log(`✅ Call answered: ${socket.userId} -> ${data.callerUserId}`);
  }

  private handleIceCandidate(socket: AuthenticatedSocket, data: { targetUserId: string; candidate: any }) {
    const room = this.findUserRoom(socket.userId!);
    if (!room) return;

    const targetParticipant = room.participants.get(data.targetUserId);
    if (!targetParticipant) return;

    // Relay the ICE candidate
    this.io.to(targetParticipant.socketId).emit('ice-candidate', {
      fromUserId: socket.userId,
      candidate: data.candidate
    });
  }

  private handleMediaToggle(socket: AuthenticatedSocket, mediaType: 'audio' | 'video', isEnabled: boolean) {
    const room = this.findUserRoom(socket.userId!);
    if (!room) return;

    // Notify other participants
    socket.to(room.sessionId).emit('media-toggled', {
      userId: socket.userId,
      mediaType,
      isEnabled
    });

    console.log(`🎥 ${socket.userId} toggled ${mediaType}: ${isEnabled}`);
  }

  private handleLeaveRoom(socket: AuthenticatedSocket) {
    const room = this.findUserRoom(socket.userId!);
    if (!room) return;

    socket.leave(room.sessionId);
    room.participants.delete(socket.userId!);

    // Notify remaining participants
    socket.to(room.sessionId).emit('user-left', {
      userId: socket.userId,
      participantCount: room.participants.size
    });

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(room.sessionId);
    }

    console.log(`🚪 User ${socket.userId} left room ${room.sessionId}`);
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    const room = this.findUserRoom(socket.userId!);
    if (room) {
      this.handleLeaveRoom(socket);
    }

    console.log(`👋 User disconnected: ${socket.userId}`);
  }

  private findUserRoom(userId: string): RoomInfo | undefined {
    for (const room of this.rooms.values()) {
      if (room.participants.has(userId)) {
        return room;
      }
    }
    return undefined;
  }

  // Utility methods
  public getRoomStats() {
    return {
      totalRooms: this.rooms.size,
      totalParticipants: Array.from(this.rooms.values())
        .reduce((total, room) => total + room.participants.size, 0)
    };
  }

  public getRoomInfo(sessionId: string): RoomInfo | undefined {
    return this.rooms.get(sessionId);
  }
}
