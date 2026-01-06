import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";

export class AdminInterviewController {
  /**
   * GET /api/admin/interview-bookings
   * Get all interview bookings with optional payment status filter
   */
  async getInterviewBookings(req: AuthRequest, res: Response) {
    try {
      const { payment_status, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Build query using Supabase
      let query = supabaseAdmin
        .from("interview_bookings")
        .select(
          `
          *,
          learner:users!interview_bookings_learner_id_fkey(
            email,
            display_name,
            avatar_url
          ),
          session:mock_interview_sessions(
            title,
            topic,
            session_date,
            duration_minutes,
            instructor_id
          )
        `,
          { count: "exact" }
        )
        .eq("payment_method", "bank_transfer");

      // Apply payment status filter
      if (payment_status) {
        query = query.eq("payment_status", payment_status);
      }

      // Apply pagination
      query = query
        .order("booked_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      const { data: result, error, count } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: result || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching interview bookings:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch interview bookings",
      });
    }
  }

  /**
   * POST /api/admin/interview-bookings/:id/approve-payment
   * Approve payment for an interview booking
   */
  async approveInterviewPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // Get booking details
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("interview_bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      if (booking.payment_status === "paid") {
        return res.status(400).json({
          success: false,
          error: "Payment already approved",
        });
      }

      // Update booking
      const { data: updateResult, error: updateError } = await supabaseAdmin
        .from("interview_bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
          confirmed_at: new Date().toISOString(),
          payment_verified_at: new Date().toISOString(),
          payment_verified_by: adminId,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // TODO: Send notification to learner
      // TODO: Send notification to instructor

      console.log("✅ Interview payment approved:", {
        bookingId: id,
        adminId,
        learnerId: booking.learner_id,
      });

      res.json({
        success: true,
        data: updateResult,
        message: "Payment approved successfully",
      });
    } catch (error: any) {
      console.error("Error approving interview payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to approve payment",
      });
    }
  }

  /**
   * POST /api/admin/interview-bookings/:id/reject-payment
   * Reject payment for an interview booking
   */
  async rejectInterviewPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          error: "Rejection reason is required",
        });
      }

      // Get booking details
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("interview_bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      // Update booking
      const currentNotes = booking.notes || "";
      const updatedNotes = currentNotes
        ? `${currentNotes}\n\nPayment rejected: ${reason}`
        : `Payment rejected: ${reason}`;

      const { data: updateResult, error: updateError } = await supabaseAdmin
        .from("interview_bookings")
        .update({
          payment_status: "failed",
          booking_status: "cancelled",
          cancelled_at: new Date().toISOString(),
          notes: updatedNotes,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Restore slot availability
      const { data: session } = await supabaseAdmin
        .from("mock_interview_sessions")
        .select("slots_available, max_slots")
        .eq("id", booking.session_id)
        .single();

      if (session) {
        const newSlots = Math.min(
          session.slots_available + 1,
          session.max_slots
        );

        await supabaseAdmin
          .from("mock_interview_sessions")
          .update({
            slots_available: newSlots,
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.session_id);

        console.log(
          `✅ Restored slot for session ${booking.session_id} (${session.slots_available} → ${newSlots})`
        );
      }

      // TODO: Send notification to learner with rejection reason

      console.log("❌ Interview payment rejected:", {
        bookingId: id,
        adminId,
        learnerId: booking.learner_id,
        reason,
      });

      res.json({
        success: true,
        data: updateResult,
        message: "Payment rejected",
      });
    } catch (error: any) {
      console.error("Error rejecting interview payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to reject payment",
      });
    }
  }
}

export default new AdminInterviewController();
