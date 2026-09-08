import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const channels = await prisma.channel.findMany({
    include: { _count: { select: { contacts: true } } },
    orderBy: { name: "asc" },
  });

  const rows: string[][] = [["Nombre", "Contactos"]];
  for (const c of channels) {
    rows.push([c.name, String(c._count.contacts)]);
  }

  return csvResponse("canales.csv", rows);
}
