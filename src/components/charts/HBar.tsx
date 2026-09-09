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
    <div className="flex items-center gap-3" title={`${label}: ${valueLabel ?? value}`}>
      <span className="w-32 shrink-0 truncate text-sm text-slate-600">{label}</span>
      <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-sm font-medium text-slate-700 tabular-nums">
        {valueLabel ?? value}
      </span>
    </div>
  );
}
