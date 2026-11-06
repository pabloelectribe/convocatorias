import { createEvent } from "../actions";
import { EventForm } from "../EventForm";

export default function NuevoEventoPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo evento</h1>
      <EventForm action={createEvent} submitLabel="Crear evento" />
    </div>
  );
}
