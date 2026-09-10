import { prisma } from "@/lib/prisma";
import { MonthlyStackedBars, type MonthRow } from "@/components/charts/MonthlyStackedBars";

export const dynamic = "force-dynamic";

function monthKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit" }).format(date);
}

export default async function ActividadPage() {
  const events = await prisma.timelineEvent.findMany({ select: { occurredAt: true, type: true } });

  const byMonth = new Map<string, Record<string, number>>();
  for (const e of events) {
    const key = monthKey(e.occurredAt);
    if (!byMonth.has(key)) byMonth.set(key, {});
    const row = byMonth.get(key)!;
    row[e.type] = (row[e.type] || 0) + 1;
  }
  const months: MonthRow[] = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, counts]) => ({ key, counts }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Actividad</h1>
          <p className="text-sm text-slate-500">
            Todos los puntos de contacto de la base (creaciones, importaciones, invitaciones, inscripciones,
            asistencias y notas), mes a mes, para ver cuándo hay más movimiento.
          </p>
        </div>
        <a href="/api/export/actividad" className="btn-secondary shrink-0">⬇ Descargar CSV</a>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-1">Puntos de contacto por mes</h2>
        <p className="text-xs text-slate-400 mb-4">Total histórico, apilado por tipo de hito.</p>
        <MonthlyStackedBars months={months} />
      </div>
    </div>
  );
}
