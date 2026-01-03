import { Request, Response } from 'express';
import { MockInterviewService } from '../services/mockInterviewService';
import { AuthRequest } from '../middleware/auth';

export class MockInterviewController {
  private interviewService: MockInterviewService;

  constructor() {
    this.interviewService = new MockInterviewService();
  }

  /**
   * POST /api/mock-interviews/sessions
   * Create a new mock interview session (Instructor only)
   */
  async createSession(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      // Check if user is an instructor
      if (user.role !== 'instructor' && user.role !== 'business_partner') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only instructors can create interview sessions' 
        });
      }

      const sessionData = req.body;
      
      // Validate required fields
      const requiredFields = ['title', 'topic', 'session_date', 'duration_minutes', 'max_slots'];
      const missingFields = requiredFields.filter(field => !sessionData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate session date is in the future
      const sessionDate = new Date(sessionData.session_date);
      if (sessionDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Session date must be in the future'
        });
      }

      // Validate duration and slots
      if (sessionData.duration_minutes < 15 || sessionData.duration_minutes > 240) {
        return res.status(400).json({
          success: false,
          error: 'Duration must be between 15 and 240 minutes'
        });
      }

      if (sessionData.max_slots < 1 || sessionData.max_slots > 20) {
        return res.status(400).json({
          success: false,
          error: 'Max slots must be between 1 and 20'
        });
      }

      const session = await this.interviewService.createSession(user.id, sessionData);

      console.log('📅 Mock interview session created:', {
        sessionId: session.id,
        instructorId: user.id,
        topic: session.topic,
        date: session.session_date
      });

      res.status(201).json({
        success: true,
        data: session,
        message: 'Mock interview session created successfully'
      });
    } catch (error: any) {
      console.error('❌ Error creating mock interview session:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create mock interview session'
      });
    }
  }

  /**
   * GET /api/mock-interviews/sessions
   * Get all mock interview sessions with optional filters
   */
  async getSessions(req: AuthRequest, res: Response) {
    try {
      const filters = {
        instructor_id: req.query.instructor_id as string,
        topic: req.query.topic as string,
        difficulty_level: req.query.difficulty_level as string,
        status: req.query.status as string,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.interviewService.getSessions(filters);

      res.json({
        success: true,
        data: result,
        message: `Found ${result.sessions.length} sessions`
      });
    } catch (error: any) {
      console.error('❌ Error fetching mock interview sessions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch mock interview sessions'
      });
    }
  }

  /**
   * GET /api/mock-interviews/sessions/:id
   * Get a specific mock interview session by ID
   */
  async getSessionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const session = await this.interviewService.getSessionById(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Mock interview session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error: any) {
      console.error('❌ Error fetching mock interview session:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch mock interview session'
      });
    }
  }

  /**
   * POST /api/mock-interviews/book
   * Book a mock interview session (Learner only)
   */
  async bookSession(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const bookingData = req.body;
      
      if (!bookingData.session_id) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const booking = await this.interviewService.bookSession(user.id, bookingData);

      console.log('🎯 Mock interview session booked:', {
        bookingId: booking.id,
        sessionId: booking.session_id,
        learnerId: user.id,
        status: booking.booking_status
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Session booked successfully'
      });
    } catch (error: any) {
      console.error('❌ Error booking mock interview session:', error);
      
      // Handle specific booking errors
      if (error.message.includes('No slots available')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          code: 'NO_SLOTS_AVAILABLE'
        });
      }
      
      if (error.message.includes('already booked')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          code: 'ALREADY_BOOKED'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to book session'
      });
    }
  }

  /**
   * GET /api/mock-interviews/my-bookings
   * Get current user's bookings (both instructor and learner)
   */
  async getMyBookings(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const role = user.role === 'instructor' || user.role === 'business_partner' ? 'instructor' : 'learner';
      const filters = {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.interviewService.getUserBookings(user.id, role, filters);

      res.json({
        success: true,
        data: result,
        message: `Found ${result.bookings.length} bookings`
      });
    } catch (error: any) {
      console.error('❌ Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch bookings'
      });
    }
  }

  /**
   * POST /api/mock-interviews/start-session
   * Start an interview session (Instructor only)
   */
  async startSession(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (user.role !== 'instructor' && user.role !== 'business_partner') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only instructors can start sessions' 
        });
      }

      const { session_id } = req.body;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const session = await this.interviewService.startSession(user.id, { session_id });

      console.log('🚀 Mock interview session started:', {
        sessionId: session.id,
        instructorId: user.id
      });

      res.json({
        success: true,
        data: {
          session,
          session_token: `session_token_${session.id}_${Date.now()}`, // Mock session token
          interview_url: `/interview/${session.id}` // Frontend interview room URL
        },
        message: 'Session started successfully'
      });
    } catch (error: any) {
      console.error('❌ Error starting session:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('cannot be started')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start session'
      });
    }
  }

  /**
   * POST /api/mock-interviews/join-session
   * Join an interview session (Learner with valid booking)
   */
  async joinSession(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { session_id } = req.body;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const result = await this.interviewService.joinSession(user.id, { session_id });

      console.log('👋 User joined mock interview session:', {
        sessionId: session_id,
        userId: user.id,
        role: 'learner'
      });

      res.json({
        success: true,
        data: {
          session: result.session,
          join_url: result.joinUrl,
          session_token: `session_token_${session_id}_${user.id}_${Date.now()}`, // Mock session token
          interview_url: `/interview/${session_id}` // Frontend interview room URL
        },
        message: 'Joined session successfully'
      });
    } catch (error: any) {
      console.error('❌ Error joining session:', error);
      
      if (error.message.includes('No confirmed booking')) {
        return res.status(403).json({
          success: false,
          error: error.message,
          code: 'NO_BOOKING'
        });
      }

      if (error.message.includes('not currently active')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'SESSION_NOT_ACTIVE'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to join session'
      });
    }
  }

  /**
   * POST /api/mock-interviews/report-no-show
   * Report a learner as no-show (Instructor only)
   */
  async reportNoShow(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (user.role !== 'instructor' && user.role !== 'business_partner') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only instructors can report no-shows' 
        });
      }

      const { booking_id } = req.body;
      
      if (!booking_id) {
        return res.status(400).json({
          success: false,
          error: 'Booking ID is required'
        });
      }

      await this.interviewService.reportNoShow(booking_id);

      console.log('⚠️ No-show reported:', {
        bookingId: booking_id,
        instructorId: user.id
      });

      res.json({
        success: true,
        message: 'No-show reported successfully'
      });
    } catch (error: any) {
      console.error('❌ Error reporting no-show:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to report no-show'
      });
    }
  }
}
