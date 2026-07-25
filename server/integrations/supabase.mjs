const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseRequest(table, { method = "POST", body, query = "", prefer = "return=representation" } = {}) {
  if (!isSupabaseConfigured()) return null;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${table} request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return null;
  const result = await response.json();
  return Array.isArray(result) ? result[0] ?? null : result;
}

export function saveLead({ name, email, phone, interest, source, language, metadata = {} }) {
  return supabaseRequest("leads", {
    body: {
      name,
      email: email.toLowerCase(),
      phone,
      interest,
      source,
      language,
      metadata,
    },
  });
}

export function saveAppointment({ leadId, startAt, endAt, timeZone, status, googleEventId, googleMeetUrl, googleEventUrl, metadata = {} }) {
  return supabaseRequest("appointments", {
    body: {
      lead_id: leadId,
      start_at: startAt,
      end_at: endAt,
      time_zone: timeZone,
      status,
      google_event_id: googleEventId,
      google_meet_url: googleMeetUrl,
      google_event_url: googleEventUrl,
      metadata,
    },
  });
}
