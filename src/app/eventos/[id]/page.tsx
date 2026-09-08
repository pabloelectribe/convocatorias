import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, fullName, pct } from "@/lib/format";
import { inviteSegment, inviteContact, updateEventStatus } from "../actions";

export const dynamic = "force-dynamic";

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido" };

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      invitations: { include: { contact: true } },
      registrations: { include: { contact: true } },
      attendances: true,
    },
  });
  if (!event) notFound();

  const segments = await prisma.segment.findMany({ orderBy: { name: "asc" } });
  const attendedIds = new Set(event.attendances.map((a) => a.contactId));
  const registeredByContact = new Map(event.registrations.map((r) => [r.contactId, r]));

  const rows: Array<{
    contact: (typeof event.invitations)[number]["contact"];
    invitation: (typeof event.invitations)[number] | undefined;
    registration: (typeof event.registrations)[number] | undefined;
    attended: boolean;
  }> = event.invitations.map((inv) => ({
    contact: inv.contact,
    invitation: inv,
    registration: registeredByContact.get(inv.contactId),
    attended: attendedIds.has(inv.contactId),
  }));
  // agregar inscritos directos sin invitación (autoinscripción pública)
  for (const reg of event.registrations) {
    if (!rows.find((r) => r.contact.id === reg.contactId)) {
      rows.push({ contact: reg.contact, invitation: undefined, registration: reg, attended: attendedIds.has(reg.contactId) });
    }
  }

  const invitedCount = event.invitations.length;
  const registeredCount = event.registrations.length;
  const attendedCount = event.attendances.length;
  const publicUrl = `/e/${event.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <p className="text-sm text-slate-500">
            {formatDateTime(event.startAt)} · {MODALITY_LABEL[event.modality]} {event.location ? `· ${event.location}` : ""}
          </p>
        </div>
        <Link href="/eventos" className="btn-secondary">← Volver</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusForm eventId={event.id} status={event.status} />
        <Link href={publicUrl} target="_blank" className="btn-secondary">Ver página pública ↗</Link>
        <Link href={`/eventos/${event.id}/checkin`} className="btn-secondary">Check-in de asistentes</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Invitados" value={invitedCount} />
        <MetricCard label="Inscritos" value={registeredCount} sub={pct(registeredCount, invitedCount || 1)} />
        <MetricCard label="Asistieron" value={attendedCount} sub={pct(attendedCount, registeredCount || 1)} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-medium mb-2">Invitar a un segmento</h2>
          <form action={inviteSegment.bind(null, event.id)} className="flex gap-2">
            <select className="input" name="segmentId" defaultValue="">
              <option value="" disabled>Seleccionar segmento...</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button className="btn-secondary" type="submit">Invitar</button>
          </form>
        </div>
        <div className="card p-4">
          <h2 className="font-medium mb-2">Invitar contacto puntual</h2>
          <form action={inviteContact.bind(null, event.id)} className="flex gap-2">
            <input className="input" name="query" placeholder="RUT o email" />
            <button className="btn-secondary" type="submit">Invitar</button>
          </form>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Estado invitación</th>
              <th className="px-4 py-2 font-medium">Enlace</th>
              <th className="px-4 py-2 font-medium">Inscrito</th>
              <th className="px-4 py-2 font-medium">Ticket</th>
              <th className="px-4 py-2 font-medium">Asistió</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.contact.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/contactos/${r.contact.id}`} className="font-medium text-brand-700 hover:underline">
                    {fullName(r.contact)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{r.invitation ? r.invitation.status : "Sin invitación (autoinscrito)"}</td>
                <td className="px-4 py-2 text-xs">
                  {r.invitation ? (
                    <Link href={`/invitacion/${r.invitation.token}`} target="_blank" className="text-brand-600 hover:underline">
                      Ver invitación ↗
                    </Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-2">{r.registration ? "✅" : "—"}</td>
                <td className="px-4 py-2 text-slate-500 font-mono text-xs">{r.registration?.ticketCode || "—"}</td>
                <td className="px-4 py-2">{r.attended ? "✅" : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aún no hay invitados ni inscritos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function StatusForm({ eventId, status }: { eventId: string; status: string }) {
  const options: Array<{ value: "BORRADOR" | "PUBLICADO" | "FINALIZADO" | "CANCELADO"; label: string }> = [
    { value: "BORRADOR", label: "Borrador" },
    { value: "PUBLICADO", label: "Publicado" },
    { value: "FINALIZADO", label: "Finalizado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];
  return (
    <form className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Estado:</span>
      {options.map((o) => (
        <button
          key={o.value}
          formAction={updateEventStatus.bind(null, eventId, o.value)}
          className={`badge ${status === o.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          {o.label}
        </button>
      ))}
    </form>
  );
}
