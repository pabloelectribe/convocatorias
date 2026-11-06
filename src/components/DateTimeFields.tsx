const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function DateTimeFields({
  namePrefix,
  label,
  required,
  defaultDate,
  defaultHour,
  defaultMinute,
}: {
  namePrefix: string;
  label: string;
  required?: boolean;
  defaultDate?: string;
  defaultHour?: string;
  defaultMinute?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          name={`${namePrefix}Date`}
          type="date"
          required={required}
          defaultValue={defaultDate}
        />
        <select className="input w-24" name={`${namePrefix}Hour`} defaultValue={defaultHour ?? "09"} aria-label="Hora">
          {HOURS.map((h) => (
            <option key={h} value={h}>{h} h</option>
          ))}
        </select>
        <select className="input w-24" name={`${namePrefix}Minute`} defaultValue={defaultMinute ?? "00"} aria-label="Minutos">
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m} min</option>
          ))}
        </select>
      </div>
    </div>
  );
}
