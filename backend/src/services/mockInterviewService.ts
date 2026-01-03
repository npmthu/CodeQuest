import { supabaseAdmin as supabase } from '../config/database';
import { 
  MockInterviewSession, 
  InterviewBooking, 
  InterviewFeedback, 
  AISuggestionLog,
  SessionJoinLog,
  CreateSessionRequest,
  BookSessionRequest,
  CreateFeedbackRequest,
  AISuggestionRequest,
  StartSessionRequest,
  JoinSessionRequest
} from '../types/mockInterview';

export class MockInterviewService {
  // Session Management
  async createSession(instructorId: string, sessionData: CreateSessionRequest): Promise<MockInterviewSession> {
    try {
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .insert({
          instructor_id: instructorId,
          ...sessionData,
          session_date: new Date(sessionData.session_date).toISOString(),
          slots_available: sessionData.max_slots
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create interview session');
    }
  }

  async getSessions(filters?: {
    instructor_id?: string;
    topic?: string;
    difficulty_level?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: MockInterviewSession[]; total: number }> {
    try {
      let query = supabase
        .from('mock_interview_sessions')
        .select(`
          *,
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `, { count: 'exact' });

      // Apply filters
      if (filters?.instructor_id) {
        query = query.eq('instructor_id', filters.instructor_id);
      }
      if (filters?.topic) {
        query = query.ilike('topic', `%${filters.topic}%`);
      }
      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.date_from) {
        query = query.gte('session_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('session_date', filters.date_to);
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .order('session_date', { ascending: true })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        sessions: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch interview sessions');
    }
  }

  async getSessionById(sessionId: string): Promise<MockInterviewSession | null> {
    try {
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .select(`
          *,
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw new Error('Failed to fetch interview session');
    }
  }

  // Booking Management
  async bookSession(learnerId: string, bookingData: BookSessionRequest): Promise<InterviewBooking> {
    const client = supabase; // In production, use transaction

    try {
      // Step 1: Check if session exists and has slots
      const { data: session, error: sessionError } = await client
        .from('mock_interview_sessions')
        .select('*')
        .eq('id', bookingData.session_id)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      if (session.slots_available <= 0) {
        throw new Error('No slots available for this session');
      }

      // Step 2: Check if user already booked this session
      const { data: existingBooking } = await client
        .from('interview_bookings')
        .select('*')
        .eq('session_id', bookingData.session_id)
        .eq('learner_id', learnerId)
        .single();

      if (existingBooking) {
        throw new Error('You have already booked this session');
      }

      // Step 3: Create booking with PENDING status
      const { data: booking, error: bookingError } = await client
        .from('interview_bookings')
        .insert({
          session_id: bookingData.session_id,
          learner_id: learnerId,
          booking_status: 'pending',
          payment_status: 'pending',
          payment_amount: session.price,
          payment_id: `mock_payment_${Date.now()}`,
          notes: bookingData.notes
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Step 4: Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate payment delay

      // Step 5: Update booking to CONFIRMED and decrement slots
      const { data: confirmedBooking, error: confirmError } = await client
        .from('interview_bookings')
        .update({
          booking_status: 'confirmed',
          payment_status: 'paid',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (confirmError) throw confirmError;

      // Step 6: Decrement available slots
      const { error: slotError } = await client
        .from('mock_interview_sessions')
        .update({
          slots_available: session.slots_available - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingData.session_id);

      if (slotError) throw slotError;

      return confirmedBooking;
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async getUserBookings(userId: string, role: 'learner' | 'instructor', filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: InterviewBooking[]; total: number }> {
    try {
      let query = supabase
        .from('interview_bookings')
        .select(`
          *,
          session:mock_interview_sessions(*, instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)),
          learner:users(id, display_name, email, avatar_url)
        `, { count: 'exact' });

      if (role === 'learner') {
        query = query.eq('learner_id', userId);
      } else {
        query = query.eq('session.instructor_id', userId);
      }

      if (filters?.status) {
        query = query.eq('booking_status', filters.status);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .order('booked_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        bookings: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  // Session Management
  async startSession(instructorId: string, sessionData: StartSessionRequest): Promise<MockInterviewSession> {
    try {
      // Verify instructor owns this session
      const { data: session, error: fetchError } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('id', sessionData.session_id)
        .eq('instructor_id', instructorId)
        .single();

      if (fetchError || !session) {
        throw new Error('Session not found or access denied');
      }

      if (session.status !== 'scheduled') {
        throw new Error('Session cannot be started');
      }

      // Update session status
      const { data: updatedSession, error: updateError } = await supabase
        .from('mock_interview_sessions')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.session_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log instructor join
      await this.logSessionJoin(sessionData.session_id, instructorId, 'instructor');

      return updatedSession;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async joinSession(userId: string, sessionData: JoinSessionRequest, userRole?: string): Promise<{ session: MockInterviewSession; joinUrl: string }> {
    try {
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('id', sessionData.session_id)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      // Verify access based on role
      if (userRole === 'instructor' || userRole === 'business_partner') {
        // Instructor must be the session owner
        if (session.instructor_id !== userId) {
          throw new Error('Only the instructor of this session can join');
        }
      } else {
        // Learner must have a confirmed or pending booking
        const { data: booking, error: bookingError } = await supabase
          .from('interview_bookings')
          .select('id')
          .eq('session_id', sessionData.session_id)
          .eq('learner_id', userId)
          .in('booking_status', ['confirmed', 'pending'])
          .single();

        if (bookingError || !booking) {
          throw new Error('No confirmed booking found for this session');
        }
      }

      // Allow joining if session is scheduled or in_progress
      // Only prevent joining if session is completed or cancelled
      if (session.status === 'completed' || session.status === 'cancelled') {
        throw new Error(`Cannot join: Session has ${session.status}`);
      }

      // Log join
      const role = userRole === 'instructor' || userRole === 'business_partner' ? 'instructor' : 'learner';
      await this.logSessionJoin(sessionData.session_id, userId, role);

      return {
        session,
        joinUrl: session.session_link || `https://meet.example.com/session/${session.id}`
      };
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  private async logSessionJoin(sessionId: string, userId: string, role: 'instructor' | 'learner'): Promise<void> {
    try {
      await supabase
        .from('session_join_logs')
        .insert({
          session_id: sessionId,
          user_id: userId,
          user_role: role,
          joined_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging session join:', error);
      // Don't throw - this is not critical
    }
  }

  // Feedback Management
  async createFeedback(instructorId: string, feedbackData: CreateFeedbackRequest): Promise<InterviewFeedback> {
    try {
      // Verify instructor owns the booking
      const { data: booking, error: bookingError } = await supabase
        .from('interview_bookings')
        .select(`
          *,
          session:mock_interview_sessions(instructor_id)
        `)
        .eq('id', feedbackData.booking_id)
        .single();

      if (bookingError || !booking) {
        throw new Error('Booking not found');
      }

      if (booking.session?.instructor_id !== instructorId) {
        throw new Error('Only the assigned instructor can provide feedback');
      }

      // Create feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from('interview_feedback')
        .insert({
          instructor_id: instructorId,
          learner_id: booking.learner_id,
          overall_rating: feedbackData.overall_rating,
          technical_rating: feedbackData.technical_rating,
          communication_rating: feedbackData.communication_rating,
          problem_solving_rating: feedbackData.problem_solving_rating,
          strengths: feedbackData.strengths,
          areas_for_improvement: feedbackData.areas_for_improvement,
          recommendations: feedbackData.recommendations,
          detailed_feedback: feedbackData.detailed_feedback,
          is_public: feedbackData.is_public || false
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      return feedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getLearnerFeedback(learnerId: string, filters?: {
    session_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ feedback: InterviewFeedback[]; total: number }> {
    try {
      let query = supabase
        .from('interview_feedback')
        .select(`
          *,
          booking:interview_bookings(*, session:mock_interview_sessions(*)),
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `, { count: 'exact' })
        .eq('learner_id', learnerId);

      if (filters?.session_id) {
        query = query.eq('booking.session_id', filters.session_id);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .order('feedback_date', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        feedback: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw new Error('Failed to fetch feedback');
    }
  }

  // AI Suggestions Service
  async generateAISuggestion(userId: string, request: AISuggestionRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      let result;
      const aiService = (await import('./aiService')).default;

      switch (request.type) {
        case 'topic_suggestion':
          // Generate topic suggestions using a custom prompt
          result = await this.generateTopicSuggestions(request.content, request.context);
          break;
        case 'summary':
          result = await aiService.generateSummary(request.content);
          break;
        case 'mindmap':
          result = await aiService.generateMindmap(request.content);
          break;
        case 'hint':
          result = await this.generateHint(request.content, request.context);
          break;
        case 'code_review':
          result = await aiService.reviewCode(request.content, request.context?.language || 'javascript', request.context?.problem_description);
          break;
        default:
          throw new Error('Invalid suggestion type');
      }

      const processingTime = Date.now() - startTime;

      // Log the AI suggestion
      await supabase
        .from('ai_suggestion_logs')
        .insert({
          user_id: userId,
          suggestion_type: request.type,
          input_content: request.content,
          output_content: result,
          context_metadata: request.context,
          tokens_used: result.tokensUsed || 0,
          processing_time_ms: processingTime
        });

      return result;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      throw new Error('Failed to generate AI suggestion');
    }
  }

  // Helper methods for AI suggestions that don't exist in the main AI service
  private async generateTopicSuggestions(topic: string, context?: any): Promise<any> {
    // This would use the AI service to generate topic suggestions
    // For now, return mock suggestions
    return {
      suggestions: [
        `Introduction to ${topic}`,
        `Advanced ${topic} concepts`,
        `Practical ${topic} exercises`,
        `Common ${topic} interview questions`,
        `Best practices in ${topic}`
      ],
      tokensUsed: 150
    };
  }

  private async generateHint(problemContext: string, context?: any): Promise<any> {
    // Generate a progressive hint based on the problem context
    const hintLevel = context?.hint_level || 'gentle';
    
    const hints = {
      gentle: "Think about the fundamental approach. What's the first step?",
      moderate: "Consider the data structures involved. What would be most efficient?",
      strong: "Look at similar problems you've solved. Can you adapt that approach?"
    };

    return {
      hint: hints[hintLevel as keyof typeof hints] || hints.gentle,
      tokensUsed: 50
    };
  }

  // Utility Methods
  async updateSessionStatus(sessionId: string, status: MockInterviewSession['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('mock_interview_sessions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw new Error('Failed to update session status');
    }
  }

  async reportNoShow(bookingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('interview_bookings')
        .update({
          no_show_reported: true,
          booking_status: 'no_show'
        })
        .eq('id', bookingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reporting no-show:', error);
      throw new Error('Failed to report no-show');
    }
  }
}
