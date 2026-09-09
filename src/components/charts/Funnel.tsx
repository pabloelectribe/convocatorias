import { SEQUENTIAL_BLUE } from "@/lib/chart-colors";

export interface FunnelStage {
  label: string;
  value: number;
}

const STEP_COLORS = [SEQUENTIAL_BLUE.light, SEQUENTIAL_BLUE.mid, SEQUENTIAL_BLUE.dark];
const MIN_WIDTH_PCT = 28;

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const base = stages[0]?.value || 0;

  return (
    <div className="max-w-xs mx-auto">
      {stages.map((stage, i) => {
        const rawPct = base > 0 ? (stage.value / base) * 100 : 0;
        const widthPct = stage.value > 0 ? Math.max(rawPct, MIN_WIDTH_PCT) : 0;
        const color = STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)];
        const isLightStep = color === SEQUENTIAL_BLUE.light;
        const prev = stages[i - 1];
        const conversionFromPrev = prev && prev.value > 0 ? Math.round((stage.value / prev.value) * 100) : null;

        return (
          <div key={stage.label}>
            {i > 0 && (
              <p className="text-center text-xs text-slate-400 py-1">
                ↓ {conversionFromPrev}% de &ldquo;{prev!.label}&rdquo;
              </p>
            )}
            <div
              className="mx-auto flex items-center justify-center h-12 px-3 transition-[width]"
              style={{
                width: `${widthPct}%`,
                minWidth: "88px",
                backgroundColor: color,
                borderRadius: i === 0 ? "10px 10px 2px 2px" : i === stages.length - 1 ? "2px 2px 10px 10px" : "2px",
              }}
              title={`${stage.label}: ${stage.value}`}
            >
              <span className={`text-sm font-medium truncate ${isLightStep ? "text-slate-900" : "text-white"}`}>
                {stage.label} · {stage.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
