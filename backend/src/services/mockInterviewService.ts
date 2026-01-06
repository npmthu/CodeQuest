import { supabaseAdmin as supabase } from "../config/database";
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
  JoinSessionRequest,
} from "../types/mockInterview";

export class MockInterviewService {
  // Session Management
  async createSession(
    instructorId: string,
    sessionData: CreateSessionRequest
  ): Promise<MockInterviewSession> {
    try {
      const { data, error } = await supabase
        .from("mock_interview_sessions")
        .insert({
          instructor_id: instructorId,
          ...sessionData,
          session_date: new Date(sessionData.session_date).toISOString(),
          slots_available: sessionData.max_slots,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create interview session");
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
      let query = supabase.from("mock_interview_sessions").select(
        `
          *,
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `,
        { count: "exact" }
      );

      // Apply filters
      if (filters?.instructor_id) {
        query = query.eq("instructor_id", filters.instructor_id);
      }
      if (filters?.topic) {
        query = query.ilike("topic", `%${filters.topic}%`);
      }
      if (filters?.difficulty_level) {
        query = query.eq("difficulty_level", filters.difficulty_level);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.date_from) {
        query = query.gte("session_date", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("session_date", filters.date_to);
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .order("session_date", { ascending: true })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        sessions: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw new Error("Failed to fetch interview sessions");
    }
  }

  async getSessionById(
    sessionId: string
  ): Promise<MockInterviewSession | null> {
    try {
      const { data, error } = await supabase
        .from("mock_interview_sessions")
        .select(
          `
          *,
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `
        )
        .eq("id", sessionId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error("Error fetching session:", error);
      throw new Error("Failed to fetch interview session");
    }
  }

  // Booking Management
  async bookSession(
    learnerId: string,
    bookingData: BookSessionRequest
  ): Promise<
    | InterviewBooking
    | { success: boolean; message: string; booking: InterviewBooking }
  > {
    const client = supabase; // In production, use transaction

    try {
      // Step 1: Check if session exists and has slots
      const { data: session, error: sessionError } = await client
        .from("mock_interview_sessions")
        .select("*")
        .eq("id", bookingData.session_id)
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found");
      }

      if (session.slots_available <= 0) {
        throw new Error("No slots available for this session");
      }

      // Step 2: Check if user already booked this session (excluding cancelled)
      const { data: existingBooking } = await client
        .from("interview_bookings")
        .select("*")
        .eq("session_id", bookingData.session_id)
        .eq("learner_id", learnerId)
        .in("booking_status", ["pending", "confirmed", "completed"])
        .maybeSingle();

      // If already booked (and not cancelled), just return success (idempotent)
      if (existingBooking) {
        return {
          success: true,
          message: "Already booked for this session",
          booking: existingBooking,
        };
      }

      // Check for cancelled bookings - delete them to allow re-booking
      const { data: cancelledBookings } = await client
        .from("interview_bookings")
        .select("*")
        .eq("session_id", bookingData.session_id)
        .eq("learner_id", learnerId)
        .eq("booking_status", "cancelled");

      if (cancelledBookings && cancelledBookings.length > 0) {
        // Delete cancelled bookings to allow new booking
        await client
          .from("interview_bookings")
          .delete()
          .eq("session_id", bookingData.session_id)
          .eq("learner_id", learnerId)
          .eq("booking_status", "cancelled");
      }

      // Step 3: Create booking - payment status depends on payment method
      const paymentMethod = bookingData.payment_method || "credit_card";
      const initialPaymentStatus =
        paymentMethod === "bank_transfer" ? "pending" : "pending";
      const initialBookingStatus =
        paymentMethod === "bank_transfer" ? "pending" : "pending";

      const { data: booking, error: bookingError } = await client
        .from("interview_bookings")
        .insert({
          session_id: bookingData.session_id,
          learner_id: learnerId,
          booking_status: initialBookingStatus,
          payment_status: initialPaymentStatus,
          payment_amount: session.price,
          payment_method: paymentMethod,
          payment_proof_url: bookingData.payment_proof_url || null,
          payment_id: `mock_payment_${Date.now()}`,
          notes: bookingData.notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Step 4: Decrement available slots immediately (reserve the slot)
      const { error: slotError } = await client
        .from("mock_interview_sessions")
        .update({
          slots_available: session.slots_available - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingData.session_id);

      if (slotError) {
        console.error("Failed to decrement slots:", slotError);
        throw slotError;
      }

      // Step 5: For bank transfer, return pending booking (slot already reserved)
      if (paymentMethod === "bank_transfer") {
        return booking;
      }

      // Step 6: For credit card, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate payment delay

      // Step 7: Update booking to CONFIRMED
      const { data: confirmedBooking, error: confirmError } = await client
        .from("interview_bookings")
        .update({
          booking_status: "confirmed",
          payment_status: "paid",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (confirmError) throw confirmError;

      return confirmedBooking;
    } catch (error: any) {
      console.error("Error booking session:", error);

      // Handle unique constraint violation (duplicate booking)
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        // Race condition: Another request booked at the same time
        // Fetch the existing booking to return it
        const { data: existingBooking } = await client
          .from("interview_bookings")
          .select("*")
          .eq("session_id", bookingData.session_id)
          .eq("learner_id", learnerId)
          .single();

        if (existingBooking) {
          return {
            success: true,
            message: "Already booked for this session",
            booking: existingBooking,
          };
        }
      }

      throw error;
    }
  }

  async getUserBookings(
    userId: string,
    role: "learner" | "instructor",
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: InterviewBooking[]; total: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      if (role === "instructor") {
        // For instructor, query sessions first then get bookings
        let sessionQuery = supabase
          .from("mock_interview_sessions")
          .select("id")
          .eq("instructor_id", userId);

        const { data: sessions, error: sessionError } = await sessionQuery;
        if (sessionError) throw sessionError;

        const sessionIds = sessions.map((s) => s.id);

        if (sessionIds.length === 0) {
          return { bookings: [], total: 0 };
        }

        // Now get bookings for these sessions
        let query = supabase
          .from("interview_bookings")
          .select(
            `
            *,
            session:mock_interview_sessions(*, instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)),
            learner:users!interview_bookings_learner_id_fkey(id, display_name, email, avatar_url)
          `,
            { count: "exact" }
          )
          .in("session_id", sessionIds);

        if (filters?.status) {
          query = query.eq("booking_status", filters.status);
        }

        query = query
          .order("booked_at", { ascending: false })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
          bookings: data || [],
          total: count || 0,
        };
      } else {
        // For learner, direct query
        let query = supabase
          .from("interview_bookings")
          .select(
            `
            *,
            session:mock_interview_sessions(*, instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)),
            learner:users!interview_bookings_learner_id_fkey(id, display_name, email, avatar_url)
          `,
            { count: "exact" }
          )
          .eq("learner_id", userId);

        if (filters?.status) {
          query = query.eq("booking_status", filters.status);
        }

        query = query
          .order("booked_at", { ascending: false })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
          bookings: data || [],
          total: count || 0,
        };
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings");
    }
  }

  // Session Management
  async startSession(
    instructorId: string,
    sessionData: StartSessionRequest
  ): Promise<MockInterviewSession> {
    try {
      // Verify instructor owns this session
      const { data: session, error: fetchError } = await supabase
        .from("mock_interview_sessions")
        .select("*")
        .eq("id", sessionData.session_id)
        .eq("instructor_id", instructorId)
        .single();

      if (fetchError || !session) {
        throw new Error("Session not found or access denied");
      }

      if (session.status !== "scheduled") {
        throw new Error("Session cannot be started");
      }

      // Update session status
      const { data: updatedSession, error: updateError } = await supabase
        .from("mock_interview_sessions")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionData.session_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log instructor join
      await this.logSessionJoin(
        sessionData.session_id,
        instructorId,
        "instructor"
      );

      return updatedSession;
    } catch (error) {
      console.error("Error starting session:", error);
      throw error;
    }
  }

  async joinSession(
    userId: string,
    sessionData: JoinSessionRequest,
    userRole?: string
  ): Promise<{ session: MockInterviewSession; joinUrl: string }> {
    try {
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from("mock_interview_sessions")
        .select("*")
        .eq("id", sessionData.session_id)
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found");
      }

      // Verify access based on role
      if (userRole === "instructor" || userRole === "business_partner") {
        // Instructor must be the session owner
        if (session.instructor_id !== userId) {
          throw new Error("Only the instructor of this session can join");
        }
      } else {
        // Learner must have a confirmed or pending booking
        const { data: booking, error: bookingError } = await supabase
          .from("interview_bookings")
          .select("id")
          .eq("session_id", sessionData.session_id)
          .eq("learner_id", userId)
          .in("booking_status", ["confirmed", "pending"])
          .single();

        if (bookingError || !booking) {
          throw new Error("No confirmed booking found for this session");
        }
      }

      // Allow joining if session is scheduled or in_progress
      // Only prevent joining if session is completed or cancelled
      if (session.status === "completed" || session.status === "cancelled") {
        throw new Error(`Cannot join: Session has ${session.status}`);
      }

      // Log join
      const role =
        userRole === "instructor" || userRole === "business_partner"
          ? "instructor"
          : "learner";
      await this.logSessionJoin(sessionData.session_id, userId, role);

      return {
        session,
        joinUrl:
          session.session_link ||
          `https://meet.example.com/session/${session.id}`,
      };
    } catch (error) {
      console.error("Error joining session:", error);
      throw error;
    }
  }

  private async logSessionJoin(
    sessionId: string,
    userId: string,
    role: "instructor" | "learner"
  ): Promise<void> {
    try {
      await supabase.from("session_join_logs").insert({
        session_id: sessionId,
        user_id: userId,
        user_role: role,
        joined_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging session join:", error);
      // Don't throw - this is not critical
    }
  }

  // Feedback Management
  async createFeedback(
    userId: string,
    feedbackData: CreateFeedbackRequest
  ): Promise<InterviewFeedback> {
    try {
      let learnerId: string | null = null;
      let instructorId: string | null = null;
      let sessionId: string | null = feedbackData.session_id || null;

      // Case 1: Learner providing feedback (requires booking_id or session_id)
      if (feedbackData.booking_id) {
        const { data: booking, error: bookingError } = await supabase
          .from("interview_bookings")
          .select(
            `
            *,
            session:mock_interview_sessions(id, instructor_id)
          `
          )
          .eq("id", feedbackData.booking_id)
          .single();

        if (bookingError || !booking) {
          throw new Error("Booking not found");
        }

        // Verify user is the learner for this booking
        if (booking.learner_id !== userId) {
          throw new Error(
            "You can only provide feedback for your own bookings"
          );
        }

        learnerId = booking.learner_id;
        instructorId = booking.session?.instructor_id || null;
        sessionId = booking.session_id;
      }
      // Case 2: Instructor providing system/session feedback (no booking needed)
      else if (feedbackData.session_id) {
        const { data: session, error: sessionError } = await supabase
          .from("mock_interview_sessions")
          .select("id, instructor_id")
          .eq("id", feedbackData.session_id)
          .single();

        if (sessionError || !session) {
          throw new Error("Session not found");
        }

        // Verify user is the instructor for this session
        if (session.instructor_id !== userId) {
          throw new Error(
            "You can only provide feedback for your own sessions"
          );
        }

        instructorId = session.instructor_id;
        sessionId = session.id;
        // learnerId remains null for instructor system feedback
      } else {
        throw new Error("Either booking_id or session_id is required");
      }

      // Create feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from("interview_feedback")
        .insert({
          booking_id: feedbackData.booking_id || null,
          session_id: sessionId,
          instructor_id: instructorId,
          learner_id: learnerId,
          overall_rating: feedbackData.overall_rating,
          technical_rating: feedbackData.technical_rating,
          communication_rating: feedbackData.communication_rating,
          problem_solving_rating: feedbackData.problem_solving_rating,
          strengths: feedbackData.strengths,
          areas_for_improvement: feedbackData.areas_for_improvement,
          recommendations: feedbackData.recommendations,
          detailed_feedback: feedbackData.detailed_feedback,
          comments: feedbackData.comments,
          feedback_type: feedbackData.feedback_type || "learner_feedback",
          is_public: feedbackData.is_public || false,
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      return feedback;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  }

  async getLearnerFeedback(
    learnerId: string,
    filters?: {
      session_id?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ feedback: InterviewFeedback[]; total: number }> {
    try {
      let query = supabase
        .from("interview_feedback")
        .select(
          `
          *,
          booking:interview_bookings(*, session:mock_interview_sessions(*)),
          instructor:users!mock_interview_sessions_instructor_id_fkey(id, display_name, email, avatar_url)
        `,
          { count: "exact" }
        )
        .eq("learner_id", learnerId);

      if (filters?.session_id) {
        query = query.eq("booking.session_id", filters.session_id);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .order("feedback_date", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        feedback: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw new Error("Failed to fetch feedback");
    }
  }

  // AI Suggestions Service
  async generateAISuggestion(
    userId: string,
    request: AISuggestionRequest
  ): Promise<any> {
    const startTime = Date.now();

    try {
      let result;
      const aiService = (await import("./aiService")).default;

      switch (request.type) {
        case "topic_suggestion":
          // Generate topic suggestions using a custom prompt
          result = await this.generateTopicSuggestions(
            request.content,
            request.context
          );
          break;
        case "summary":
          result = await aiService.generateSummary(request.content);
          break;
        case "mindmap":
          result = await aiService.generateMindmap(request.content);
          break;
        case "hint":
          result = await this.generateHint(request.content, request.context);
          break;
        case "code_review":
          result = await aiService.reviewCode(
            request.content,
            request.context?.language || "javascript",
            request.context?.problem_description
          );
          break;
        default:
          throw new Error("Invalid suggestion type");
      }

      const processingTime = Date.now() - startTime;

      // Log the AI suggestion
      await supabase.from("ai_suggestion_logs").insert({
        user_id: userId,
        suggestion_type: request.type,
        input_content: request.content,
        output_content: result,
        context_metadata: request.context,
        tokens_used: result.tokensUsed || 0,
        processing_time_ms: processingTime,
      });

      return result;
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      throw new Error("Failed to generate AI suggestion");
    }
  }

  // Helper methods for AI suggestions that don't exist in the main AI service
  private async generateTopicSuggestions(
    topic: string,
    context?: any
  ): Promise<any> {
    // This would use the AI service to generate topic suggestions
    // For now, return mock suggestions
    return {
      suggestions: [
        `Introduction to ${topic}`,
        `Advanced ${topic} concepts`,
        `Practical ${topic} exercises`,
        `Common ${topic} interview questions`,
        `Best practices in ${topic}`,
      ],
      tokensUsed: 150,
    };
  }

  private async generateHint(
    problemContext: string,
    context?: any
  ): Promise<any> {
    // Generate a progressive hint based on the problem context
    const hintLevel = context?.hint_level || "gentle";

    const hints = {
      gentle: "Think about the fundamental approach. What's the first step?",
      moderate:
        "Consider the data structures involved. What would be most efficient?",
      strong:
        "Look at similar problems you've solved. Can you adapt that approach?",
    };

    return {
      hint: hints[hintLevel as keyof typeof hints] || hints.gentle,
      tokensUsed: 50,
    };
  }

  // Utility Methods
  async updateSessionStatus(
    sessionId: string,
    status: MockInterviewSession["status"]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("mock_interview_sessions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating session status:", error);
      throw new Error("Failed to update session status");
    }
  }

  async reportNoShow(bookingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("interview_bookings")
        .update({ no_show_reported: true })
        .eq("id", bookingId);

      if (error) throw error;
    } catch (error) {
      console.error("Error reporting no-show:", error);
      throw new Error("Failed to report no-show");
    }
  }

  async endSession(sessionId: string, instructorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("mock_interview_sessions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("instructor_id", instructorId);

      if (error) throw error;
    } catch (error) {
      console.error("Error ending session:", error);
      throw new Error("Failed to end interview session");
    }
  }

  async cancelSession(
    sessionId: string,
    instructorId: string,
    cancelReason: string
  ): Promise<void> {
    try {
      // Verify the instructor owns this session
      const { data: session, error: sessionError } = await supabase
        .from("mock_interview_sessions")
        .select("instructor_id, status")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw new Error("Session not found");
      if (session.instructor_id !== instructorId) {
        throw new Error("Unauthorized: You can only cancel your own sessions");
      }
      if (session.status === "cancelled") {
        throw new Error("Session is already cancelled");
      }

      // Get all bookings for this session
      const { data: bookings, error: bookingsError } = await supabase
        .from("interview_bookings")
        .select("id, learner_id, booking_status, payment_status")
        .eq("session_id", sessionId)
        .in("booking_status", ["confirmed", "pending"]);

      if (bookingsError) throw bookingsError;

      // Update session status
      const { error: updateError } = await supabase
        .from("mock_interview_sessions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (updateError) throw updateError;

      // Process refunds for all active bookings
      if (bookings && bookings.length > 0) {
        const refundPromises = bookings.map(async (booking) => {
          // Update booking to cancelled and refunded
          const { error } = await supabase
            .from("interview_bookings")
            .update({
              booking_status: "cancelled",
              payment_status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", booking.id);

          if (error) {
            console.error(`Failed to refund booking ${booking.id}:`, error);
          }

          // TODO: Send notification to learner
          // await this.sendCancellationNotification(booking.learner_id, sessionId, cancelReason);

          console.log(
            `✅ Refunded booking ${booking.id} for learner ${booking.learner_id}`
          );
        });

        await Promise.all(refundPromises);

        // Restore slots_available for cancelled bookings
        const { data: currentSession } = await supabase
          .from("mock_interview_sessions")
          .select("slots_available, max_slots")
          .eq("id", sessionId)
          .single();

        if (currentSession) {
          const newSlots = Math.min(
            currentSession.slots_available + bookings.length,
            currentSession.max_slots
          );

          await supabase
            .from("mock_interview_sessions")
            .update({
              slots_available: newSlots,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
        }
      }
    } catch (error: any) {
      console.error("Error cancelling session:", error);
      throw new Error(error.message || "Failed to cancel session");
    }
  }
}
