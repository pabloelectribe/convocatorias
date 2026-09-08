import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODALITY_COLOR: Record<string, string> = {
  ZOOM: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  PRESENCIAL: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  HIBRIDO: "bg-teal-100 text-teal-700 hover:bg-teal-200",
};

const MODALITY_DOT: Record<string, string> = {
  ZOOM: "bg-blue-500",
  PRESENCIAL: "bg-purple-500",
  HIBRIDO: "bg-teal-500",
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function localDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function cellKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default async function CalendarioEventosPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const now = new Date();
  const todayKey = localDateKey(now);

  const year = parseInt(searchParams.year || "") || now.getFullYear();
  const month = parseInt(searchParams.month || "") || now.getMonth() + 1; // 1-12

  const events = await prisma.event.findMany({ orderBy: { startAt: "asc" } });

  const eventsByDay = new Map<string, typeof events>();
  for (const e of events) {
    const key = localDateKey(e.startAt);
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(e);
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekdaySun0 = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Dom..6=Sáb
  const leadingBlanks = (firstWeekdaySun0 + 6) % 7; // 0=Lun

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ day: null, key: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: cellKey(year, month, d) });
  while (cells.length % 7 !== 0) cells.push({ day: null, key: null });

  const monthLabel = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "America/Santiago" }).format(
    new Date(Date.UTC(year, month - 1, 15))
  );

  function monthLink(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    return `/eventos/calendario?year=${y}&month=${m}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Calendario de convocatorias</h1>
          <p className="text-sm text-slate-500">Eventos pasados y próximos del mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/eventos" className="btn-secondary">Ver lista</Link>
          <Link href={monthLink(-1)} className="btn-secondary">← Anterior</Link>
          <Link href="/eventos/calendario" className="btn-secondary">Hoy</Link>
          <Link href={monthLink(1)} className="btn-secondary">Siguiente →</Link>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold capitalize mb-4">{monthLabel}</h2>

        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden text-sm">
          {WEEKDAYS.map((w) => (
            <div key={w} className="bg-slate-50 text-slate-500 font-medium px-2 py-1 text-center">{w}</div>
          ))}
          {cells.map((cell, i) => {
            const dayEvents = cell.key ? eventsByDay.get(cell.key) || [] : [];
            const isToday = cell.key === todayKey;
            return (
              <div
                key={i}
                className={`bg-white min-h-[100px] p-1.5 align-top ${cell.day === null ? "bg-slate-50" : ""}`}
              >
                {cell.day !== null && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        isToday ? "bg-brand-600 text-white" : "text-slate-500"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((e) => (
                        <Link
                          key={e.id}
                          href={`/eventos/${e.id}`}
                          className={`block truncate rounded px-1.5 py-0.5 text-xs ${MODALITY_COLOR[e.modality] || "bg-slate-100 text-slate-700"}`}
                          title={e.title}
                        >
                          {e.title}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          {Object.entries(MODALITY_DOT).map(([mod, dot]) => (
            <span key={mod} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              {mod === "ZOOM" ? "Zoom" : mod === "PRESENCIAL" ? "Presencial" : "Híbrido"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
