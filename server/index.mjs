import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { receiveWebhook, verifyWebhook } from "./whatsapp/webhook.mjs";
import { registerAdminRoutes } from "./admin.mjs";
import { clientWelcomeEmail, ownerLeadEmail } from "./email/templates.mjs";

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");
const publicBasePath = process.env.PUBLIC_BASE_PATH || "/DTS-web-site-3.0-";
const recentRequests = new Map();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({
  limit: "512kb",
  verify: (request, _response, buffer) => {
    request.rawBody = buffer;
  },
}));

registerAdminRoutes(app, projectRoot);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "digital-trust-solutions" });
});

app.get("/api/whatsapp/webhook", verifyWebhook);
app.post("/api/whatsapp/webhook", receiveWebhook);

app.post("/api/contact", async (request, response) => {
  const name = String(request.body?.name ?? "").trim();
  const email = String(request.body?.email ?? "").trim();
  const phone = String(request.body?.phone ?? "").trim();
  const message = String(request.body?.message ?? "").trim();
  const language = request.body?.language === "es" ? "es" : "en";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2 || name.length > 100) {
    return response.status(400).json({ message: "Enter a valid name." });
  }

  if (!emailPattern.test(email) || email.length > 160) {
    return response.status(400).json({ message: "Enter a valid email address." });
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phone.length > 30 || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+()\d\s.-]+$/.test(phone)) {
    return response.status(400).json({ message: "Enter a valid phone number." });
  }

  if (message.length < 10 || message.length > 4000) {
    return response.status(400).json({ message: "Tell us a little more about your project." });
  }

  const clientKey = `${request.ip}:${email.toLowerCase()}`;
  const previousRequest = recentRequests.get(clientKey);
  if (previousRequest && Date.now() - previousRequest < 60_000) {
    return response.status(429).json({ message: "Please wait before sending another request." });
  }

  const requiredConfiguration = [
    "SMTP_USER",
    "SMTP_PASS",
    "CONTACT_TO",
    "CONTACT_FROM",
  ];
  const missingConfiguration = requiredConfiguration.filter((key) => !process.env[key]);

  if (missingConfiguration.length > 0) {
    console.error(`Contact service is missing: ${missingConfiguration.join(", ")}`);
    return response.status(503).json({
      message: "The contact service is not configured yet. Please contact us directly.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const ownerEmail = ownerLeadEmail({ name, email, phone, message, language });
    await transporter.sendMail({
      from: process.env.CONTACT_FROM,
      to: process.env.CONTACT_TO,
      replyTo: email,
      ...ownerEmail,
    });

    const welcomeEmail = clientWelcomeEmail({ name, language });
    let confirmationSent = true;
    try {
      await transporter.sendMail({
        from: process.env.CONTACT_FROM,
        to: email,
        replyTo: process.env.CONTACT_TO,
        ...welcomeEmail,
      });
    } catch (confirmationError) {
      confirmationSent = false;
      console.error("Client welcome email failed", confirmationError);
    }

    recentRequests.set(clientKey, Date.now());
    return response.status(202).json({ message: "Project request received.", confirmationSent });
  } catch (error) {
    console.error("Contact email failed", error);
    return response.status(502).json({
      message: "We couldn't send your request. Please try again later.",
    });
  }
});

app.use(publicBasePath, express.static(distPath));
app.use(express.static(distPath));
app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api/")) return next();
  response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Digital Trust Solutions server listening on http://127.0.0.1:${port}`);
});
