import { formatRut } from "./rut";
import { getZonedParts } from "./dates";

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Fecha larga en español, hora de Chile (ej: "Martes 10 de noviembre, 2026"). Usada en correos y páginas de evento. */
export function formatLongDate(date: Date): string {
  const p = getZonedParts(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${p.day} de ${MONTHS[p.month - 1]}, ${p.year}`;
}

/** Hora en 24h, hora de Chile (ej: "15:30 hrs"). */
export function formatEventTime(date: Date): string {
  const p = getZonedParts(date);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")} hrs`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(d);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone: "America/Santiago",
  }).format(d);
}

export function fullName(contact: { firstName?: string | null; lastName?: string | null }): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "(sin nombre)";
}

export function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function rutDisplay(rut?: string | null): string {
  if (!rut) return "—";
  return formatRut(rut);
}
