import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { rutDisplay, fullName } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  const contacts = await prisma.contact.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { rut: { contains: q } },
            { companyName: { contains: q } },
          ],
        }
      : undefined,
    include: { channel: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[][] = [
    ["Nombre", "RUT", "Email", "Teléfono", "Empresa", "Sector", "Comuna", "Región", "Canal de origen", "Temas de interés"],
  ];
  for (const c of contacts) {
    rows.push([
      fullName(c),
      rutDisplay(c.rut),
      c.email || "",
      c.phone || "",
      c.companyName || "",
      c.sector || "",
      c.comuna || "",
      c.region || "",
      c.channel?.name || "",
      c.tags.map((t) => t.tag.name).join("; "),
    ]);
  }

  return csvResponse("contactos.csv", rows);
}
