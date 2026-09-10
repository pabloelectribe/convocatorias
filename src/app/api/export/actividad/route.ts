import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { TIMELINE_LABEL, TIMELINE_TYPES_ORDERED } from "@/lib/timeline";

export const dynamic = "force-dynamic";

function monthKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit" }).format(date);
}

export async function GET() {
  const events = await prisma.timelineEvent.findMany({ select: { occurredAt: true, type: true } });

  const byMonth = new Map<string, Record<string, number>>();
  for (const e of events) {
    const key = monthKey(e.occurredAt);
    if (!byMonth.has(key)) byMonth.set(key, {});
    const row = byMonth.get(key)!;
    row[e.type] = (row[e.type] || 0) + 1;
  }
  const months = Array.from(byMonth.keys()).sort();

  const header = ["Mes", ...TIMELINE_TYPES_ORDERED.map((t) => TIMELINE_LABEL[t]), "Total"];
  const rows: string[][] = [header];
  for (const key of months) {
    const row = byMonth.get(key)!;
    const counts = TIMELINE_TYPES_ORDERED.map((t) => String(row[t] || 0));
    const total = TIMELINE_TYPES_ORDERED.reduce((acc, t) => acc + (row[t] || 0), 0);
    rows.push([key, ...counts, String(total)]);
  }

  return csvResponse("actividad-por-mes.csv", rows);
}
