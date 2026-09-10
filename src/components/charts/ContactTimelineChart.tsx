import { TIMELINE_LABEL, TIMELINE_DOT_CLASS } from "@/lib/timeline";

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  occurredAt: Date | string;
  event?: { title: string } | null;
}

function monthKey(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit" }).format(new Date(date));
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "America/Santiago" }).format(
    new Date(Date.UTC(year, month - 1, 15))
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  }).format(new Date(date));
}

function detail(a: Activity): string | null {
  if (a.event) return a.event.title;
  if (a.type === "NOTE" && a.description) return a.description;
  return null;
}

/** Línea de tiempo visual por contacto: un renglón por hito, agrupado por mes (eje vertical año/mes), ordenado cronológicamente. */
export function ContactTimelineChart({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-400">Sin actividad registrada todavía.</p>;
  }

  const months = new Map<string, Activity[]>();
  for (const a of activities) {
    const key = monthKey(a.occurredAt);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(a);
  }
  // El arreglo ya viene ordenado desc (más reciente primero, tanto entre meses como dentro de cada mes).
  const rows = Array.from(months.entries());

  return (
    <div className="relative pl-5">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-4">
        {rows.map(([key, events]) => (
          <div key={key} className="relative">
            <span className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white" />
            <p className="text-xs font-medium text-slate-500 mb-1.5">{monthLabel(key)}</p>
            <ul className="space-y-1">
              {events.map((e) => {
                const extra = detail(e);
                return (
                  <li key={e.id} className="flex items-baseline gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${TIMELINE_DOT_CLASS[e.type] || "bg-slate-400"}`} />
                    <span className="font-medium text-slate-600 shrink-0">{TIMELINE_LABEL[e.type] || e.type}</span>
                    {extra && <span className="text-slate-400 truncate">{extra}</span>}
                    <span className="text-slate-300 ml-auto shrink-0 tabular-nums">{dayTime(e.occurredAt)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
