import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Convocatorias · vamosmipyme.cl",
  description: "CRM + ticketera para la gestión de convocatorias y conocimiento 360° del cliente de vamosmipyme.cl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authed = await isValidSessionToken(cookies().get(SESSION_COOKIE)?.value);
  return (
    <html lang="es">
      <body>
        {authed && <Nav />}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
