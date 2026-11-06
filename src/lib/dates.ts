/** Intenta interpretar fechas en formatos comunes de exportaciones chilenas (DD-MM-YYYY, DD/MM/YYYY, ISO). */
export function parseFlexibleDate(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (dmy) {
    const [, d, m, y, h, min] = dmy;
    const date = new Date(Number(y), Number(m) - 1, Number(d), h ? Number(h) : 0, min ? Number(min) : 0);
    if (!isNaN(date.getTime())) return date;
  }

  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso;

  return null;
}

/** Descompone una fecha en los valores que esperan los selects de fecha/hora/minutos (24h, hora local). */
export function toDateTimeParts(date: Date | null | undefined): { date: string; hour: string; minute: string } {
  if (!date) return { date: "", hour: "09", minute: "00" };
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    hour: pad(date.getHours()),
    minute: pad(Math.round(date.getMinutes() / 15) * 15 === 60 ? 0 : Math.round(date.getMinutes() / 15) * 15),
  };
}
