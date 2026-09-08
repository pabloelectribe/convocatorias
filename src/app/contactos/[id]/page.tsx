import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, fullName, rutDisplay } from "@/lib/format";
import { addNote, addToSegment, removeFromSegment, addTagToContact, removeTagFromContact } from "../actions";

export const dynamic = "force-dynamic";

const TIMELINE_LABEL: Record<string, string> = {
  CONTACT_CREATED: "Contacto creado",
  IMPORT: "Importado desde CSV",
  INVITED: "Invitado",
  REGISTERED: "Inscrito",
  ATTENDED: "Asistió",
  DECLINED: "Declinó",
  FORM_SUBMITTED: "Envió formulario",
  NOTE: "Nota",
};

const TIMELINE_COLOR: Record<string, string> = {
  CONTACT_CREATED: "bg-slate-100 text-slate-700",
  IMPORT: "bg-amber-100 text-amber-700",
  INVITED: "bg-blue-100 text-blue-700",
  REGISTERED: "bg-indigo-100 text-indigo-700",
  ATTENDED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  FORM_SUBMITTED: "bg-purple-100 text-purple-700",
  NOTE: "bg-slate-100 text-slate-700",
};

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      channel: true,
      tags: { include: { tag: true } },
      segments: { include: { segment: true } },
      invitations: { include: { event: true } },
      registrations: { include: { event: true } },
      attendances: { include: { event: true } },
      activities: { include: { event: true }, orderBy: { occurredAt: "desc" } },
    },
  });
  if (!contact) notFound();

  const [allSegments, allTags] = await Promise.all([
    prisma.segment.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const memberSegmentIds = new Set(contact.segments.map((s) => s.segmentId));
  const contactTagIds = new Set(contact.tags.map((t) => t.tagId));

  // Embudo por evento: por cada evento donde hay invitación/inscripción/asistencia
  const eventIds = new Set<string>([
    ...contact.invitations.map((i) => i.eventId),
    ...contact.registrations.map((r) => r.eventId),
    ...contact.attendances.map((a) => a.eventId),
  ]);
  const eventFunnel = Array.from(eventIds).map((eventId) => {
    const invitation = contact.invitations.find((i) => i.eventId === eventId);
    const registration = contact.registrations.find((r) => r.eventId === eventId);
    const attendance = contact.attendances.find((a) => a.eventId === eventId);
    const event = invitation?.event || registration?.event || attendance?.event;
    return { event, invitation, registration, attendance };
  }).sort((a, b) => (b.event && a.event ? new Date(b.event.startAt).getTime() - new Date(a.event.startAt).getTime() : 0));

  const attendedCount = contact.attendances.length;
  const topicCounts = new Map<string, number>();
  for (const a of contact.attendances) {
    const topic = a.event.topic || "Sin tema";
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  }
  const favoriteTopic = [...topicCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const lastActivity = contact.activities[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{fullName(contact)}</h1>
          <p className="text-sm text-slate-500">{contact.companyName} {contact.sector ? `· ${contact.sector}` : ""}</p>
        </div>
        <Link href="/contactos" className="btn-secondary">← Volver</Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-4 space-y-2 text-sm">
            <h2 className="font-medium mb-2">Datos de contacto</h2>
            <Field label="RUT" value={rutDisplay(contact.rut)} />
            <Field label="Email" value={contact.email} />
            <Field label="Teléfono" value={contact.phone} />
            <Field label="Comuna" value={contact.comuna} />
            <Field label="Región" value={contact.region} />
            <Field label="Canal de origen" value={contact.channel?.name} />
            <Field label="Creado" value={formatDateTime(contact.createdAt)} />
          </div>

          <div className="card p-4 space-y-2 text-sm">
            <h2 className="font-medium mb-2">Conocimiento del cliente</h2>
            <Field label="Eventos asistidos" value={String(attendedCount)} />
            <Field label="Temática de mayor interés" value={favoriteTopic} />
            <Field label="Última actividad" value={lastActivity ? formatDateTime(lastActivity.occurredAt) : undefined} />
          </div>

          <div className="card p-4">
            <h2 className="font-medium mb-2">Temas de interés</h2>
            <div className="flex flex-wrap gap-1 mb-3">
              {contact.tags.map((t) => (
                <form key={t.tagId} action={removeTagFromContact.bind(null, contact.id, t.tagId)}>
                  <button className="badge bg-brand-50 text-brand-700 hover:bg-red-50 hover:text-red-700" title="Quitar">
                    {t.tag.name} ×
                  </button>
                </form>
              ))}
              {contact.tags.length === 0 && <p className="text-sm text-slate-400">Sin temas asignados.</p>}
            </div>
            <form action={addTagToContact.bind(null, contact.id)} className="flex gap-2">
              <select className="input" name="tagId" defaultValue="" required>
                <option value="" disabled>Agregar tema...</option>
                {allTags.filter((t) => !contactTagIds.has(t.id)).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button className="btn-secondary" type="submit">+</button>
            </form>
          </div>

          <div className="card p-4">
            <h2 className="font-medium mb-2">Segmentos</h2>
            <ul className="space-y-1 mb-3">
              {contact.segments.map((s) => (
                <li key={s.segmentId} className="flex items-center justify-between text-sm">
                  <Link href={`/segmentos/${s.segmentId}`} className="text-brand-700 hover:underline">{s.segment.name}</Link>
                  <form action={removeFromSegment.bind(null, contact.id, s.segmentId)}>
                    <button className="text-xs text-slate-400 hover:text-red-600">Quitar</button>
                  </form>
                </li>
              ))}
              {contact.segments.length === 0 && <p className="text-sm text-slate-400">No pertenece a ningún segmento.</p>}
            </ul>
            <form action={addToSegment.bind(null, contact.id)} className="flex gap-2">
              <select className="input" name="segmentId" defaultValue="" required>
                <option value="" disabled>Agregar a segmento...</option>
                {allSegments.filter((s) => !memberSegmentIds.has(s.id)).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button className="btn-secondary" type="submit">+</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-4">
            <h2 className="font-medium mb-3">Embudo de conversión por convocatoria</h2>
            {eventFunnel.length === 0 && <p className="text-sm text-slate-400">Aún no ha sido invitado a ningún evento.</p>}
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-1 font-medium">Evento</th>
                  <th className="py-1 font-medium">Invitado</th>
                  <th className="py-1 font-medium">Inscrito</th>
                  <th className="py-1 font-medium">Asistió</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventFunnel.map(({ event, invitation, registration, attendance }) => (
                  <tr key={event!.id}>
                    <td className="py-2">
                      <Link href={`/eventos/${event!.id}`} className="text-brand-700 hover:underline">{event!.title}</Link>
                    </td>
                    <td className="py-2">{invitation ? "✅" : "—"}</td>
                    <td className="py-2">{registration ? "✅" : invitation?.status === "DECLINADA" ? "❌ declinó" : "—"}</td>
                    <td className="py-2">{attendance ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-4">
            <h2 className="font-medium mb-3">Historial (timeline 360°)</h2>
            <form action={addNote.bind(null, contact.id)} className="flex gap-2 mb-4">
              <input className="input" name="note" placeholder="Agregar una nota sobre este cliente..." />
              <button className="btn-secondary" type="submit">Agregar</button>
            </form>
            <ol className="space-y-3">
              {contact.activities.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className={`badge shrink-0 h-fit ${TIMELINE_COLOR[a.type] || "bg-slate-100"}`}>
                    {TIMELINE_LABEL[a.type] || a.type}
                  </span>
                  <div>
                    <p>
                      {a.title}
                      {a.event ? (
                        <>
                          {" "}
                          <Link href={`/eventos/${a.event.id}`} className="text-brand-700 hover:underline">
                            {a.event.title}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    {a.description && <p className="text-slate-500">{a.description}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(a.occurredAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}
