const website = `${String(process.env.PUBLIC_SITE_URL || "https://digitaltrust3-wq.github.io/DTS-web-site-3.0-").replace(/\/$/, "")}/`;

const brand = {
  name: "Digital Trust Solutions",
  website,
  logo: `${website}assets/brand/brand-mark.svg`,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(content) {
  return `<!doctype html>
<html><body style="margin:0;background:#07101a;color:#eaf1f7;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07101a;padding:32px 16px">
    <tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid #26384a;border-radius:16px;background:#0d1824;overflow:hidden">
      <tr><td style="padding:28px 32px;border-bottom:1px solid #26384a"><table role="presentation" cellspacing="0" cellpadding="0"><tr>
        <td><img src="${brand.logo}" width="42" height="42" alt="" style="display:block"></td>
        <td style="padding-left:14px;color:#f7fafc;font-size:15px;font-weight:700;letter-spacing:.04em">${brand.name}</td>
      </tr></table></td></tr>
      <tr><td style="padding:34px 32px">${content}</td></tr>
      <tr><td style="padding:22px 32px;border-top:1px solid #26384a;color:#8295a8;font-size:12px;line-height:1.6"><a href="${brand.website}" style="color:#b8c9d8;text-decoration:none">${brand.website}</a></td></tr>
    </table></td></tr>
  </table>
</body></html>`;
}

export function ownerLeadEmail({ name, email, phone, message, language }) {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    message: escapeHtml(message).replaceAll("\n", "<br>"),
    language: language === "es" ? "Español" : "English",
  };
  return {
    subject: `[Cotización] Nueva solicitud de ${name}`,
    text: ["Nueva solicitud de cotización", "", `Nombre: ${name}`, `Correo: ${email}`, `Teléfono: ${phone}`, `Idioma: ${safe.language}`, "", "Detalles:", message].join("\n"),
    html: emailShell(`
      <p style="margin:0 0 8px;color:#8fa4b8;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Nueva oportunidad</p>
      <h1 style="margin:0 0 24px;color:#fff;font-size:28px;line-height:1.2">Solicitud de cotización</h1>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6">
        <tr><td style="width:110px;padding:6px 0;color:#8295a8">Nombre</td><td style="padding:6px 0;color:#f1f5f9">${safe.name}</td></tr>
        <tr><td style="padding:6px 0;color:#8295a8">Correo</td><td style="padding:6px 0"><a href="mailto:${safe.email}" style="color:#dbe8f2">${safe.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#8295a8">Teléfono</td><td style="padding:6px 0"><a href="tel:${safe.phone}" style="color:#dbe8f2">${safe.phone}</a></td></tr>
        <tr><td style="padding:6px 0;color:#8295a8">Idioma</td><td style="padding:6px 0;color:#f1f5f9">${safe.language}</td></tr>
      </table>
      <div style="margin-top:24px;padding:20px;border-radius:10px;background:#09131e;color:#d6e0e9;font-size:14px;line-height:1.7">${safe.message}</div>`),
  };
}

export function clientWelcomeEmail({ name, language }) {
  const safeName = escapeHtml(name);
  const spanish = language === "es";
  return {
    subject: spanish ? "Recibimos tu solicitud | Digital Trust Solutions" : "We received your request | Digital Trust Solutions",
    text: spanish
      ? `Hola ${name},\n\nGracias por contactar a Digital Trust Solutions. Recibimos la información de tu proyecto y nuestro equipo la revisará para preparar el siguiente paso de la cotización. Nos comunicaremos contigo pronto.\n\nDigital Trust Solutions`
      : `Hello ${name},\n\nThank you for contacting Digital Trust Solutions. We received your project information and our team will review it to prepare the next quotation step. We will contact you soon.\n\nDigital Trust Solutions`,
    html: emailShell(spanish ? `
      <p style="margin:0 0 8px;color:#8fa4b8;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Solicitud recibida</p>
      <h1 style="margin:0 0 20px;color:#fff;font-size:30px;line-height:1.2">Gracias por contactarnos, ${safeName}</h1>
      <p style="margin:0 0 18px;color:#c3d0dc;font-size:15px;line-height:1.75">Recibimos la información de tu proyecto. Nuestro equipo la revisará para preparar el siguiente paso de la cotización.</p>
      <p style="margin:0;color:#c3d0dc;font-size:15px;line-height:1.75">Nos comunicaremos contigo pronto por correo o teléfono.</p>` : `
      <p style="margin:0 0 8px;color:#8fa4b8;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Request received</p>
      <h1 style="margin:0 0 20px;color:#fff;font-size:30px;line-height:1.2">Thank you for contacting us, ${safeName}</h1>
      <p style="margin:0 0 18px;color:#c3d0dc;font-size:15px;line-height:1.75">We received your project information. Our team will review it to prepare the next quotation step.</p>
      <p style="margin:0;color:#c3d0dc;font-size:15px;line-height:1.75">We will contact you soon by email or phone.</p>`),
  };
}
