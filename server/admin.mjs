import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { isSupabaseConfigured, loadSiteContent, saveSiteContent } from "./integrations/supabase.mjs";
import { logError } from "./lib/security.mjs";

const SESSION_COOKIE = "dts_admin_session";
const SESSION_LIFETIME = 8 * 60 * 60 * 1000;
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

function createSessionToken(secret) {
  const expiresAt = Date.now() + SESSION_LIFETIME;
  const nonce = crypto.randomBytes(18).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function validSessionToken(token, secret) {
  const [expiresAt, nonce, signature] = String(token || "").split(".");
  if (!expiresAt || !nonce || !signature || Number(expiresAt) <= Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${expiresAt}.${nonce}`).digest("base64url");
  return safeEqual(signature, expected);
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

  const readContent = async () => {
    if (isSupabaseConfigured()) return loadSiteContent();
    try {
      return JSON.parse(await fs.readFile(contentPath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  };

  const requireAdmin = (request, response, next) => {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    if (!process.env.ADMIN_SESSION_SECRET || !validSessionToken(token, process.env.ADMIN_SESSION_SECRET)) {
      return response.status(401).json({ authenticated: false });
    }
    return next();
  };

  app.get("/api/content", async (request, response) => {
    try {
      response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.setHeader("Pragma", "no-cache");
      response.setHeader("Expires", "0");
      return response.json((await readContent()) || {});
    } catch (error) {
      logError("Content read failed.", error, request.requestId);
      return response.status(500).json({ message: "Content could not be loaded." });
    }
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
    const token = createSessionToken(process.env.ADMIN_SESSION_SECRET);
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions()}`);
    return response.json({ authenticated: true });
  });

  app.post("/api/admin/logout", requireAdmin, (request, response) => {
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieOptions(0)}`);
    response.status(204).end();
  });

  app.put("/api/admin/content", requireAdmin, async (request, response) => {
    const validationError = validateContent(request.body);
    if (validationError) return response.status(400).json({ message: validationError });

    try {
      if (isSupabaseConfigured()) {
        await saveSiteContent(request.body);
      } else {
        if (process.env.NODE_ENV === "production") {
          return response.status(503).json({ message: "Content storage is not configured." });
        }
        await fs.mkdir(dataDirectory, { recursive: true });
        const temporaryPath = `${contentPath}.${process.pid}.tmp`;
        await fs.writeFile(temporaryPath, `${JSON.stringify(request.body, null, 2)}\n`, "utf8");
        await fs.rename(temporaryPath, contentPath);
      }
      const savedAt = new Date().toISOString();
      return response.json({ saved: true, savedAt });
    } catch (error) {
      logError("Content save failed.", error, request.requestId);
      return response.status(500).json({ message: "Content could not be saved." });
    }
  });
}
