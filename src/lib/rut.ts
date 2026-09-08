/** Utilidades para RUT chileno: normalización, formato y validación de dígito verificador. */

/** Deja solo dígitos y K/k, sin puntos ni guión, en mayúscula. Ej: "12.345.678-K" -> "12345678K" */
export function normalizeRut(raw: string): string {
  return raw.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Formatea a "12.345.678-K" a partir de cualquier entrada. */
export function formatRut(raw: string): string {
  const clean = normalizeRut(raw);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

/** Calcula el dígito verificador (algoritmo módulo 11) para el cuerpo numérico de un RUT. */
function computeDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/** Valida que el RUT tenga un dígito verificador correcto. */
export function isValidRut(raw: string): boolean {
  const clean = normalizeRut(raw);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeDv(body) === dv;
}
