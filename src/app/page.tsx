import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, pct } from "@/lib/format";
import { HBar } from "@/components/charts/HBar";
import { CATEGORICAL_COLORS, SEQUENTIAL_BLUE } from "@/lib/chart-colors";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    contactCount,
    segmentCount,
    eventCount,
    upcomingEvents,
    invitationCount,
    registrationCount,
    attendanceCount,
    recentImports,
    recentActivity,
    channels,
    contactsByChannel,
    eventsByModality,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.segment.count(),
    prisma.event.count(),
    prisma.event.findMany({ where: { startAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, take: 5 }),
    prisma.invitation.count(),
    prisma.registration.count(),
    prisma.attendance.count(),
    prisma.importBatch.findMany({ orderBy: { importedAt: "desc" }, take: 5 }),
    prisma.timelineEvent.findMany({ orderBy: { occurredAt: "desc" }, take: 8, include: { contact: true, event: true } }),
    prisma.channel.findMany(),
    prisma.contact.groupBy({ by: ["channelId"], _count: { _all: true } }),
    prisma.event.groupBy({ by: ["modality"], _count: { _all: true } }),
  ]);
  return {
    contactCount, segmentCount, eventCount, upcomingEvents, invitationCount, registrationCount, attendanceCount,
    recentImports, recentActivity, channels, contactsByChannel, eventsByModality,
  };
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

const TIMELINE_DOT: Record<string, string> = {
  CONTACT_CREATED: "bg-slate-400",
  IMPORT: "bg-amber-500",
  INVITED: "bg-blue-500",
  REGISTERED: "bg-indigo-500",
  ATTENDED: "bg-green-500",
  DECLINED: "bg-red-500",
  FORM_SUBMITTED: "bg-purple-500",
  NOTE: "bg-slate-400",
};

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido" };
const MODALITY_COLOR: Record<string, string> = {
  ZOOM: CATEGORICAL_COLORS[0],
  PRESENCIAL: CATEGORICAL_COLORS[6],
  HIBRIDO: CATEGORICAL_COLORS[2],
};

export default async function DashboardPage() {
  const s = await getStats();

  const channelNameById = new Map(s.channels.map((c) => [c.id, c.name]));
  const channelRows = s.contactsByChannel
    .map((row) => ({
      label: row.channelId ? channelNameById.get(row.channelId) || "Canal eliminado" : "Sin canal",
      value: row._count._all,
    }))
    .sort((a, b) => b.value - a.value);
  const topChannels = channelRows.slice(0, 7);
  const otherChannelsTotal = channelRows.slice(7).reduce((acc, r) => acc + r.value, 0);
  if (otherChannelsTotal > 0) topChannels.push({ label: "Otros", value: otherChannelsTotal });
  const maxChannelValue = Math.max(...topChannels.map((r) => r.value), 1);

  const modalityRows = (["ZOOM", "PRESENCIAL", "HIBRIDO"] as const).map((m) => ({
    modality: m,
    value: s.eventsByModality.find((r) => r.modality === m)?._count._all || 0,
  }));
  const maxModalityValue = Math.max(...modalityRows.map((r) => r.value), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Panel general</h1>
        <p className="text-sm text-slate-500">Vista rápida del conocimiento de cliente 360° y las próximas convocatorias.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Contactos" value={s.contactCount} href="/contactos" color={CATEGORICAL_COLORS[0]} icon="👤" />
        <StatCard label="Segmentos" value={s.segmentCount} href="/segmentos" color={CATEGORICAL_COLORS[1]} icon="🗂️" />
        <StatCard label="Eventos" value={s.eventCount} href="/eventos" color={CATEGORICAL_COLORS[2]} icon="📅" />
        <StatCard label="Importaciones" value={s.recentImports.length} href="/importar" color={CATEGORICAL_COLORS[3]} icon="⬆️" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-1">
          <h2 className="font-medium mb-1">Embudo global de convocatorias</h2>
          <p className="text-xs text-slate-400 mb-4">De invitado a asistente, sobre el total histórico.</p>
          <div className="space-y-3">
            <HBar label="Invitados" value={s.invitationCount} max={s.invitationCount || 1} color={SEQUENTIAL_BLUE.light} />
            <HBar
              label="Inscritos"
              value={s.registrationCount}
              max={s.invitationCount || 1}
              color={SEQUENTIAL_BLUE.mid}
              valueLabel={`${s.registrationCount} · ${pct(s.registrationCount, s.invitationCount)}`}
            />
            <HBar
              label="Asistieron"
              value={s.attendanceCount}
              max={s.invitationCount || 1}
              color={SEQUENTIAL_BLUE.dark}
              valueLabel={`${s.attendanceCount} · ${pct(s.attendanceCount, s.invitationCount)}`}
            />
          </div>
        </div>

        <div className="card p-4 lg:col-span-1">
          <h2 className="font-medium mb-1">Contactos por canal de origen</h2>
          <p className="text-xs text-slate-400 mb-4">De dónde viene la base de clientes.</p>
          {topChannels.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no hay contactos.</p>
          ) : (
            <div className="space-y-2.5">
              {topChannels.map((row, i) => (
                <HBar key={row.label} label={row.label} value={row.value} max={maxChannelValue} color={CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length]} />
              ))}
            </div>
          )}
        </div>

        <div className="card p-4 lg:col-span-1">
          <h2 className="font-medium mb-1">Eventos por modalidad</h2>
          <p className="text-xs text-slate-400 mb-4">Zoom, presencial o híbrido.</p>
          <div className="space-y-3">
            {modalityRows.map((row) => (
              <HBar
                key={row.modality}
                label={MODALITY_LABEL[row.modality]}
                value={row.value}
                max={maxModalityValue}
                color={MODALITY_COLOR[row.modality]}
              />
            ))}
          </div>
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
              <li key={e.id} className="py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MODALITY_COLOR[e.modality] }} />
                <div>
                  <Link href={`/eventos/${e.id}`} className="font-medium text-brand-700 hover:underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-slate-500">{formatDateTime(e.startAt)} · {MODALITY_LABEL[e.modality]}</p>
                </div>
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
              <li key={a.id} className="py-2 text-sm flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${TIMELINE_DOT[a.type] || "bg-slate-400"}`} />
                <div>
                  <Link href={`/contactos/${a.contactId}`} className="font-medium text-brand-700 hover:underline">
                    {a.contact.firstName} {a.contact.lastName}
                  </Link>{" "}
                  <span className="text-slate-600">
                    {TIMELINE_LABEL[a.type] || a.type}
                    {a.event ? ` "${a.event.title}"` : ""}
                  </span>
                  <p className="text-xs text-slate-400">{formatDateTime(a.occurredAt)}</p>
                </div>
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
                <td className="py-2 pr-2 font-medium font-mono text-xs">{imp.filename}</td>
                <td className="py-2 pr-2 text-slate-500">{formatDateTime(imp.importedAt)}</td>
                <td className="py-2 pr-2 text-slate-500">{imp.createdCount} nuevos, {imp.updatedCount} actualizados</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        <Link href="/admin/seed" className="hover:underline">Cargar / restablecer datos de ejemplo</Link>
      </p>
    </div>
  );
}

function StatCard({ label, value, href, color, icon }: { label: string; value: number; href: string; color: string; icon: string }) {
  return (
    <Link href={href} className="card p-4 hover:border-brand-300 transition-colors relative overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{ backgroundColor: `${color}1a` }}
        >
          {icon}
        </span>
      </div>
    </Link>
  );
}
