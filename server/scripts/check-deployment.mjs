import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const issues = [];
const warnings = [];

function value(key) {
  return String(process.env[key] || "").trim();
}

function configured(key) {
  const current = value(key);
  return Boolean(current) && !/(replace|your-|example\.com|tu-dominio)/i.test(current);
}

const production = value("NODE_ENV") === "production" || Boolean(value("VERCEL"));

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 20 || nodeMajor >= 25) {
  issues.push(`Node.js ${process.versions.node} is unsupported. Use a Node.js version from 20 through 24.`);
}

const apiPort = Number(value("PORT") || 3001);
const oauthPort = Number(value("GOOGLE_OAUTH_LOCAL_PORT") || 3012);
if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
  issues.push("PORT must contain a valid TCP port.");
}
if (apiPort === oauthPort) {
  issues.push("PORT and GOOGLE_OAUTH_LOCAL_PORT must be different.");
}

const calendarKeys = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_CALENDAR_ID",
];
const missingCalendar = calendarKeys.filter((key) => !configured(key));
if (missingCalendar.length) {
  issues.push(`Calendar configuration is incomplete: ${missingCalendar.join(", ")}.`);
}

if (!configured("SUPABASE_URL") || !configured("SUPABASE_SERVICE_ROLE_KEY")) {
  (production ? issues : warnings).push("Supabase is not fully configured; production bookings and managed content require persistent storage.");
}

if (!configured("SMTP_USER") || !configured("SMTP_PASS") || !configured("CONTACT_TO")) {
  (production ? issues : warnings).push("SMTP is not fully configured; contact and booking confirmations will be unavailable.");
}

if (!configured("ADMIN_EMAIL") || value("ADMIN_PASSWORD").length < 16 || value("ADMIN_SESSION_SECRET").length < 32) {
  (production ? issues : warnings).push("Administrator credentials are missing or too weak.");
}

for (const key of ["PUBLIC_SITE_URL", "VITE_SITE_URL"]) {
  if (production && (!configured(key) || !value(key).startsWith("https://"))) issues.push(`${key} must be a production HTTPS URL.`);
}

if (!fs.existsSync(path.join(projectRoot, "dist", "index.html"))) {
  warnings.push("The production frontend has not been built. Run npm run build before npm start.");
}

console.log("\nDigital Trust Solutions deployment check");
console.log(`- Node.js: ${process.versions.node}`);
console.log(`- API port: ${apiPort}`);
console.log(`- Local OAuth port: ${oauthPort}`);
console.log(`- Calendar credentials: ${missingCalendar.length ? "incomplete" : "configured"}`);
console.log(`- Supabase: ${configured("SUPABASE_URL") && configured("SUPABASE_SERVICE_ROLE_KEY") ? "configured" : "optional / incomplete"}`);
console.log(`- SMTP: ${configured("SMTP_USER") && configured("SMTP_PASS") && configured("CONTACT_TO") ? "configured" : "optional / incomplete"}`);

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
for (const issue of issues) console.error(`ERROR: ${issue}`);

if (issues.length) process.exit(1);
console.log("\nConfiguration is ready for the scheduling service.\n");
