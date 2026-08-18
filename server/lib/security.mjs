import { randomUUID } from "node:crypto";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function configuredOrigins() {
  const origins = new Set();
  for (const key of ["PUBLIC_SITE_URL", "VITE_SITE_URL"]) {
    const value = String(process.env[key] || "").trim();
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Invalid deployment values are reported by the deployment checker.
    }
  }
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://127.0.0.1:5192");
    origins.add("http://localhost:5192");
  }
  return origins;
}

export function applySecurity(app) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use((request, response, next) => {
    request.requestId = request.get("x-request-id")?.slice(0, 80) || randomUUID();
    response.setHeader("X-Request-ID", request.requestId);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
    );
    if (process.env.NODE_ENV === "production") {
      response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.use("/api", (request, response, next) => {
    if (SAFE_METHODS.has(request.method)) return next();
    const origin = request.get("origin");
    if (!origin || configuredOrigins().has(origin)) return next();
    return response.status(403).json({ ok: false, error: { code: "ORIGIN_NOT_ALLOWED", message: "Request origin is not allowed." } });
  });
}

export function createRateLimiter({ windowMs, limit }) {
  const requests = new Map();
  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip || "unknown";
    const current = requests.get(key);
    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > limit) {
      response.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return response.status(429).json({ ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } });
    }
    return next();
  };
}

export function logError(message, error, requestId) {
  const entry = { level: "error", message, requestId };
  if (process.env.NODE_ENV !== "production" && error instanceof Error) entry.detail = error.message;
  console.error(JSON.stringify(entry));
}

export function apiError(response, status, code, message) {
  return response.status(status).json({ ok: false, error: { code, message } });
}
