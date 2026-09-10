import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { rutDisplay, fullName, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { touches: { include: { contact: true }, orderBy: { occurredAt: "desc" } } },
  });
  if (!campaign) return new Response("No encontrado", { status: 404 });

  const rows: string[][] = [["Nombre", "RUT", "Email", "Fecha de contacto"]];
  for (const t of campaign.touches) {
    rows.push([fullName(t.contact), rutDisplay(t.contact.rut), t.contact.email || "", formatDateTime(t.occurredAt)]);
  }

  return csvResponse(`campana-${campaign.id}.csv`, rows);
}
