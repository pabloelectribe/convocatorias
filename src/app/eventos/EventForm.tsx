import { DateTimeFields } from "@/components/DateTimeFields";
import { toDateTimeParts } from "@/lib/dates";

type EventValues = {
  title: string;
  description: string | null;
  topic: string | null;
  modality: string;
  location: string | null;
  zoomLink: string | null;
  startAt: Date;
  endAt: Date | null;
  capacity: number | null;
};

export function EventForm({
  action,
  submitLabel,
  values,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  values?: EventValues;
}) {
  const start = toDateTimeParts(values?.startAt);
  const end = toDateTimeParts(values?.endAt);

  return (
    <form action={action} className="card p-4 space-y-4">
      <div>
        <label className="label" htmlFor="title">Título</label>
        <input className="input" id="title" name="title" defaultValue={values?.title} required />
      </div>
      <div>
        <label className="label" htmlFor="description">Descripción</label>
        <textarea className="input" id="description" name="description" rows={3} defaultValue={values?.description ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="topic">Temática</label>
          <input className="input" id="topic" name="topic" placeholder="Ej: Marketing digital" defaultValue={values?.topic ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="modality">Modalidad</label>
          <select className="input" id="modality" name="modality" defaultValue={values?.modality ?? "ZOOM"}>
            <option value="ZOOM">Zoom</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <DateTimeFields
          namePrefix="start"
          label="Fecha y hora de inicio"
          required
          defaultDate={start.date}
          defaultHour={start.hour}
          defaultMinute={start.minute}
        />
        <DateTimeFields
          namePrefix="end"
          label="Fecha y hora de término (opcional)"
          defaultDate={end.date}
          defaultHour={end.hour}
          defaultMinute={end.minute}
        />
      </div>
      <div>
        <label className="label" htmlFor="location">Lugar (si es presencial/híbrido)</label>
        <input className="input" id="location" name="location" defaultValue={values?.location ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="zoomLink">Enlace de Zoom (si aplica)</label>
        <input className="input" id="zoomLink" name="zoomLink" placeholder="https://zoom.us/j/..." defaultValue={values?.zoomLink ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="capacity">Capacidad (opcional)</label>
        <input className="input" id="capacity" name="capacity" type="number" min={1} defaultValue={values?.capacity ?? ""} />
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
