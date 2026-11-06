import { EmailType } from "./enums";
import { fullName } from "./format";
import { getZonedParts } from "./dates";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom (en línea)", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido (presencial y Zoom)" };
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

type EventLite = {
  title: string;
  description?: string | null;
  startAt: Date;
  modality: string;
  location?: string | null;
  zoomLink?: string | null;
};
type ContactLite = { firstName?: string | null; lastName?: string | null };

const GREEN = "#1a5c43";
const GREEN_DARK = "#174a37";
const GREEN_PANEL_BG = "#eff8f4";
const GREEN_PANEL_BORDER = "#d7efe3";

function formatLongDate(date: Date): string {
  const p = getZonedParts(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${p.day} de ${MONTHS[p.month - 1]}, ${p.year}`;
}

function formatTime(date: Date): string {
  const p = getZonedParts(date);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")} hrs`;
}

/** Convierte saltos de línea del texto libre en párrafos con buen formato, en vez de un bloque de texto plano. */
function formatDescription(text: string): string {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs
    .map((p) => `<p style="margin: 0 0 14px; font-size: 15px; line-height: 1.65; color: #334155;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function layout(bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f1f5f9; padding: 32px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="height: 6px; background: ${GREEN}; line-height: 6px; font-size: 0;">&nbsp;</div>
        <div style="padding: 36px 40px 40px;">
          <p style="margin: 0 0 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; color: ${GREEN}; text-transform: uppercase;">✦ Programa Vamos MiPYME</p>
          ${bodyHtml}
          <div style="height: 1px; background: #e2e8f0; margin: 24px 0 18px; line-height: 1px; font-size: 0;">&nbsp;</div>
          <p style="margin: 0; font-size: 11.5px; line-height: 1.6; color: #94a3b8;">
            Recibiste este correo porque tus datos forman parte de la base de contactos del Programa Vamos MiPYME de BancoEstado, recopilados a través de tu inscripción en actividades, formularios o bases de datos asociadas al programa. Si no deseas recibir más comunicaciones, escríbenos a <a href="mailto:vamosmipyme@emprendebancoestado.cl" style="color: #64748b;">vamosmipyme@emprendebancoestado.cl</a> y te daremos de baja.
          </p>
        </div>
      </div>
    </div>`;
}

function eventDateTimePanel(event: EventLite): string {
  const locationLine = event.modality === "PRESENCIAL" && event.location
    ? event.location
    : MODALITY_LABEL[event.modality] ?? event.modality;
  return `
    <div style="background: ${GREEN_PANEL_BG}; border: 1px solid ${GREEN_PANEL_BORDER}; border-radius: 12px; padding: 18px 20px; margin: 0 0 22px;">
      <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: ${GREEN_DARK};">📅 ${formatLongDate(event.startAt)}</p>
      <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: ${GREEN_DARK};">🕒 ${formatTime(event.startAt)}</p>
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${GREEN_DARK};">📍 ${locationLine}</p>
    </div>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display: inline-block; background: ${GREEN}; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold;">${label}</a>`;
}

function confirmNote(): string {
  return `<p style="margin: 14px 0 0; font-size: 12.5px; line-height: 1.55; color: #64748b;">ⓘ Al confirmar tu asistencia, te mostraremos de inmediato el enlace de conexión para unirte a la charla.</p>`;
}

export function buildEmail(
  type: EmailType,
  event: EventLite,
  contact: ContactLite,
  link: string
): { subject: string; html: string } {
  const name = fullName(contact);
  const titleHtml = `<h1 style="margin: 0 0 22px; font-family: Georgia, 'Times New Roman', Times, serif; font-weight: bold; font-size: 25px; line-height: 1.3; color: #0f172a;">${event.title}</h1>`;
  const descriptionHtml = event.description ? formatDescription(event.description) : "";

  if (type === EmailType.INVITACION) {
    return {
      subject: `Te invitamos a "${event.title}"`,
      html: layout(`
        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #475569;">El Programa Vamos MiPYME de BancoEstado tiene el agrado de invitarte a la charla:</p>
        ${titleHtml}
        ${eventDateTimePanel(event)}
        ${descriptionHtml}
        <p style="margin: 20px 0 16px; font-size: 15px; color: #0f172a;">Hola <strong>${name}</strong>, nos encantaría contar con tu participación. Confirma tu asistencia:</p>
        <p style="margin: 0;">${ctaButton(link, "Confirmar asistencia")}</p>
        ${confirmNote()}`),
    };
  }

  if (type === EmailType.RECORDATORIO) {
    return {
      subject: `Recordatorio: "${event.title}" se acerca`,
      html: layout(`
        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #475569;">Recordatorio del Programa Vamos MiPYME de BancoEstado:</p>
        ${titleHtml}
        ${eventDateTimePanel(event)}
        <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a;">Hola <strong>${name}</strong>, te recordamos que aún no has confirmado tu asistencia a esta actividad.</p>
        <p style="margin: 0;">${ctaButton(link, "Confirmar asistencia")}</p>
        ${confirmNote()}`),
    };
  }

  if (type === EmailType.REINSISTENCIA) {
    return {
      subject: `¿Nos acompañas en "${event.title}"?`,
      html: layout(`
        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #475569;">Del Programa Vamos MiPYME de BancoEstado:</p>
        ${titleHtml}
        ${eventDateTimePanel(event)}
        <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a;">Hola <strong>${name}</strong>, notamos que no has respondido nuestra invitación. Nos encantaría contar con tu presencia, aún estás a tiempo de confirmar:</p>
        <p style="margin: 0;">${ctaButton(link, "Confirmar asistencia")}</p>
        ${confirmNote()}`),
    };
  }

  // CONFIRMACION
  const zoomBlock = event.zoomLink
    ? `
      <div style="border: 1.5px solid ${GREEN}; border-radius: 12px; padding: 20px; margin: 0 0 18px;">
        <p style="margin: 0 0 12px; font-size: 15px; font-weight: bold; color: #0f172a;">🎥 Esta charla es por Zoom — únete con este enlace:</p>
        <p style="margin: 0 0 10px;">${ctaButton(event.zoomLink, "Ingresar a la reunión de Zoom →")}</p>
        <p style="margin: 0; font-size: 12px; color: #64748b; word-break: break-all;">O copia este enlace: ${event.zoomLink}</p>
      </div>
      <p style="margin: 0 0 20px; font-size: 12.5px; line-height: 1.55; color: #94a3b8;">ⓘ Recomendación: ingresa unos minutos antes para probar tu conexión de audio y video.</p>`
    : "";

  return {
    subject: `Confirmamos tu inscripción a "${event.title}"`,
    html: layout(`
      <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: #475569;">¡Tu inscripción quedó confirmada! Hola <strong>${name}</strong>, te esperamos en:</p>
      ${titleHtml}
      ${eventDateTimePanel(event)}
      ${zoomBlock}
      <p style="margin: 0;"><a href="${link}" style="font-size: 14px; font-weight: bold; color: ${GREEN}; text-decoration: none;">Ver detalle de la invitación →</a></p>`),
  };
}
