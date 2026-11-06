import nodemailer from "nodemailer";

// Tipado laxo a propósito: con `pool: true` nodemailer resuelve un overload cuyo tipo de
// retorno no coincide con el de la firma por defecto, y esto es solo estado interno del módulo.
let transporter: nodemailer.Transporter<unknown> | null = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    }) as nodemailer.Transporter<unknown>;
  }
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "Envío de correo no configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD)." };
  try {
    await t.sendMail({
      from: `"vamosmipyme.cl" <${process.env.GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido al enviar el correo." };
  }
}
