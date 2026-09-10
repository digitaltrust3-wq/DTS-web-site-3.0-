// Optional Cloudflare Turnstile verification for the admin login form.
// Inert until TURNSTILE_SECRET_KEY is set — every existing deployment keeps
// working exactly as before with no captcha step. Get free site/secret keys
// at https://dash.cloudflare.com/?to=/:account/turnstile

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const isTurnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);

/**
 * Verifies a Turnstile token server-side. Returns true when the feature is
 * not configured (opt-in), so callers should gate on `isTurnstileConfigured`
 * only when they need to know whether a token is required at all.
 */
export async function verifyTurnstileToken(token, remoteIp) {
  if (!isTurnstileConfigured) return true;
  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
