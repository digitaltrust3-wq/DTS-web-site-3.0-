import "dotenv/config";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.GOOGLE_OAUTH_LOCAL_PORT || 3012);
const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;
const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(projectRoot, ".env");

if (!clientId || !clientSecret) {
  console.error("\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.\n");
  console.error("Add both values, then run this command again.\n");
  process.exit(1);
}

function setEnvValue(source, key, value) {
  const safeValue = String(value).replace(/[\r\n]/g, "");
  const line = `${key}=${safeValue}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(source)) return source.replace(pattern, line);
  return `${source.trimEnd()}\n${line}\n`;
}

function saveCalendarConfiguration(refreshToken) {
  let source = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  source = setEnvValue(source, "GOOGLE_REFRESH_TOKEN", refreshToken);
  source = setEnvValue(source, "GOOGLE_CALENDAR_ID", process.env.GOOGLE_CALENDAR_ID || "primary");
  source = setEnvValue(source, "GOOGLE_TIME_ZONE", "America/Bogota");
  source = setEnvValue(source, "SCHEDULING_UTC_OFFSET", "-05:00");
  source = setEnvValue(source, "SCHEDULING_START_HOUR", "8");
  source = setEnvValue(source, "SCHEDULING_END_HOUR", "21");
  source = setEnvValue(source, "SCHEDULING_SLOT_MINUTES", process.env.SCHEDULING_SLOT_MINUTES || "30");
  source = setEnvValue(source, "SCHEDULING_DAYS_AHEAD", process.env.SCHEDULING_DAYS_AHEAD || "30");
  source = setEnvValue(source, "SCHEDULING_MIN_NOTICE_HOURS", process.env.SCHEDULING_MIN_NOTICE_HOURS || "4");
  fs.writeFileSync(envPath, source, { encoding: "utf8", mode: 0o600 });
}

const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/calendar",
  access_type: "offline",
  prompt: "consent",
  include_granted_scopes: "true",
}).toString();

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", redirectUri);
  if (requestUrl.pathname !== "/oauth2/callback") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const oauthError = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  if (oauthError || !code) {
    response.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<h1>Authorization was not completed</h1><p>You can close this window and try again.</p>");
    console.error(`Google authorization failed: ${oauthError || "missing code"}`);
    server.close();
    return;
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.refresh_token) {
      throw new Error(tokens.error_description || tokens.error || "Google did not return a refresh token.");
    }

    saveCalendarConfiguration(tokens.refresh_token);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<main style='font-family:system-ui;max-width:640px;margin:80px auto;padding:24px'><h1>Google Calendar connected</h1><p>The private refresh token and Colombia scheduling hours were saved in your local .env file.</p><p>You can close this window and return to Codex.</p></main>");
    console.log("\nGoogle Calendar connected successfully.");
    console.log("The refresh token was saved to .env and was not printed.\n");
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<h1>Calendar connection failed</h1><p>Return to the terminal for details.</p>");
    console.error("\nCalendar connection failed:", error instanceof Error ? error.message : error);
  } finally {
    setTimeout(() => server.close(), 500);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log("\nGoogle Calendar authorization is ready.");
  console.log(`1. In Google Cloud, add this exact Authorized redirect URI:\n   ${redirectUri}`);
  console.log("2. Open this URL in your browser and approve access:\n");
  console.log(authorizationUrl.toString());
  console.log("\nWaiting for Google authorization...\n");
});

setTimeout(() => {
  console.error("Authorization timed out after 10 minutes. Run the command again.");
  server.close();
}, 10 * 60_000).unref();
