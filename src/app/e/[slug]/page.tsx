import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { RutInput } from "@/components/RutInput";
import { registerPublic } from "../actions";

export const dynamic = "force-dynamic";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom (online)", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido (presencial + online)" };

export default async function PublicEventPage({ params, searchParams }: { params: { slug: string }; searchParams: { ticket?: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event || event.status === "BORRADOR") notFound();

  const full = event.capacity ? event._count.registrations >= event.capacity : false;
  const action = registerPublic.bind(null, event.slug);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <p className="text-sm text-brand-600 font-medium">vamosmipyme.cl</p>
        <h1 className="text-3xl font-semibold">{event.title}</h1>
        <p className="text-slate-600">{event.description}</p>
        <div className="card p-4 text-sm space-y-1">
          <p>📅 {formatDateTime(event.startAt)}</p>
          <p>📍 {MODALITY_LABEL[event.modality]}{event.location ? ` · ${event.location}` : ""}</p>
          {event.topic && <p>🏷️ {event.topic}</p>}
          {event.capacity && <p>🎟️ Cupos: {event._count.registrations} / {event.capacity}</p>}
        </div>

        {searchParams.ticket ? (
          <div className="card p-6 bg-green-50 border-green-200 text-green-800 space-y-1">
            <p className="font-medium">¡Inscripción confirmada!</p>
            <p className="text-sm">Tu código de ticket es <span className="font-mono">{searchParams.ticket}</span>. Te contactaremos con los detalles de acceso.</p>
          </div>
        ) : event.status === "CANCELADO" ? (
          <div className="card p-6 bg-red-50 border-red-200 text-red-700">Este evento fue cancelado.</div>
        ) : full ? (
          <div className="card p-6 bg-amber-50 border-amber-200 text-amber-800">Se agotaron los cupos disponibles para este evento.</div>
        ) : (
          <form action={action} className="card p-6 space-y-4">
            <h2 className="font-medium">Inscríbete</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="firstName">Nombre</label>
                <input className="input" id="firstName" name="firstName" required />
              </div>
              <div>
                <label className="label" htmlFor="lastName">Apellido</label>
                <input className="input" id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="rut">RUT</label>
                <RutInput id="rut" name="rut" />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="phone">Teléfono</label>
                <input className="input" id="phone" name="phone" />
              </div>
              <div>
                <label className="label" htmlFor="companyName">Empresa</label>
                <input className="input" id="companyName" name="companyName" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Confirmar inscripción</button>
          </form>
        )}
      </div>
    </div>
  );
}
