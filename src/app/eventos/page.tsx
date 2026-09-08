import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  BORRADOR: "bg-slate-100 text-slate-700",
  PUBLICADO: "bg-green-100 text-green-700",
  FINALIZADO: "bg-slate-100 text-slate-500",
  CANCELADO: "bg-red-100 text-red-700",
};

export default async function EventosPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { invitations: true, registrations: true, attendances: true } } },
    orderBy: { startAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Eventos / Convocatorias</h1>
          <p className="text-sm text-slate-500">Zoom o presenciales: invita, inscribe y controla la asistencia.</p>
        </div>
        <Link href="/eventos/nuevo" className="btn-primary">+ Nuevo evento</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Evento</th>
              <th className="px-4 py-2 font-medium">Fecha</th>
              <th className="px-4 py-2 font-medium">Modalidad</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Invitados</th>
              <th className="px-4 py-2 font-medium">Inscritos</th>
              <th className="px-4 py-2 font-medium">Asistieron</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/eventos/${e.id}`} className="font-medium text-brand-700 hover:underline">{e.title}</Link>
                  <p className="text-xs text-slate-400">{e.topic}</p>
                </td>
                <td className="px-4 py-2 text-slate-600">{formatDateTime(e.startAt)}</td>
                <td className="px-4 py-2 text-slate-600">{e.modality}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${STATUS_COLOR[e.status]}`}>{STATUS_LABEL[e.status]}</span>
                </td>
                <td className="px-4 py-2">{e._count.invitations}</td>
                <td className="px-4 py-2">{e._count.registrations}</td>
                <td className="px-4 py-2">{e._count.attendances}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aún no hay eventos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
