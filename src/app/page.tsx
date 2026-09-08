import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getStats() {
  const [contactCount, segmentCount, eventCount, upcomingEvents, invitationCount, registrationCount, attendanceCount, recentImports, recentActivity] = await Promise.all([
    prisma.contact.count(),
    prisma.segment.count(),
    prisma.event.count(),
    prisma.event.findMany({ where: { startAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, take: 5 }),
    prisma.invitation.count(),
    prisma.registration.count(),
    prisma.attendance.count(),
    prisma.importBatch.findMany({ orderBy: { importedAt: "desc" }, take: 5 }),
    prisma.timelineEvent.findMany({ orderBy: { occurredAt: "desc" }, take: 8, include: { contact: true, event: true } }),
  ]);
  return { contactCount, segmentCount, eventCount, upcomingEvents, invitationCount, registrationCount, attendanceCount, recentImports, recentActivity };
}

const TIMELINE_LABEL: Record<string, string> = {
  CONTACT_CREATED: "Contacto creado",
  IMPORT: "Importado desde CSV",
  INVITED: "Invitado a",
  REGISTERED: "Se inscribió a",
  ATTENDED: "Asistió a",
  DECLINED: "Declinó",
  FORM_SUBMITTED: "Envió formulario",
  NOTE: "Nota",
};

export default async function DashboardPage() {
  const s = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Panel general</h1>
        <p className="text-sm text-slate-500">Vista rápida del conocimiento de cliente 360° y las próximas convocatorias.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Contactos" value={s.contactCount} href="/contactos" />
        <StatCard label="Segmentos" value={s.segmentCount} href="/segmentos" />
        <StatCard label="Eventos" value={s.eventCount} href="/eventos" />
        <StatCard label="Importaciones" value={s.recentImports.length} href="/importar" />
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-3">Embudo global de convocatorias</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Funnel label="Invitados" value={s.invitationCount} of={s.invitationCount} />
          <Funnel label="Inscritos" value={s.registrationCount} of={s.invitationCount} />
          <Funnel label="Asistieron" value={s.attendanceCount} of={s.invitationCount} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Próximos eventos</h2>
            <Link href="/eventos" className="text-sm text-brand-600 hover:underline">Ver todos</Link>
          </div>
          {s.upcomingEvents.length === 0 && <p className="text-sm text-slate-500">No hay eventos próximos.</p>}
          <ul className="divide-y divide-slate-100">
            {s.upcomingEvents.map((e) => (
              <li key={e.id} className="py-2">
                <Link href={`/eventos/${e.id}`} className="font-medium text-brand-700 hover:underline">
                  {e.title}
                </Link>
                <p className="text-xs text-slate-500">{formatDateTime(e.startAt)} · {e.modality}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Actividad reciente</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {s.recentActivity.map((a) => (
              <li key={a.id} className="py-2 text-sm">
                <Link href={`/contactos/${a.contactId}`} className="font-medium text-brand-700 hover:underline">
                  {a.contact.firstName} {a.contact.lastName}
                </Link>{" "}
                <span className="text-slate-600">
                  {TIMELINE_LABEL[a.type] || a.type}
                  {a.event ? ` "${a.event.title}"` : ""}
                </span>
                <p className="text-xs text-slate-400">{formatDateTime(a.occurredAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Últimas importaciones CSV</h2>
          <Link href="/importar" className="text-sm text-brand-600 hover:underline">Importar nuevo archivo</Link>
        </div>
        {s.recentImports.length === 0 && <p className="text-sm text-slate-500">Aún no se han importado archivos.</p>}
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {s.recentImports.map((imp) => (
              <tr key={imp.id}>
                <td className="py-2 pr-2 font-medium">{imp.filename}</td>
                <td className="py-2 pr-2 text-slate-500">{formatDateTime(imp.importedAt)}</td>
                <td className="py-2 pr-2 text-slate-500">{imp.createdCount} nuevos, {imp.updatedCount} actualizados</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-4 hover:border-brand-300 transition-colors">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  );
}

function Funnel({ label, value, of }: { label: string; value: number; of: number }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xs text-slate-400">{pct(value, of)}</p>
    </div>
  );
}
