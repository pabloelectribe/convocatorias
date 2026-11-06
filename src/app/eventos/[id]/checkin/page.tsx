import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { checkInByQuery, checkInContact } from "../../actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ENVIADA: "Invitado",
  ABIERTA: "Invitado",
  REGISTRADA: "Confirmado",
  DECLINADA: "Declinó",
};

export default async function CheckinPage({ params, searchParams }: { params: { id: string }; searchParams: { msg?: string; ok?: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      invitations: { include: { contact: true } },
      registrations: { include: { contact: true } },
      attendances: { include: { contact: true }, orderBy: { checkedInAt: "desc" } },
    },
  });
  if (!event) notFound();

  const eventId = event.id;
  async function action(formData: FormData) {
    "use server";
    const result = await checkInByQuery(eventId, formData);
    redirect(`/eventos/${eventId}/checkin?ok=${result.ok ? "1" : "0"}&msg=${encodeURIComponent(result.message)}`);
  }

  const attendedIds = new Set(event.attendances.map((a) => a.contactId));
  const registeredByContact = new Map(event.registrations.map((r) => [r.contactId, r]));

  const roster: Array<{ contactId: string; name: string; status: string; ticketCode?: string; attended: boolean }> = [];
  for (const inv of event.invitations) {
    const reg = registeredByContact.get(inv.contactId);
    roster.push({
      contactId: inv.contactId,
      name: fullName(inv.contact),
      status: reg ? "REGISTRADA" : inv.status,
      ticketCode: reg?.ticketCode,
      attended: attendedIds.has(inv.contactId),
    });
  }
  for (const reg of event.registrations) {
    if (!roster.find((r) => r.contactId === reg.contactId)) {
      roster.push({ contactId: reg.contactId, name: fullName(reg.contact), status: "REGISTRADA", ticketCode: reg.ticketCode, attended: attendedIds.has(reg.contactId) });
    }
  }
  roster.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Check-in · {event.title}</h1>
        <Link href={`/eventos/${event.id}`} className="text-sm text-brand-600 hover:underline">← Volver al evento</Link>
      </div>

      <form action={action} className="card p-4 space-y-3">
        <label className="label" htmlFor="query">RUT, email o código de ticket</label>
        <input className="input" id="query" name="query" autoFocus placeholder="12.345.678-9" />
        <button className="btn-primary w-full" type="submit">Registrar asistencia</button>
      </form>

      {searchParams.msg && (
        <p className={`text-sm rounded-md p-3 ${searchParams.ok === "1" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {searchParams.msg}
        </p>
      )}

      <div className="card overflow-x-auto">
        <h2 className="font-medium px-4 pt-4 mb-2">Invitados / inscritos ({roster.length})</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Ticket</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((r) => (
              <tr key={r.contactId} className={r.attended ? "bg-green-50/50" : ""}>
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2 text-slate-600">{STATUS_LABEL[r.status] ?? r.status}</td>
                <td className="px-4 py-2 font-mono text-xs text-slate-500">{r.ticketCode ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  {r.attended ? (
                    <span className="badge bg-green-100 text-green-700">✅ Asistió</span>
                  ) : (
                    <form action={checkInContact.bind(null, eventId, r.contactId)}>
                      <button className="btn-secondary" type="submit">Marcar asistencia</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {roster.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Aún no hay invitados ni inscritos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
