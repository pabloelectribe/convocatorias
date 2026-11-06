import { EmailType } from "./enums";
import { formatDateTime, fullName } from "./format";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido" };

type EventLite = {
  title: string;
  description?: string | null;
  startAt: Date;
  modality: string;
  location?: string | null;
};
type ContactLite = { firstName?: string | null; lastName?: string | null };

function layout(bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
      <p style="font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #15803d; font-weight: 600; margin-bottom: 4px;">vamosmipyme.cl</p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Este correo fue enviado por el programa vamosmipyme.cl. Si no esperabas este mensaje, puedes ignorarlo.</p>
    </div>`;
}

function eventDetails(event: EventLite): string {
  return `
    <p style="font-size: 14px; color: #475569; margin: 4px 0;">📅 ${formatDateTime(event.startAt)}</p>
    <p style="font-size: 14px; color: #475569; margin: 4px 0;">📍 ${MODALITY_LABEL[event.modality] ?? event.modality}${event.location ? ` · ${event.location}` : ""}</p>`;
}

export function buildEmail(
  type: EmailType,
  event: EventLite,
  contact: ContactLite,
  link: string
): { subject: string; html: string } {
  const name = fullName(contact);

  if (type === EmailType.INVITACION) {
    return {
      subject: `Te invitamos a "${event.title}"`,
      html: layout(`
        <h1 style="font-size: 20px; margin: 12px 0 4px;">${event.title}</h1>
        ${event.description ? `<p style="font-size: 14px; color: #475569;">${event.description}</p>` : ""}
        ${eventDetails(event)}
        <p style="font-size: 14px; margin-top: 16px;">Hola ${name}, queremos invitarte a esta actividad. Confirma tu asistencia aquí:</p>
        <p style="margin: 20px 0;"><a href="${link}" style="background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Confirmar asistencia</a></p>`),
    };
  }

  if (type === EmailType.RECORDATORIO) {
    return {
      subject: `Recordatorio: "${event.title}" se acerca`,
      html: layout(`
        <h1 style="font-size: 20px; margin: 12px 0 4px;">Recordatorio: ${event.title}</h1>
        ${eventDetails(event)}
        <p style="font-size: 14px; margin-top: 16px;">Hola ${name}, te recordamos que aún no has confirmado tu asistencia a esta actividad.</p>
        <p style="margin: 20px 0;"><a href="${link}" style="background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Confirmar asistencia</a></p>`),
    };
  }

  if (type === EmailType.REINSISTENCIA) {
    return {
      subject: `¿Nos acompañas en "${event.title}"?`,
      html: layout(`
        <h1 style="font-size: 20px; margin: 12px 0 4px;">${event.title}</h1>
        ${eventDetails(event)}
        <p style="font-size: 14px; margin-top: 16px;">Hola ${name}, notamos que no has respondido nuestra invitación. Nos encantaría contar con tu presencia, aún estás a tiempo de confirmar:</p>
        <p style="margin: 20px 0;"><a href="${link}" style="background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Confirmar asistencia</a></p>`),
    };
  }

  // CONFIRMACION
  return {
    subject: `Confirmamos tu inscripción a "${event.title}"`,
    html: layout(`
      <h1 style="font-size: 20px; margin: 12px 0 4px;">¡Inscripción confirmada!</h1>
      ${eventDetails(event)}
      <p style="font-size: 14px; margin-top: 16px;">Hola ${name}, tu inscripción a "${event.title}" quedó registrada. Te esperamos.</p>
      <p style="margin: 20px 0;"><a href="${link}" style="background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Ver detalle de la invitación</a></p>`),
  };
}
