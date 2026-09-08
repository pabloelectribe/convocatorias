import { formatRut } from "./rut";

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
