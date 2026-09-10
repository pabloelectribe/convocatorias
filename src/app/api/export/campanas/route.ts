import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: { _count: { select: { touches: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[][] = [["Nombre", "Medio", "Creada", "Contactos tocados", "Notas"]];
  for (const c of campaigns) {
    rows.push([c.name, c.medium, formatDateTime(c.createdAt), String(c._count.touches), c.notes || ""]);
  }

  return csvResponse("campanas.csv", rows);
}
