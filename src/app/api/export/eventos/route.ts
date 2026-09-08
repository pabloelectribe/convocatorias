import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { formatDateTime } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const MODALITY_LABEL: Record<string, string> = { ZOOM: "Zoom", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido" };

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { invitations: true, registrations: true, attendances: true } } },
    orderBy: { startAt: "desc" },
  });

  const rows: string[][] = [
    ["Título", "Temática", "Modalidad", "Estado", "Fecha inicio", "Invitados", "Inscritos", "Asistieron"],
  ];
  for (const e of events) {
    rows.push([
      e.title,
      e.topic || "",
      MODALITY_LABEL[e.modality] || e.modality,
      STATUS_LABEL[e.status] || e.status,
      formatDateTime(e.startAt),
      String(e._count.invitations),
      String(e._count.registrations),
      String(e._count.attendances),
    ]);
  }

  return csvResponse("eventos.csv", rows);
}
