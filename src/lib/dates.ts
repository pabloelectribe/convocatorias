const APP_TIMEZONE = "America/Santiago";

/**
 * El servidor (Vercel) corre en UTC, pero todas las fechas/horas que ingresa o lee el
 * usuario son hora de Chile. Estas dos funciones convierten entre "hora de pared en
 * Santiago" y el instante UTC real que corresponde, sin asumir un offset fijo (Chile
 * cambia de horario de verano/invierno).
 */
function getZonedOffsetMs(utcGuess: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(utcGuess).map((p) => [p.type, p.value]));
  const hour = parts.hour === "24" ? "0" : parts.hour;
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return utcGuess.getTime() - asIfUtc;
}

/** Convierte una hora de pared (año, mes, día, hora, minuto en Chile) al instante UTC real. */
export function zonedTimeToUtc(y: number, m: number, d: number, hour: number, minute: number, timeZone = APP_TIMEZONE): Date {
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute));
  const offset = getZonedOffsetMs(guess, timeZone);
  return new Date(guess.getTime() + offset);
}

/** Descompone un instante (Date/UTC) en los componentes de hora de pared en Chile. */
export function getZonedParts(date: Date, timeZone = APP_TIMEZONE): { year: number; month: number; day: number; hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** Intenta interpretar fechas en formatos comunes de exportaciones chilenas (DD-MM-YYYY, DD/MM/YYYY, ISO). */
export function parseFlexibleDate(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (dmy) {
    const [, d, m, y, h, min] = dmy;
    const date = zonedTimeToUtc(Number(y), Number(m), Number(d), h ? Number(h) : 0, min ? Number(min) : 0);
    if (!isNaN(date.getTime())) return date;
  }

  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso;

  return null;
}

/** Descompone una fecha en los valores que esperan los selects de fecha/hora/minutos (24h, hora de Chile). */
export function toDateTimeParts(date: Date | null | undefined): { date: string; hour: string; minute: string } {
  if (!date) return { date: "", hour: "09", minute: "00" };
  const pad = (n: number) => n.toString().padStart(2, "0");
  const p = getZonedParts(date);
  const roundedMinute = Math.round(p.minute / 15) * 15;
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    hour: pad(p.hour),
    minute: pad(roundedMinute === 60 ? 0 : roundedMinute),
  };
}
