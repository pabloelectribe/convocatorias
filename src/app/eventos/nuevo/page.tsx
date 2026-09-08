import { createEvent } from "../actions";

export default function NuevoEventoPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo evento</h1>
      <form action={createEvent} className="card p-4 space-y-4">
        <div>
          <label className="label" htmlFor="title">Título</label>
          <input className="input" id="title" name="title" required />
        </div>
        <div>
          <label className="label" htmlFor="description">Descripción</label>
          <textarea className="input" id="description" name="description" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="topic">Temática</label>
            <input className="input" id="topic" name="topic" placeholder="Ej: Marketing digital" />
          </div>
          <div>
            <label className="label" htmlFor="modality">Modalidad</label>
            <select className="input" id="modality" name="modality" defaultValue="ZOOM">
              <option value="ZOOM">Zoom</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="startAt">Fecha y hora de inicio</label>
            <input className="input" id="startAt" name="startAt" type="datetime-local" required />
          </div>
          <div>
            <label className="label" htmlFor="endAt">Fecha y hora de término</label>
            <input className="input" id="endAt" name="endAt" type="datetime-local" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Lugar (si es presencial/híbrido)</label>
          <input className="input" id="location" name="location" />
        </div>
        <div>
          <label className="label" htmlFor="zoomLink">Enlace de Zoom (si aplica)</label>
          <input className="input" id="zoomLink" name="zoomLink" placeholder="https://zoom.us/j/..." />
        </div>
        <div>
          <label className="label" htmlFor="capacity">Capacidad (opcional)</label>
          <input className="input" id="capacity" name="capacity" type="number" min={1} />
        </div>
        <button type="submit" className="btn-primary">Crear evento</button>
      </form>
    </div>
  );
}
