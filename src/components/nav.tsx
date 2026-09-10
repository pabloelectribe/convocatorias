"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Panel" },
  { href: "/contactos", label: "Contactos" },
  { href: "/canales", label: "Canales" },
  { href: "/segmentos", label: "Segmentos" },
  { href: "/eventos", label: "Eventos" },
  { href: "/actividad", label: "Actividad" },
  { href: "/importar", label: "Importar CSV" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-brand-700">
              Convocatorias · vamosmipyme.cl
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {LINKS.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-slate-500 hover:text-slate-800">Cerrar sesión</button>
          </form>
        </div>
      </div>
    </header>
  );
}
