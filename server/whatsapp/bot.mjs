import { companyKnowledge, quickAnswers } from "./knowledge.mjs";

const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const handoffPattern = /\b(asesor|agente|persona|humano|representante|llamada|human|agent|representative|call me)\b/i;

function detectLanguage(text) {
  return /[¿¡áéíóúñ]|\b(hola|quiero|necesito|gracias|precio|servicio)\b/i.test(text) ? "es" : "en";
}

function fallbackReply(text) {
  const language = detectLanguage(text);
  const normalized = text.toLocaleLowerCase();
  const match = quickAnswers.find((answer) =>
    answer.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (match) return match[language];
  return language === "es"
    ? "Gracias por escribir a Digital Trust Solutions. Puedo ayudarte con software a medida, aplicaciones móviles, nube, datos, ciberseguridad e integraciones. ¿Qué necesitas resolver?"
    : "Thank you for contacting Digital Trust Solutions. I can help with custom software, mobile apps, cloud, data, cybersecurity and integrations. What do you need to solve?";
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text.trim();
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text.trim();
    }
  }
  return "";
}

function getPreviousResponseId(customerId) {
  const session = sessions.get(customerId);
  if (!session || Date.now() - session.updatedAt > SESSION_TTL_MS) {
    sessions.delete(customerId);
    return undefined;
  }
  return session.responseId;
}

export async function createSupportReply({ customerId, customerName, text }) {
  const language = detectLanguage(text);
  if (handoffPattern.test(text)) {
    return {
      text: language === "es"
        ? "Claro. Registraré tu solicitud para que un especialista continúe la conversación. Por favor comparte tu nombre, empresa y el motivo principal de la consulta."
        : "Of course. I will flag this conversation for a specialist. Please share your name, company and the main reason for your request.",
      handoff: true,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { text: fallbackReply(text), handoff: false };
  }

  const previousResponseId = getPreviousResponseId(customerId);
  const instructions = `
You are the WhatsApp customer support assistant for Digital Trust Solutions.
Answer in the language used by the customer, Spanish or English.
Be warm, concise and practical. Keep most replies below 700 characters.
Ask at most one useful follow-up question per reply.
Use only the supplied company knowledge. Never invent prices, deadlines, clients or guarantees.
If information is missing, say so and offer a human specialist.
Escalate requests involving contracts, payments, legal issues, active security incidents, complaints or an explicit request for a person.
Never request passwords, payment card data, authentication codes or sensitive personal data.

COMPANY KNOWLEDGE:
${companyKnowledge}
  `.trim();

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        instructions,
        input: `Customer name: ${customerName || "Not provided"}\nCustomer message: ${text}`,
        previous_response_id: previousResponseId,
        store: true,
        max_output_tokens: 350,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!apiResponse.ok) throw new Error(`OpenAI request failed with ${apiResponse.status}`);
    const result = await apiResponse.json();
    const reply = extractOutputText(result);
    if (!reply) throw new Error("OpenAI returned an empty response");

    sessions.set(customerId, { responseId: result.id, updatedAt: Date.now() });
    return { text: reply, handoff: false };
  } catch (error) {
    console.error("WhatsApp assistant response failed", error);
    return { text: fallbackReply(text), handoff: false };
  }
}
