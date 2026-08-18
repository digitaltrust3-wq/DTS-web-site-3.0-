import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { receiveWebhook, verifyWebhook } from "./whatsapp/webhook.mjs";
import { registerAdminRoutes } from "./admin.mjs";
import { registerContactRoutes } from "./contact.mjs";
import { registerSchedulingRoutes } from "./scheduling.mjs";
import { checkGoogleCalendarConnection, isGoogleCalendarConfigured } from "./integrations/google-calendar.mjs";
import { checkSupabaseConnection, isSupabaseConfigured } from "./integrations/supabase.mjs";
import { checkEmailConnection, isEmailConfigured } from "./integrations/email.mjs";
import { apiError, applySecurity, logError } from "./lib/security.mjs";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");
const publicBasePath = process.env.PUBLIC_BASE_PATH || "/DTS-web-site-3.0-";

applySecurity(app);
app.use(express.json({
  limit: "64kb",
  strict: true,
  verify: (request, _response, buffer) => {
    request.rawBody = buffer;
  },
}));

registerAdminRoutes(app, projectRoot);
registerContactRoutes(app);
registerSchedulingRoutes(app);

app.get("/api/health", (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.json({ status: "ok" });
});

app.get("/api/ready", async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  const configured = {
    database: isSupabaseConfigured(),
    calendar: isGoogleCalendarConfigured(),
    email: isEmailConfigured(),
  };
  const reachable = { ...configured };

  if (request.query.deep === "1") {
    const checks = await Promise.allSettled([
      configured.database ? checkSupabaseConnection() : Promise.resolve(false),
      configured.calendar ? checkGoogleCalendarConnection() : Promise.resolve(false),
      configured.email ? checkEmailConnection() : Promise.resolve(false),
    ]);
    reachable.database = checks[0].status === "fulfilled" && checks[0].value === true;
    reachable.calendar = checks[1].status === "fulfilled" && checks[1].value === true;
    reachable.email = checks[2].status === "fulfilled" && checks[2].value === true;
  }

  const ready = Object.values(configured).every(Boolean) && Object.values(reachable).every(Boolean);
  response.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", services: { configured, reachable } });
});

app.get("/api/whatsapp/webhook", verifyWebhook);
app.post("/api/whatsapp/webhook", receiveWebhook);
app.use("/api", (_request, response) => apiError(response, 404, "NOT_FOUND", "API endpoint not found."));

if (!process.env.VERCEL) {
  app.use(publicBasePath, express.static(distPath));
  app.use(express.static(distPath));
  app.use((request, response, next) => {
    if (request.method !== "GET") return next();
    response.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((error, request, response, _next) => {
  logError("Unhandled request error.", error, request.requestId);
  if (response.headersSent) return;
  apiError(response, error?.type === "entity.too.large" ? 413 : 500, "REQUEST_FAILED", "The request could not be processed.");
});

export default app;
