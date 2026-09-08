import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, fullName } from "@/lib/format";
import { respondInvitation } from "../actions";

export const dynamic = "force-dynamic";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido" };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-lg w-full p-6 space-y-4">
        <p className="text-sm text-brand-600 font-medium">vamosmipyme.cl te invita</p>
        <h1 className="text-2xl font-semibold">{invitation.event.title}</h1>
        <p className="text-slate-600">{invitation.event.description}</p>
        <div className="text-sm text-slate-500 space-y-1">
          <p>📅 {formatDateTime(invitation.event.startAt)}</p>
          <p>📍 {MODALITY_LABEL[invitation.event.modality]}{invitation.event.location ? ` · ${invitation.event.location}` : ""}</p>
        </div>

        <p className="text-sm">Hola <strong>{fullName(invitation.contact)}</strong>, confirma tu asistencia:</p>

        {invitation.status === "REGISTRADA" || registration ? (
          <div className="rounded-md bg-green-50 text-green-700 p-4 text-sm">
            ✅ Ya confirmaste tu inscripción.
            {registration && <p className="mt-1 font-mono text-xs">Código de ticket: {registration.ticketCode}</p>}
            {invitation.event.modality !== "PRESENCIAL" && invitation.event.zoomLink && (
              <p className="mt-2">Enlace de acceso: <a className="underline" href={invitation.event.zoomLink}>{invitation.event.zoomLink}</a></p>
            )}
          </div>
        ) : invitation.status === "DECLINADA" ? (
          <div className="rounded-md bg-slate-100 text-slate-600 p-4 text-sm">Has declinado esta invitación.</div>
        ) : (
          <div className="flex gap-3">
            <form action={confirmAction}>
              <button className="btn-primary" type="submit">Confirmar asistencia</button>
            </form>
            <form action={declineAction}>
              <button className="btn-secondary" type="submit">No podré asistir</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
