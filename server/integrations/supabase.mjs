const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseRequest(table, { method = "POST", body, query = "", prefer = "return=representation" } = {}) {
  if (!isSupabaseConfigured()) return null;

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${table} request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return null;
  const result = await response.json();
  return Array.isArray(result) ? result[0] ?? null : result;
}

export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured()) return false;
  await supabaseRequest("leads", { method: "GET", query: "?select=id&limit=1", prefer: "" });
  return true;
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

export function reserveAppointment({ requestId, leadId, startAt, endAt, timeZone, metadata = {} }) {
  return supabaseRequest("appointments", {
    body: {
      request_id: requestId,
      lead_id: leadId,
      start_at: startAt,
      end_at: endAt,
      time_zone: timeZone,
      status: "pending",
      metadata,
    },
  });
}

export function updateAppointment({ requestId, status, googleEventId = null, googleMeetUrl = null, googleEventUrl = null }) {
  return supabaseRequest("appointments", {
    method: "PATCH",
    query: `?request_id=eq.${encodeURIComponent(requestId)}`,
    body: {
      status,
      google_event_id: googleEventId,
      google_meet_url: googleMeetUrl,
      google_event_url: googleEventUrl,
    },
  });
}

export function loadSiteContent() {
  return supabaseRequest("site_content", {
    method: "GET",
    query: "?select=content&key=eq.website&limit=1",
    prefer: "",
  }).then((row) => row?.content ?? null);
}

export function saveSiteContent(content) {
  return supabaseRequest("site_content", {
    query: "?on_conflict=key",
    prefer: "resolution=merge-duplicates,return=representation",
    body: { key: "website", content },
  });
}
