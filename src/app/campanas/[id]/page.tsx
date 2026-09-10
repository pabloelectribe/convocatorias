import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, fullName } from "@/lib/format";
import { logTouchForSegment, logTouchForContact } from "../actions";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { touches: { include: { contact: true }, orderBy: { occurredAt: "desc" } } },
  });
  if (!campaign) notFound();

  const segments = await prisma.segment.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{campaign.name}</h1>
          <p className="text-sm text-slate-500">{campaign.medium}</p>
          {campaign.notes && <p className="text-sm text-slate-500 mt-1">{campaign.notes}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`/api/export/campanas/${campaign.id}`} className="btn-secondary">⬇ Descargar CSV</a>
          <Link href="/campanas" className="btn-secondary">← Volver</Link>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-2xl font-semibold">{campaign.touches.length}</p>
        <p className="text-sm text-slate-500">contactos tocados por esta campaña</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-medium mb-2">Registrar a un segmento completo</h2>
          <form action={logTouchForSegment.bind(null, campaign.id)} className="flex gap-2">
            <select className="input" name="segmentId" defaultValue="" required>
              <option value="" disabled>Seleccionar segmento...</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button className="btn-secondary shrink-0" type="submit">Registrar</button>
          </form>
        </div>
        <div className="card p-4">
          <h2 className="font-medium mb-2">Registrar contacto puntual</h2>
          <form action={logTouchForContact.bind(null, campaign.id)} className="flex gap-2">
            <input className="input" name="query" placeholder="RUT o email" />
            <button className="btn-secondary shrink-0" type="submit">Registrar</button>
          </form>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaign.touches.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/contactos/${t.contactId}`} className="font-medium text-brand-700 hover:underline">
                    {fullName(t.contact)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-500">{formatDateTime(t.occurredAt)}</td>
              </tr>
            ))}
            {campaign.touches.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">Todavía no se ha registrado a nadie.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
