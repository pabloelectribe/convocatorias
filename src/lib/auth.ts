export const SESSION_COOKIE = "cv_session";

const SECRET = process.env.AUTH_SECRET || "dev-secret-cambiar-en-produccion";

/**
 * Token de sesión estático derivado del secreto vía Web Crypto (compatible con el Edge
 * Runtime de middleware): no requiere almacenamiento de sesión (prototipo de un solo
 * usuario admin).
 */
export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(`authenticated:${SECRET}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await sessionToken();
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "vamosmipyme";
  return password === expected;
}
