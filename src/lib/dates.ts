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
