import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventForm } from "../../EventForm";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarEventoPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar evento</h1>
        <Link href={`/eventos/${event.id}`} className="btn-secondary">← Volver</Link>
      </div>
      <EventForm action={updateEvent.bind(null, event.id)} submitLabel="Guardar cambios" values={event} />
    </div>
  );
}
