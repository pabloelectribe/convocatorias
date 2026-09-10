import { TIMELINE_LABEL, TIMELINE_DOT_CLASS } from "@/lib/timeline";

interface Activity {
  id: string;
  type: string;
  title: string;
  occurredAt: Date | string;
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

/** Línea de tiempo visual por contacto: un punto por hito, agrupado por mes (eje vertical año/mes). */
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
  // El arreglo ya viene ordenado desc (más reciente primero); Map conserva el orden de inserción.
  const rows = Array.from(months.entries());

  return (
    <div className="relative pl-5">
      <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-slate-200" />
      <div className="space-y-4">
        {rows.map(([key, events]) => (
          <div key={key} className="relative">
            <span className="absolute -left-3.5 top-0.5 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white" />
            <p className="text-xs font-medium text-slate-500 mb-1.5">{monthLabel(key)}</p>
            <div className="flex flex-wrap gap-1.5">
              {events.map((e) => (
                <span
                  key={e.id}
                  title={`${TIMELINE_LABEL[e.type] || e.type}: ${e.title}`}
                  className={`w-3.5 h-3.5 rounded-full ${TIMELINE_DOT_CLASS[e.type] || "bg-slate-400"}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
