import "dotenv/config";
import nodemailer from "nodemailer";

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_FROM", "CONTACT_TO"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing email configuration: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
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
    await transporter.verify();
    console.log(`SMTP authentication verified successfully with ${process.env.SMTP_HOST}.`);

    if (process.env.EMAIL_SEND_TEST === "true") {
      const result = await transporter.sendMail({
        from: process.env.CONTACT_FROM,
        to: process.env.CONTACT_TO,
        subject: "Digital Trust Solutions | Email service test",
        text: "The email service is connected correctly to the Digital Trust Solutions website.",
        html: "<p>The email service is connected correctly to the <strong>Digital Trust Solutions</strong> website.</p>",
      });
      console.log(`Test email accepted: ${result.messageId}`);
    }
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    process.exitCode = 1;
  } finally {
    transporter.close();
  }
}
