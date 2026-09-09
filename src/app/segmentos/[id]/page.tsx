import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fullName, rutDisplay } from "@/lib/format";
import { addMemberByRutOrEmail, removeMember } from "../actions";

export const dynamic = "force-dynamic";

export default async function SegmentDetailPage({ params }: { params: { id: string } }) {
  const segment = await prisma.segment.findUnique({
    where: { id: params.id },
    include: { members: { include: { contact: true } } },
  });
  if (!segment) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{segment.name}</h1>
          <p className="text-sm text-slate-500">{segment.description}</p>
        </div>
        <Link href="/segmentos" className="btn-secondary">← Volver</Link>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-2">Agregar contacto por RUT o email</h2>
        <form action={addMemberByRutOrEmail.bind(null, segment.id)} className="flex gap-2 max-w-md">
          <input className="input" name="query" placeholder="12.345.678-9 o correo@ejemplo.cl" />
          <button className="btn-secondary" type="submit">Agregar</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">RUT</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {segment.members.map((m) => (
              <tr key={m.contactId} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/contactos/${m.contact.id}`} className="font-medium text-brand-700 hover:underline">
                    {fullName(m.contact)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{rutDisplay(m.contact.rut)}</td>
                <td className="px-4 py-2 text-slate-600">{m.contact.email || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{m.contact.companyName || "—"}</td>
                <td className="px-4 py-2 text-right">
                  <form action={removeMember.bind(null, segment.id, m.contactId)}>
                    <button className="text-xs text-slate-400 hover:text-red-600">Quitar</button>
                  </form>
                </td>
              </tr>
            ))}
            {segment.members.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Este segmento no tiene contactos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
