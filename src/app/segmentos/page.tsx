import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSegment } from "./actions";

export const dynamic = "force-dynamic";

export default async function SegmentosPage() {
  const segments = await prisma.segment.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Segmentos</h1>
        <p className="text-sm text-slate-500">Listas de clientes para invitar a convocatorias.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card divide-y divide-slate-100">
          {segments.map((s) => (
            <Link key={s.id} href={`/segmentos/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="font-medium text-brand-700">{s.name}</p>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{s._count.members} contactos</span>
            </Link>
          ))}
          {segments.length === 0 && <p className="px-4 py-8 text-center text-slate-400">Aún no hay segmentos.</p>}
        </div>

        <form action={createSegment} className="card p-4 space-y-3 h-fit">
          <h2 className="font-medium">Crear segmento</h2>
          <div>
            <label className="label" htmlFor="name">Nombre</label>
            <input className="input" id="name" name="name" required />
          </div>
          <div>
            <label className="label" htmlFor="description">Descripción</label>
            <textarea className="input" id="description" name="description" rows={3} />
          </div>
          <button className="btn-primary w-full" type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
}
