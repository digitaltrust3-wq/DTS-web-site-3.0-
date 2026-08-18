import { isGoogleCalendarConfigured, getBusyPeriods, createGoogleMeetEvent } from "./integrations/google-calendar.mjs";
import { isSupabaseConfigured, reserveAppointment, saveLead, updateAppointment } from "./integrations/supabase.mjs";
import { isEmailConfigured, sendAppointmentEmails } from "./integrations/email.mjs";
import { apiError, createRateLimiter, logError } from "./lib/security.mjs";

const bookingRequests = new Map();
const limitAvailability = createRateLimiter({ windowMs: 60_000, limit: 30 });
const limitBooking = createRateLimiter({ windowMs: 10 * 60_000, limit: 6 });
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function schedulingConfig() {
  return {
    timeZone: process.env.GOOGLE_TIME_ZONE || "America/Bogota",
    utcOffset: process.env.SCHEDULING_UTC_OFFSET || "-05:00",
    startHour: Number(process.env.SCHEDULING_START_HOUR || 8),
    endHour: Number(process.env.SCHEDULING_END_HOUR || 21),
    slotMinutes: Number(process.env.SCHEDULING_SLOT_MINUTES || 30),
    daysAhead: Number(process.env.SCHEDULING_DAYS_AHEAD || 30),
    minimumNoticeHours: Number(process.env.SCHEDULING_MIN_NOTICE_HOURS || 4),
  };
}

function isValidDate(date) {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const targetUtc = parsed.getTime();
  const { daysAhead } = schedulingConfig();
  return targetUtc >= todayUtc && targetUtc <= todayUtc + daysAhead * 86_400_000;
}

function createCandidateSlots(date) {
  const config = schedulingConfig();
  const slots = [];
  for (let minutes = config.startHour * 60; minutes + config.slotMinutes <= config.endHour * 60; minutes += config.slotMinutes) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    const startAt = `${date}T${hour}:${minute}:00${config.utcOffset}`;
    const endAt = new Date(new Date(startAt).getTime() + config.slotMinutes * 60_000).toISOString();
    slots.push({ startAt, endAt });
  }
  return slots;
}

async function availableSlotsForDate(date) {
  const config = schedulingConfig();
  const candidates = createCandidateSlots(date);
  if (!candidates.length) return [];
  const minimumStart = Date.now() + config.minimumNoticeHours * 3_600_000;
  const busy = await getBusyPeriods({
    timeMin: candidates[0].startAt,
    timeMax: candidates[candidates.length - 1].endAt,
    timeZone: config.timeZone,
  });

  return candidates.filter((slot) => {
    const start = new Date(slot.startAt).getTime();
    const end = new Date(slot.endAt).getTime();
    if (start < minimumStart) return false;
    return !busy.some((period) => start < new Date(period.end).getTime() && end > new Date(period.start).getTime());
  });
}

function validateBooking(body) {
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const phone = String(body?.phone || "").trim();
  const interest = String(body?.interest || "").trim();
  const startAt = String(body?.startAt || "").trim();
  const language = body?.language === "es" ? "es" : "en";
  const privacyConsent = body?.privacyConsent === true;
  const phoneDigits = phone.replace(/\D/g, "");

  if (name.length < 2 || name.length > 100) return { error: "Enter a valid name." };
  if (!EMAIL_PATTERN.test(email) || email.length > 160) return { error: "Enter a valid email address." };
  if (phoneDigits.length < 7 || phoneDigits.length > 15 || phone.length > 30) return { error: "Enter a valid phone number." };
  if (interest.length < 10 || interest.length > 2000) return { error: "Tell us what you would like to discuss." };
  if (!privacyConsent) return { error: "Privacy consent is required." };
  if (Number.isNaN(new Date(startAt).getTime())) return { error: "Select a valid time." };
  return { value: { name, email, phone, interest, startAt, language } };
}

export function registerSchedulingRoutes(app) {
  app.get("/api/scheduling/availability", limitAvailability, async (request, response) => {
    const date = String(request.query.date || "");
    if (!isValidDate(date)) return response.status(400).json({ message: "Select a valid date." });
    if (!isGoogleCalendarConfigured()) {
      return response.status(503).json({ configured: false, message: "Online scheduling is being configured." });
    }

    try {
      const slots = await availableSlotsForDate(date);
      return response.json({ configured: true, date, timeZone: schedulingConfig().timeZone, slots });
    } catch (error) {
      logError("Availability lookup failed.", error, request.requestId);
      return apiError(response, 502, "CALENDAR_UNAVAILABLE", "Availability could not be loaded.");
    }
  });

  app.post("/api/scheduling/book", limitBooking, async (request, response) => {
    const validation = validateBooking(request.body);
    if (validation.error) return apiError(response, 400, "INVALID_BOOKING", validation.error);
    if (!isGoogleCalendarConfigured()) return apiError(response, 503, "CALENDAR_NOT_CONFIGURED", "Online scheduling is being configured.");
    if (process.env.NODE_ENV === "production" && !isSupabaseConfigured()) {
      return apiError(response, 503, "DATABASE_NOT_CONFIGURED", "Online scheduling is being configured.");
    }

    const requestId = String(request.get("idempotency-key") || "").trim();
    if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) {
      return apiError(response, 400, "INVALID_IDEMPOTENCY_KEY", "The booking request identifier is invalid.");
    }

    const booking = validation.value;
    const date = booking.startAt.slice(0, 10);
    if (!isValidDate(date)) return response.status(400).json({ message: "Select a valid date." });

    const clientKey = `${request.ip}:${booking.email.toLowerCase()}`;
    const previousRequest = bookingRequests.get(clientKey);
    if (previousRequest && Date.now() - previousRequest < 120_000) {
      return response.status(429).json({ message: "Please wait before booking another consultation." });
    }

    try {
      const available = await availableSlotsForDate(date);
      const selected = available.find((slot) => slot.startAt === booking.startAt);
      if (!selected) return response.status(409).json({ message: "This time is no longer available. Select another one." });

      let lead = null;
      if (isSupabaseConfigured()) {
        lead = await saveLead({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          interest: booking.interest,
          source: "consultation_booking",
          language: booking.language,
          metadata: { requested_start: selected.startAt },
        });
        await reserveAppointment({
          requestId,
          leadId: lead?.id || null,
          startAt: selected.startAt,
          endAt: selected.endAt,
          timeZone: schedulingConfig().timeZone,
          metadata: { language: booking.language },
        });
      }

      let meeting;
      try {
        meeting = await createGoogleMeetEvent({
          ...booking,
          startAt: selected.startAt,
          endAt: selected.endAt,
          timeZone: schedulingConfig().timeZone,
        });
      } catch (error) {
        if (isSupabaseConfigured()) await updateAppointment({ requestId, status: "cancelled" }).catch(() => undefined);
        throw error;
      }

      if (isSupabaseConfigured()) {
        try {
          await updateAppointment({
            requestId,
            status: "confirmed",
            googleEventId: meeting.eventId,
            googleMeetUrl: meeting.meetUrl,
            googleEventUrl: meeting.eventUrl,
          });
        } catch (databaseError) {
          logError("Appointment confirmation persistence failed.", databaseError, request.requestId);
        }
      }

      let email = { notificationSent: false, confirmationSent: false };
      if (isEmailConfigured()) {
        try {
          email = await sendAppointmentEmails({
            ...booking,
            ...meeting,
            startAt: selected.startAt,
            endAt: selected.endAt,
            timeZone: schedulingConfig().timeZone,
          });
        } catch (emailError) {
          logError("Appointment email failed.", emailError, request.requestId);
        }
      }

      bookingRequests.set(clientKey, Date.now());
      return response.status(201).json({
        ok: true,
        message: "Consultation scheduled.",
        startAt: selected.startAt,
        timeZone: schedulingConfig().timeZone,
        meetUrl: meeting.meetUrl,
        eventUrl: meeting.eventUrl,
        confirmationSent: email.confirmationSent,
      });
    } catch (error) {
      logError("Consultation booking failed.", error, request.requestId);
      const conflict = error instanceof Error && /409|duplicate|appointments_active_start/i.test(error.message);
      return apiError(
        response,
        conflict ? 409 : 502,
        conflict ? "TIME_NOT_AVAILABLE" : "BOOKING_FAILED",
        conflict ? "This time is no longer available. Select another one." : "The consultation could not be scheduled. Please try again.",
      );
    }
  });
}
