import crypto from "node:crypto";
import { createSupportReply } from "./bot.mjs";

const processedMessages = new Map();
const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

function hasValidSignature(request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !request.rawBody) return false;
  const received = request.get("x-hub-signature-256") ?? "";
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(request.rawBody).digest("hex")}`;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function rememberMessage(messageId) {
  const now = Date.now();
  for (const [id, timestamp] of processedMessages) {
    if (now - timestamp > MESSAGE_TTL_MS) processedMessages.delete(id);
  }
  if (processedMessages.has(messageId)) return false;
  processedMessages.set(messageId, now);
  return true;
}

function getIncomingMessages(payload) {
  const incoming = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const contacts = new Map((value.contacts ?? []).map((contact) => [contact.wa_id, contact.profile?.name]));
      for (const message of value.messages ?? []) {
        if (message.type !== "text" || !message.text?.body) continue;
        incoming.push({
          id: message.id,
          from: message.from,
          name: contacts.get(message.from) ?? "",
          text: String(message.text.body).trim(),
        });
      }
    }
  }
  return incoming;
}

async function sendWhatsAppText(to, text) {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!version || !phoneNumberId || !accessToken) {
    throw new Error("WhatsApp sending configuration is incomplete");
  }

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp send failed with ${response.status}: ${details}`);
  }
}

export function verifyWebhook(request, response) {
  const mode = request.query["hub.mode"];
  const token = request.query["hub.verify_token"];
  const challenge = request.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return response.status(200).send(challenge);
  }
  return response.sendStatus(403);
}

export function receiveWebhook(request, response) {
  if (!hasValidSignature(request)) return response.sendStatus(401);
  response.sendStatus(200);

  const messages = getIncomingMessages(request.body);
  Promise.all(messages.map(async (message) => {
    if (!rememberMessage(message.id)) return;
    const reply = await createSupportReply({
      customerId: message.from,
      customerName: message.name,
      text: message.text,
    });
    await sendWhatsAppText(message.from, reply.text);
    if (reply.handoff) {
      console.info(`WhatsApp handoff requested by ${message.from}`);
    }
  })).catch((error) => console.error("WhatsApp webhook processing failed", error));
}
