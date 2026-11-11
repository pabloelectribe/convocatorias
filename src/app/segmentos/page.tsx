import { prisma } from "@/lib/prisma";
import { createSegment } from "./actions";
import { SegmentsList } from "./SegmentsList";

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
        <div className="md:col-span-2">
          <SegmentsList segments={segments.map((s) => ({ id: s.id, name: s.name, description: s.description, memberCount: s._count.members }))} />
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
