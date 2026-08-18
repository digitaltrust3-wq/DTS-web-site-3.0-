import { isSupabaseConfigured, saveLead } from "./integrations/supabase.mjs";
import { isEmailConfigured, sendContactEmails } from "./integrations/email.mjs";
import { apiError, createRateLimiter, logError } from "./lib/security.mjs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const limitContact = createRateLimiter({ windowMs: 10 * 60_000, limit: 5 });

function validateContact(body) {
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const phone = String(body?.phone ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const language = body?.language === "es" ? "es" : "en";
  const website = String(body?.website ?? "").trim();
  const submittedAt = Number(body?.submittedAt || 0);
  const privacyConsent = body?.privacyConsent === true;
  const phoneDigits = phone.replace(/\D/g, "");

  if (website) return { spam: true };
  if (!Number.isFinite(submittedAt) || Date.now() - submittedAt < 1200 || Date.now() - submittedAt > 86_400_000) return { spam: true };
  if (!privacyConsent) return { error: ["PRIVACY_CONSENT_REQUIRED", "Privacy consent is required."] };
  if (name.length < 2 || name.length > 100) return { error: ["INVALID_NAME", "Enter a valid name."] };
  if (!EMAIL_PATTERN.test(email) || email.length > 160) return { error: ["INVALID_EMAIL", "Enter a valid email address."] };
  if (phone.length > 30 || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+()\d\s.-]+$/.test(phone)) return { error: ["INVALID_PHONE", "Enter a valid phone number."] };
  if (message.length < 10 || message.length > 4000) return { error: ["INVALID_MESSAGE", "Tell us a little more about your project."] };
  return { value: { name, email, phone, message, language } };
}

export function registerContactRoutes(app) {
  app.post("/api/contact", limitContact, async (request, response) => {
    const validation = validateContact(request.body);
    if (validation.spam) return response.status(202).json({ ok: true, message: "Project request received." });
    if (validation.error) return apiError(response, 400, validation.error[0], validation.error[1]);

    const data = validation.value;
    let stored = false;
    if (isSupabaseConfigured()) {
      try {
        stored = Boolean(await saveLead({ ...data, interest: data.message, source: "website_contact", metadata: {} }));
      } catch (error) {
        logError("Contact persistence failed.", error, request.requestId);
      }
    }

    if (!isEmailConfigured()) {
      if (stored) return response.status(202).json({ ok: true, message: "Project request received.", stored, confirmationSent: false });
      return apiError(response, 503, "CONTACT_UNAVAILABLE", "The contact service is not configured yet.");
    }

    try {
      const emailResult = await sendContactEmails(data);
      return response.status(202).json({ ok: true, message: "Project request received.", stored, ...emailResult });
    } catch (error) {
      logError("Contact email failed.", error, request.requestId);
      if (stored) return response.status(202).json({ ok: true, message: "Project request received.", stored, confirmationSent: false });
      return apiError(response, 502, "EMAIL_UNAVAILABLE", "We could not send your request. Please try again later.");
    }
  });
}
