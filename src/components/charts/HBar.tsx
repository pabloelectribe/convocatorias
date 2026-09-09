export function HBar({
  label,
  value,
  max,
  color,
  valueLabel,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  valueLabel?: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div title={`${label}: ${valueLabel ?? value}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-sm text-slate-600 truncate">{label}</span>
        <span className="text-sm font-medium text-slate-700 tabular-nums shrink-0">{valueLabel ?? value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
