import { createSupportReply } from "./assistant/agent.mjs";
import { apiError, createRateLimiter, logError } from "./lib/security.mjs";

// A session id the browser generates and keeps in localStorage (see
// src/app/chat/ChatContext.tsx). Namespaced with "web:" so it can never
// collide with a WhatsApp phone number in the shared session store inside
// assistant/agent.mjs.
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{8,100}$/;

const limitChat = createRateLimiter({ windowMs: 5 * 60_000, limit: 20, name: "chat" });

function validateChatMessage(body) {
  const sessionId = String(body?.sessionId ?? "").trim();
  const name = String(body?.name ?? "").trim().slice(0, 100);
  const message = String(body?.message ?? "").trim();

  if (!SESSION_ID_PATTERN.test(sessionId)) return { error: ["INVALID_SESSION", "A valid chat session is required."] };
  if (message.length < 1 || message.length > 2000) return { error: ["INVALID_MESSAGE", "Enter a message between 1 and 2000 characters."] };
  return { value: { sessionId, name, message } };
}

export function registerChatRoutes(app) {
  app.post("/api/chat", limitChat, async (request, response) => {
    const validation = validateChatMessage(request.body);
    if (validation.error) return apiError(response, 400, validation.error[0], validation.error[1]);

    const { sessionId, name, message } = validation.value;
    try {
      const reply = await createSupportReply({
        customerId: `web:${sessionId}`,
        customerName: name,
        text: message,
      });
      return response.json({ ok: true, text: reply.text, handoff: reply.handoff });
    } catch (error) {
      logError("Website chat reply failed.", error, request.requestId);
      return apiError(response, 502, "CHAT_UNAVAILABLE", "The assistant could not reply. Please try again.");
    }
  });
}
