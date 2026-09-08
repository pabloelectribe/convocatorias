import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContactosPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const contacts = await prisma.contact.findMany({
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
    include: { channel: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Contactos</h1>
          <p className="text-sm text-slate-500">Base de clientes y prospectos (CRM 360°).</p>
        </div>
        <Link href="/contactos/nuevo" className="btn-primary">+ Nuevo contacto</Link>
      </div>

      <form className="flex gap-2">
        <input className="input max-w-sm" type="text" name="q" placeholder="Buscar por nombre, RUT, email o empresa..." defaultValue={q} />
        <button className="btn-secondary" type="submit">Buscar</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">RUT</th>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Canal</th>
              <th className="px-4 py-2 font-medium">Temas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/contactos/${c.id}`} className="font-medium text-brand-700 hover:underline">
                    {fullName(c)}
                  </Link>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>
                <td className="px-4 py-2 text-slate-600">{c.rut || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{c.companyName || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{c.channel?.name || "—"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span key={t.tagId} className="badge bg-brand-50 text-brand-700">{t.tag.name}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Sin resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
