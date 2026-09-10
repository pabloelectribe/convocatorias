import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CAMPAIGN_MEDIUMS } from "@/lib/timeline";
import { createCampaign } from "./actions";

export const dynamic = "force-dynamic";

export default async function CampanasPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { _count: { select: { touches: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Campañas</h1>
          <p className="text-sm text-slate-500">
            Contacto por email, WhatsApp, redes sociales, etc. (fuera de las convocatorias formales). Cuenta cuántas
            veces y cuándo se tocó a cada cliente por cada medio.
          </p>
        </div>
        <a href="/api/export/campanas" className="btn-secondary shrink-0">⬇ Descargar CSV</a>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card divide-y divide-slate-100">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campanas/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="font-medium text-brand-700">{c.name}</p>
                <p className="text-sm text-slate-500">{c.medium} · {formatDate(c.createdAt)}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{c._count.touches} contactos</span>
            </Link>
          ))}
          {campaigns.length === 0 && <p className="px-4 py-8 text-center text-slate-400">Aún no hay campañas.</p>}
        </div>

        <form action={createCampaign} className="card p-4 space-y-3 h-fit">
          <h2 className="font-medium">Nueva campaña</h2>
          <div>
            <label className="label" htmlFor="name">Nombre</label>
            <input className="input" id="name" name="name" placeholder="Ej: Newsletter agosto 2026" required />
          </div>
          <div>
            <label className="label" htmlFor="medium">Medio</label>
            <select className="input" id="medium" name="medium" defaultValue="" required>
              <option value="" disabled>Seleccionar...</option>
              {CAMPAIGN_MEDIUMS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="notes">Notas (opcional)</label>
            <textarea className="input" id="notes" name="notes" rows={3} />
          </div>
          <button className="btn-primary w-full" type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
}
