import cron from "node-cron";
import { supabaseAdmin } from "../config/database";
import { mailService } from "../services/mailService";

/**
 * Interview Reminder Job
 *
 * Runs every hour to check for upcoming mock interview sessions
 * and send reminder emails to both instructors and learners.
 *
 * Reminder windows:
 * - 24 hours before session
 * - 1 hour before session
 */

interface BookingWithDetails {
  id: string;
  session_id: string;
  learner_id: string;
  booking_status: string;
  session: {
    id: string;
    title: string;
    topic: string;
    session_date: string;
    duration_minutes: number;
    session_link: string;
    instructor_id: string;
    instructor: {
      id: string;
      display_name: string | null;
      email: string;
    };
  };
  learner: {
    id: string;
    display_name: string | null;
    email: string;
  };
}

// Raw data shape from Supabase (arrays for joined tables)
interface RawBookingData {
  id: string;
  session_id: string;
  learner_id: string;
  booking_status: string;
  session: Array<{
    id: string;
    title: string;
    topic: string;
    session_date: string;
    duration_minutes: number;
    session_link: string;
    instructor_id: string;
    instructor: Array<{
      id: string;
      display_name: string | null;
      email: string;
    }>;
  }>;
  learner: Array<{
    id: string;
    display_name: string | null;
    email: string;
  }>;
}

interface ReminderLog {
  booking_id: string;
  reminder_type: "24h" | "1h";
  sent_at: string;
}

// In-memory log for idempotency (in production, use database table)
const sentReminders: Map<string, ReminderLog> = new Map();

/**
 * Get confirmed bookings for sessions starting within a time window
 */
async function getUpcomingBookings(
  hoursAhead: number,
  toleranceMinutes: number = 30
): Promise<BookingWithDetails[]> {
  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  // Define a window around the target time
  const windowStart = new Date(
    targetTime.getTime() - toleranceMinutes * 60 * 1000
  );
  const windowEnd = new Date(
    targetTime.getTime() + toleranceMinutes * 60 * 1000
  );

  try {
    const { data, error } = await supabaseAdmin
      .from("interview_bookings")
      .select(
        `
        id,
        session_id,
        learner_id,
        booking_status,
        session:mock_interview_sessions!interview_bookings_session_id_fkey(
          id,
          title,
          topic,
          session_date,
          duration_minutes,
          session_link,
          instructor_id,
          instructor:users!mock_interview_sessions_instructor_id_fkey(
            id,
            display_name,
            email
          )
        ),
        learner:users!interview_bookings_learner_id_fkey(
          id,
          display_name,
          email
        )
      `
      )
      .eq("booking_status", "confirmed")
      .gte("session.session_date", windowStart.toISOString())
      .lte("session.session_date", windowEnd.toISOString());

    if (error) {
      console.error("Error fetching upcoming bookings:", error);
      return [];
    }

    // Transform raw data to expected shape (Supabase returns arrays for joins)
    const bookings: BookingWithDetails[] = [];

    for (const raw of (data || []) as RawBookingData[]) {
      // Skip if session or learner data is missing
      if (!raw.session?.[0] || !raw.learner?.[0]) continue;

      const session = raw.session[0];
      const learner = raw.learner[0];
      const instructor = session.instructor?.[0];

      if (!instructor) continue;

      bookings.push({
        id: raw.id,
        session_id: raw.session_id,
        learner_id: raw.learner_id,
        booking_status: raw.booking_status,
        session: {
          id: session.id,
          title: session.title,
          topic: session.topic,
          session_date: session.session_date,
          duration_minutes: session.duration_minutes,
          session_link: session.session_link,
          instructor_id: session.instructor_id,
          instructor: {
            id: instructor.id,
            display_name: instructor.display_name,
            email: instructor.email,
          },
        },
        learner: {
          id: learner.id,
          display_name: learner.display_name,
          email: learner.email,
        },
      });
    }

    return bookings;
  } catch (error) {
    console.error("Error in getUpcomingBookings:", error);
    return [];
  }
}

/**
 * Check if a reminder has already been sent for this booking/type combo
 */
function hasReminderBeenSent(
  bookingId: string,
  reminderType: "24h" | "1h"
): boolean {
  const key = `${bookingId}-${reminderType}`;
  return sentReminders.has(key);
}

/**
 * Mark a reminder as sent
 */
function markReminderSent(bookingId: string, reminderType: "24h" | "1h"): void {
  const key = `${bookingId}-${reminderType}`;
  sentReminders.set(key, {
    booking_id: bookingId,
    reminder_type: reminderType,
    sent_at: new Date().toISOString(),
  });
}

/**
 * Format date for email display
 */
function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Send reminder to a participant
 */
async function sendReminderToParticipant(
  booking: BookingWithDetails,
  reminderType: "24h" | "1h",
  isInstructor: boolean
): Promise<boolean> {
  const session = booking.session;
  const participant = isInstructor ? session.instructor : booking.learner;
  const otherParty = isInstructor ? booking.learner : session.instructor;

  const timeUntil = reminderType === "24h" ? "in 24 hours" : "in 1 hour";
  const roleLabel = isInstructor ? "Learner" : "Instructor";

  const sessionLink =
    session.session_link ||
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/interview/session/${
      session.id
    }`;

  try {
    const result = await mailService.sendInterviewReminder({
      to: participant.email,
      userName: participant.display_name || participant.email.split("@")[0],
      sessionTitle: session.title,
      topic: session.topic,
      sessionDate: formatSessionDate(session.session_date),
      duration: session.duration_minutes,
      sessionLink,
      timeUntil,
      roleLabel,
      otherPartyName: otherParty.display_name || otherParty.email.split("@")[0],
    });

    if (result.success) {
      console.log(
        `📧 Sent ${reminderType} reminder to ${
          isInstructor ? "instructor" : "learner"
        }: ${participant.email}`
      );
    }

    return result.success;
  } catch (error) {
    console.error(`Failed to send reminder to ${participant.email}:`, error);
    return false;
  }
}

/**
 * Process reminders for a specific time window
 */
async function processReminders(
  hoursAhead: number,
  reminderType: "24h" | "1h"
): Promise<void> {
  console.log(`🔍 Checking for sessions starting in ~${hoursAhead} hour(s)...`);

  const bookings = await getUpcomingBookings(hoursAhead);

  if (bookings.length === 0) {
    console.log(
      `   No confirmed bookings found for ${reminderType} reminder window`
    );
    return;
  }

  console.log(`   Found ${bookings.length} booking(s) to process`);

  for (const booking of bookings) {
    // Check idempotency
    if (hasReminderBeenSent(booking.id, reminderType)) {
      console.log(
        `   ⏭️ Skipping booking ${booking.id} (${reminderType} reminder already sent)`
      );
      continue;
    }

    // Send to learner
    const learnerSent = await sendReminderToParticipant(
      booking,
      reminderType,
      false
    );

    // Send to instructor
    const instructorSent = await sendReminderToParticipant(
      booking,
      reminderType,
      true
    );

    // Mark as sent if at least one was successful
    if (learnerSent || instructorSent) {
      markReminderSent(booking.id, reminderType);
    }
  }
}

/**
 * Main job function - called by the cron scheduler
 */
async function runReminderJob(): Promise<void> {
  console.log(
    "\n⏰ Running Interview Reminder Job at",
    new Date().toISOString()
  );

  try {
    // Process 24-hour reminders
    await processReminders(24, "24h");

    // Process 1-hour reminders
    await processReminders(1, "1h");

    console.log("✅ Interview Reminder Job completed\n");
  } catch (error) {
    console.error("❌ Interview Reminder Job failed:", error);
  }
}

/**
 * Start the cron job
 * Runs every hour at minute 0
 */
export function startInterviewReminderJob(): void {
  // Run every hour at minute 0
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule("0 * * * *", () => {
    runReminderJob();
  });

  console.log("📅 Interview Reminder Job scheduled (runs every hour)");

  // Optionally run immediately on startup (useful for testing)
  if (process.env.RUN_JOBS_ON_STARTUP === "true") {
    console.log("🚀 Running Interview Reminder Job on startup...");
    runReminderJob();
  }
}

/**
 * Manual trigger for testing
 */
export async function triggerReminderJob(): Promise<void> {
  await runReminderJob();
}

// Clean up old reminder logs periodically (keep last 7 days)
function cleanupOldReminders(): void {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const [key, log] of sentReminders.entries()) {
    if (new Date(log.sent_at) < sevenDaysAgo) {
      sentReminders.delete(key);
    }
  }
}

// Clean up old logs every day
cron.schedule("0 0 * * *", cleanupOldReminders);
