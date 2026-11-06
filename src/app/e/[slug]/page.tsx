import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLongDate, formatEventTime } from "@/lib/format";
import { RutInput } from "@/components/RutInput";
import { registerPublic } from "../actions";

export const dynamic = "force-dynamic";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom (en línea)", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido (presencial y Zoom)" };

export default async function PublicEventPage({ params, searchParams }: { params: { slug: string }; searchParams: { ticket?: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event || event.status === "BORRADOR") notFound();

  const full = event.capacity ? event._count.registrations >= event.capacity : false;
  const action = registerPublic.bind(null, event.slug);
  const locationLine = event.modality === "PRESENCIAL" && event.location ? event.location : MODALITY_LABEL[event.modality] ?? event.modality;

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-100 px-4 py-12">
      <div className="card max-w-lg w-full overflow-hidden">
        <div className="h-1.5 bg-brand-700" />
        <div className="p-10 space-y-5">
          <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">✦ Programa Vamos MiPYME</p>

          <h1 className="font-serif font-bold text-[1.6rem] leading-tight text-slate-900">{event.title}</h1>

          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 space-y-2.5">
            <p className="text-lg font-bold text-brand-800">📅 {formatLongDate(event.startAt)}</p>
            <p className="text-lg font-bold text-brand-800">🕒 {formatEventTime(event.startAt)}</p>
            <p className="text-lg font-bold text-brand-800">📍 {locationLine}</p>
            {event.topic && <p className="text-sm font-semibold text-brand-700">🏷️ {event.topic}</p>}
            {event.capacity && <p className="text-sm font-semibold text-brand-700">🎟️ Cupos: {event._count.registrations} / {event.capacity}</p>}
          </div>

          {event.description && (
            <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">{event.description}</p>
          )}

          {searchParams.ticket ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-1">
              <p className="text-sm font-semibold text-brand-800">✅ ¡Inscripción confirmada!</p>
              <p className="text-sm text-brand-700">
                Tu código de ticket es <span className="font-mono">{searchParams.ticket}</span>. Te contactaremos con los detalles de acceso.
              </p>
            </div>
          ) : event.status === "CANCELADO" ? (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm">Este evento fue cancelado.</div>
          ) : full ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm">Se agotaron los cupos disponibles para este evento.</div>
          ) : (
            <form action={action} className="space-y-4">
              <p className="text-sm font-semibold text-slate-900">Inscríbete:</p>
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
    </div>
  );
}
