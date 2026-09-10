import { TIMELINE_LABEL, TIMELINE_HEX, TIMELINE_TYPES_ORDERED } from "@/lib/timeline";

export interface MonthRow {
  key: string; // YYYY-MM
  counts: Record<string, number>;
}

const CONTAINER_HEIGHT = 200;

function shortMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-CL", { month: "short", year: "2-digit", timeZone: "America/Santiago" }).format(
    new Date(Date.UTC(year, month - 1, 15))
  );
  return label.replace(".", "");
}

export function MonthlyStackedBars({ months }: { months: MonthRow[] }) {
  if (months.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no hay actividad registrada.</p>;
  }

  const totals = months.map((m) => Object.values(m.counts).reduce((a, b) => a + b, 0));
  const maxTotal = Math.max(...totals, 1);
  const typesPresent = TIMELINE_TYPES_ORDERED.filter((t) => months.some((m) => (m.counts[t] || 0) > 0));

  return (
    <div>
      {/* +32px de aire arriba para que el tooltip no se corte con el scroll horizontal */}
      <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ height: CONTAINER_HEIGHT + 24 + 32 }}>
        {months.map((m) => {
          return (
            <div key={m.key} className="flex flex-col items-center gap-1 shrink-0" style={{ width: 28 }}>
              <div className="flex flex-col-reverse justify-start" style={{ height: CONTAINER_HEIGHT, width: 20 }}>
                {TIMELINE_TYPES_ORDERED.map((t) => {
                  const count = m.counts[t] || 0;
                  if (count === 0) return null;
                  const height = Math.max((count / maxTotal) * CONTAINER_HEIGHT, 2);
                  return (
                    <div key={t} className="relative group focus-within:z-10 hover:z-10" style={{ height }}>
                      <div
                        tabIndex={0}
                        aria-label={`${TIMELINE_LABEL[t]}: ${count} en ${shortMonthLabel(m.key)}`}
                        className="w-full h-full outline-none"
                        style={{ backgroundColor: TIMELINE_HEX[t] }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block group-focus-within:block whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg z-20">
                        {TIMELINE_LABEL[t]}: {count}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{shortMonthLabel(m.key)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100">
        {typesPresent.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIMELINE_HEX[t] }} />
            {TIMELINE_LABEL[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
