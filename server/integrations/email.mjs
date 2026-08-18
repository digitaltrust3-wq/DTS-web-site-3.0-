import nodemailer from "nodemailer";
import {
  clientWelcomeEmail,
  ownerLeadEmail,
  appointmentClientEmail,
  appointmentOwnerEmail,
} from "../email/templates.mjs";

let transporter;

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_FROM && process.env.CONTACT_TO);
}

function getTransporter() {
  if (!isEmailConfigured()) throw new Error("Email is not configured.");
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function checkEmailConnection() {
  if (!isEmailConfigured()) return false;
  await getTransporter().verify();
  return true;
}

export async function sendContactEmails(data) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.CONTACT_FROM,
    to: process.env.CONTACT_TO,
    replyTo: data.email,
    ...ownerLeadEmail(data),
  });
  let confirmationSent = true;
  try {
    await mailer.sendMail({
      from: process.env.CONTACT_FROM,
      to: data.email,
      replyTo: process.env.CONTACT_TO,
      ...clientWelcomeEmail(data),
    });
  } catch {
    confirmationSent = false;
  }
  return { confirmationSent };
}

export async function sendAppointmentEmails(data) {
  const mailer = getTransporter();
  const results = await Promise.allSettled([
    mailer.sendMail({
      from: process.env.CONTACT_FROM,
      to: process.env.CONTACT_TO,
      replyTo: data.email,
      ...appointmentOwnerEmail(data),
    }),
    mailer.sendMail({
      from: process.env.CONTACT_FROM,
      to: data.email,
      replyTo: process.env.CONTACT_TO,
      ...appointmentClientEmail(data),
    }),
  ]);
  return { notificationSent: results[0].status === "fulfilled", confirmationSent: results[1].status === "fulfilled" };
}
