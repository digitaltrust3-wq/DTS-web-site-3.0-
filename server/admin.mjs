import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SESSION_COOKIE = "dts_admin_session";
const SESSION_LIFETIME = 8 * 60 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const [name, ...value] = part.trim().split("=");
    return [name, decodeURIComponent(value.join("="))];
  }).filter(([name]) => name));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function cookieOptions(maxAge = SESSION_LIFETIME) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}${secure}`;
}

function isHttpUrl(value, allowEmpty = false) {
  if (allowEmpty && value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return "Invalid content.";
  if (!content.translations || typeof content.translations !== "object") return "Translations are required.";
  if (!Array.isArray(content.portfolioSites) || content.portfolioSites.length > 20) return "Portfolio must contain no more than 20 sites.";

  for (const site of content.portfolioSites) {
    if (!site || typeof site !== "object") return "Invalid portfolio item.";
    if (typeof site.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(site.id)) return "Each project needs a valid identifier.";
    if (!isHttpUrl(String(site.url || ""))) return `Invalid project URL for ${site.id}.`;
    if (!isHttpUrl(String(site.image || ""), true)) return `Invalid image URL for ${site.id}.`;
    if (!Array.isArray(site.tags) || site.tags.length > 12) return `Too many tags for ${site.id}.`;
    for (const language of ["en", "es"]) {
      const copy = site.copy?.[language];
      if (!copy || [copy.title, copy.category, copy.description].some((value) => typeof value !== "string")) {
        return `Missing ${language} content for ${site.id}.`;
      }
    }
  }
  return null;
}

export function registerAdminRoutes(app, projectRoot) {
  // Administrator credentials stay server-side and are never included in the client bundle.
  const dataDirectory = path.join(projectRoot, "server", "data");
  const contentPath = path.join(dataDirectory, "content.json");
  const contentSubscribers = new Set();

  const announceContentUpdate = (savedAt) => {
    const event = `event: content-updated\ndata: ${JSON.stringify({ savedAt })}\n\n`;
    contentSubscribers.forEach((subscriber) => subscriber.write(event));
  };

  const readContent = async () => {
    try {
      return JSON.parse(await fs.readFile(contentPath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  };

  const requireAdmin = (request, response, next) => {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    const session = token && sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token);
      return response.status(401).json({ authenticated: false });
    }
    session.expiresAt = Date.now() + SESSION_LIFETIME;
    return next();
  };

  app.get("/api/content", async (_request, response) => {
    try {
      response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.setHeader("Pragma", "no-cache");
      response.setHeader("Expires", "0");
      return response.json((await readContent()) || {});
    } catch (error) {
      console.error("Content read failed", error);
      return response.status(500).json({ message: "Content could not be loaded." });
    }
  });

  app.get("/api/content/events", (request, response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();
    response.write("event: connected\ndata: {}\n\n");
    contentSubscribers.add(response);
    request.on("close", () => contentSubscribers.delete(response));
  });

  app.get("/api/admin/session", requireAdmin, (_request, response) => {
    response.json({ authenticated: true });
  });

  app.post("/api/admin/login", (request, response) => {
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredEmail || !configuredPassword || !process.env.ADMIN_SESSION_SECRET) {
      return response.status(503).json({ message: "The administrator account is not configured." });
    }

    const clientKey = request.ip || "unknown";
    const attempt = loginAttempts.get(clientKey) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    if (attempt.resetAt <= Date.now()) {
      attempt.count = 0;
      attempt.resetAt = Date.now() + 15 * 60 * 1000;
    }
    if (attempt.count >= 5) return response.status(429).json({ message: "Too many attempts. Try again later." });

    const email = String(request.body?.email || "").trim().toLowerCase();
    const password = String(request.body?.password || "");
    if (!safeEqual(email, configuredEmail.trim().toLowerCase()) || !safeEqual(password, configuredPassword)) {
      attempt.count += 1;
      loginAttempts.set(clientKey, attempt);
      return response.status(401).json({ message: "Invalid email or password." });
    }

    loginAttempts.delete(clientKey);
    const entropy = crypto.randomBytes(32).toString("hex");
    const token = crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(entropy).digest("hex");
    sessions.set(token, { expiresAt: Date.now() + SESSION_LIFETIME });
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions()}`);
    return response.json({ authenticated: true });
  });

  app.post("/api/admin/logout", requireAdmin, (request, response) => {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    if (token) sessions.delete(token);
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieOptions(0)}`);
    response.status(204).end();
  });

  app.put("/api/admin/content", requireAdmin, async (request, response) => {
    const validationError = validateContent(request.body);
    if (validationError) return response.status(400).json({ message: validationError });

    try {
      await fs.mkdir(dataDirectory, { recursive: true });
      const temporaryPath = `${contentPath}.${process.pid}.tmp`;
      await fs.writeFile(temporaryPath, `${JSON.stringify(request.body, null, 2)}\n`, "utf8");
      await fs.rename(temporaryPath, contentPath);
      const savedAt = new Date().toISOString();
      announceContentUpdate(savedAt);
      return response.json({ saved: true, savedAt });
    } catch (error) {
      console.error("Content save failed", error);
      return response.status(500).json({ message: "Content could not be saved." });
    }
  });
}
