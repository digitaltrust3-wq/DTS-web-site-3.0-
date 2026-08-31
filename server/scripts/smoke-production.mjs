const baseUrl = String(process.env.PRODUCTION_URL || "https://dts-web-site-3-0.vercel.app").replace(/\/$/, "");
const timeZone = process.env.GOOGLE_TIME_ZONE || "America/Bogota";
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 15_000);
const checks = [];

function addCheck(name, passed, detail) {
  checks.push({ name, passed: Boolean(passed), detail });
}

async function request(path) {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { accept: "application/json, text/html;q=0.9, */*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return {
      ok: response.ok,
      status: response.status,
      body,
      headers: response.headers,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: null,
      headers: new Headers(),
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function dateInTimeZone(daysAhead = 0) {
  const instant = new Date(Date.now() + daysAhead * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function slotHour(isoDate) {
  const match = String(isoDate || "").match(/T(\d{2}):(\d{2})/);
  if (!match) return Number.NaN;
  return Number(match[1]) + Number(match[2]) / 60;
}

console.log(`\nDigital Trust Solutions production smoke test`);
console.log(`Target: ${baseUrl}`);
console.log(`Mode: read-only (no contacts, bookings or calendar events are created)\n`);

const home = await request("/");
addCheck("Public homepage", home.status === 200, `HTTP ${home.status || "unreachable"}, ${home.durationMs} ms`);
addCheck(
  "Content Security Policy",
  Boolean(home.headers.get("content-security-policy")),
  home.headers.get("content-security-policy") ? "present" : "missing",
);
addCheck(
  "Strict Transport Security",
  Boolean(home.headers.get("strict-transport-security")),
  home.headers.get("strict-transport-security") ? "present" : "missing",
);

const privacy = await request("/privacy.html");
addCheck("Privacy page", privacy.status === 200, `HTTP ${privacy.status || "unreachable"}, ${privacy.durationMs} ms`);

const health = await request("/api/health");
addCheck(
  "API health",
  health.status === 200 && health.body?.status === "ok",
  `HTTP ${health.status || "unreachable"}, ${health.durationMs} ms`,
);

const readiness = await request("/api/ready?deep=1");
const services = readiness.body?.services || {};
for (const service of ["database", "calendar", "email"]) {
  const configured = services.configured?.[service] === true;
  const reachable = services.reachable?.[service] === true;
  addCheck(
    `${service[0].toUpperCase()}${service.slice(1)} configured`,
    configured,
    configured ? "yes" : "no",
  );
  addCheck(
    `${service[0].toUpperCase()}${service.slice(1)} reachable`,
    reachable,
    reachable ? "yes" : "no",
  );
}

const availabilityDate = dateInTimeZone(1);
const availability = await request(`/api/scheduling/availability?date=${availabilityDate}`);
const slots = Array.isArray(availability.body?.slots) ? availability.body.slots : [];
addCheck(
  "Calendar availability endpoint",
  availability.status === 200 && availability.body?.configured === true,
  `HTTP ${availability.status || "unreachable"}, ${slots.length} slots`,
);
addCheck(
  "Scheduling timezone",
  availability.body?.timeZone === timeZone,
  availability.body?.timeZone || "not returned",
);

if (slots.length > 0) {
  const firstStart = slotHour(slots[0]?.startAt);
  const lastEnd = slotHour(slots.at(-1)?.endAt);
  addCheck("First slot starts at or after 08:00", firstStart >= 8, slots[0]?.startAt || "invalid");
  addCheck("Last slot ends by 21:00", lastEnd <= 21, slots.at(-1)?.endAt || "invalid");
} else {
  addCheck("Available slot list", false, "no slots returned for the next day");
}

for (const check of checks) {
  console.log(`${check.passed ? "PASS" : "FAIL"}  ${check.name} — ${check.detail}`);
}

const failures = checks.filter((check) => !check.passed);
console.log(`\nResult: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length) {
  console.error("Production is not ready. Do not deploy or announce the release.");
  process.exitCode = 1;
} else {
  console.log("Read-only production checks passed. Continue with controlled write tests before deployment.");
}

