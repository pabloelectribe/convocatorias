import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContactsTable } from "./ContactsTable";

export const dynamic = "force-dynamic";

export default async function ContactosPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const [contacts, segments] = await Promise.all([
    prisma.contact.findMany({
      where: q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
              { rut: { contains: q } },
              { companyName: { contains: q } },
            ],
          }
        : undefined,
      include: { channel: true, tags: { include: { tag: true } }, segments: { include: { segment: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.segment.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Contactos</h1>
          <p className="text-sm text-slate-500">Base de clientes y prospectos (CRM 360°).</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`/api/export/contactos${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="btn-secondary">⬇ Descargar CSV</a>
          <Link href="/contactos/nuevo" className="btn-primary">+ Nuevo contacto</Link>
        </div>
      </div>

      <form className="flex gap-2">
        <input className="input max-w-sm" type="text" name="q" placeholder="Buscar por nombre, RUT, email o empresa..." defaultValue={q} />
        <button className="btn-secondary" type="submit">Buscar</button>
      </form>

      <ContactsTable contacts={contacts} segments={segments} />
    </div>
  );
}
