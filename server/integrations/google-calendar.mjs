import { randomUUID } from "node:crypto";

let cachedAccessToken = null;
let accessTokenExpiresAt = 0;

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < accessTokenExpiresAt - 60_000) return cachedAccessToken;
  if (!isGoogleCalendarConfigured()) throw new Error("Google Calendar is not configured.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) throw new Error(`Google OAuth failed (${response.status}).`);
  const token = await response.json();
  cachedAccessToken = token.access_token;
  accessTokenExpiresAt = Date.now() + Number(token.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

async function calendarRequest(url, options = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Calendar request failed (${response.status}): ${detail}`);
  }
  return response.json();
}

export async function getBusyPeriods({ timeMin, timeMax, timeZone }) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const result = await calendarRequest("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    body: JSON.stringify({ timeMin, timeMax, timeZone, items: [{ id: calendarId }] }),
  });
  return result.calendars?.[calendarId]?.busy ?? [];
}

export async function createGoogleMeetEvent({ name, email, phone, interest, language, startAt, endAt, timeZone }) {
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID);
  const summary = language === "es" ? `Consulta Digital Trust: ${name}` : `Digital Trust consultation: ${name}`;
  const description = [
    language === "es" ? "Consulta agendada desde Website DT 3.0" : "Consultation booked from Website DT 3.0",
    `Client: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Interest: ${interest}`,
  ].join("\n");

  const event = await calendarRequest(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startAt, timeZone },
        end: { dateTime: endAt, timeZone },
        attendees: [{ email, displayName: name }],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      }),
    },
  );

  const meetUrl = event.hangoutLink || event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri || null;
  return { eventId: event.id, eventUrl: event.htmlLink || null, meetUrl };
}
