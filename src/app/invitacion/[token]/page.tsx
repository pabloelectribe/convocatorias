import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fullName, formatLongDate, formatEventTime } from "@/lib/format";
import { respondInvitation } from "../actions";

export const dynamic = "force-dynamic";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom (en línea)", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido (presencial y Zoom)" };

export default async function InvitacionPage({ params }: { params: { token: string } }) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: { event: true, contact: true },
  });
  if (!invitation) notFound();

  const registration = await prisma.registration.findUnique({
    where: { eventId_contactId: { eventId: invitation.eventId, contactId: invitation.contactId } },
  });

  const confirmAction = respondInvitation.bind(null, params.token, "confirm");
  const declineAction = respondInvitation.bind(null, params.token, "decline");
  const confirmed = invitation.status === "REGISTRADA" || !!registration;
  const event = invitation.event;
  const locationLine = event.modality === "PRESENCIAL" && event.location ? event.location : MODALITY_LABEL[event.modality] ?? event.modality;

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-100 px-4 py-12">
      <div className="card max-w-lg w-full overflow-hidden">
        <div className="h-1.5 bg-brand-700" />
        <div className="p-10 space-y-5">
          <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">✦ Programa Vamos MiPYME</p>

          <p className="text-sm leading-relaxed text-slate-600">
            El Programa Vamos MiPYME de BancoEstado tiene el agrado de invitarte a la charla:
          </p>

          <h1 className="font-serif font-bold text-[1.6rem] leading-tight text-slate-900">{event.title}</h1>

          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 space-y-2.5">
            <p className="text-lg font-bold text-brand-800">📅 {formatLongDate(event.startAt)}</p>
            <p className="text-lg font-bold text-brand-800">🕒 {formatEventTime(event.startAt)}</p>
            <p className="text-lg font-bold text-brand-800">📍 {locationLine}</p>
          </div>

          {event.description && (
            <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">{event.description}</p>
          )}

          <p className="text-sm text-slate-900">
            Hola <strong>{fullName(invitation.contact)}</strong>, {confirmed ? "nos alegra que vengas." : "confirma tu asistencia:"}
          </p>

          {confirmed ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-3">
              <p className="text-sm font-semibold text-brand-800">✅ Ya confirmaste tu inscripción. Te esperamos.</p>
              {registration && <p className="font-mono text-xs text-brand-700">Código de ticket: {registration.ticketCode}</p>}
              {event.zoomLink && (
                <div className="pt-1 space-y-2">
                  <a
                    href={event.zoomLink}
                    target="_blank"
                    className="btn-primary w-full justify-center"
                  >
                    Ingresar a la reunión de Zoom →
                  </a>
                  <p className="text-xs text-slate-500 break-all">O copia este enlace: {event.zoomLink}</p>
                </div>
              )}
            </div>
          ) : invitation.status === "DECLINADA" ? (
            <div className="rounded-xl bg-slate-100 text-slate-600 p-4 text-sm">Has declinado esta invitación.</div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-3">
                <form action={confirmAction}>
                  <button className="btn-primary" type="submit">Confirmar asistencia</button>
                </form>
                <form action={declineAction}>
                  <button className="btn-secondary" type="submit">No podré asistir</button>
                </form>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                ⓘ Al confirmar tu asistencia, te mostraremos de inmediato el enlace de conexión para unirte a la charla.
              </p>
            </div>
          )}

          <div className="h-px bg-slate-200" />

          <p className="text-[11.5px] leading-relaxed text-slate-400">
            Recibiste esta invitación porque tus datos forman parte de la base de contactos del Programa Vamos MiPYME de
            BancoEstado, recopilados a través de tu inscripción en actividades, formularios o bases de datos asociadas al
            programa. Si no deseas recibir más comunicaciones, escríbenos a{" "}
            <a href="mailto:vamosmipyme@emprendebancoestado.cl" className="text-slate-500 underline">
              vamosmipyme@emprendebancoestado.cl
            </a>{" "}
            y te daremos de baja.
          </p>
        </div>
      </div>
    </div>
  );
}
