"use server";

import { prisma } from "@/lib/prisma";
import { normalizeRut, formatRut, isValidRut } from "@/lib/rut";
import { ImportKind } from "@/lib/enums";
import { parseCsvText, previewRows, type CsvPreview } from "@/lib/csv-import";
import { revalidatePath } from "next/cache";

export interface CsvMapping {
  rut?: string;
  email?: string;
  segmentName?: string;
}

export async function previewCsv(fileText: string): Promise<CsvPreview> {
  "use server";
  return previewRows(fileText);
}

export interface ImportResult {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  rowCount: number;
}

export async function confirmImport(fileText: string, filename: string, mapping: CsvMapping): Promise<ImportResult> {
  "use server";
  const rows = parseCsvText(fileText);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  const segmentCache = new Map<string, string>();
  async function getSegmentId(name: string): Promise<string> {
    const key = name.trim();
    if (segmentCache.has(key)) return segmentCache.get(key)!;
    let segment = await prisma.segment.findFirst({ where: { name: { equals: key, mode: "insensitive" } } });
    if (!segment) segment = await prisma.segment.create({ data: { name: key } });
    segmentCache.set(key, segment.id);
    return segment.id;
  }

  for (const row of rows) {
    try {
      const rutRaw = mapping.rut ? row[mapping.rut] : "";
      const email = mapping.email ? row[mapping.email]?.trim().toLowerCase() : "";
      const rut = rutRaw && isValidRut(rutRaw) ? formatRut(rutRaw) : rutRaw ? normalizeRut(rutRaw) : null;
      const segmentName = mapping.segmentName ? row[mapping.segmentName]?.trim() : "";

      if ((!rut && !email) || !segmentName) {
        errorCount++;
        continue;
      }

      const contact = await prisma.contact.findFirst({
        where: { OR: [...(rut ? [{ rut }] : []), ...(email ? [{ email }] : [])] },
      });
      if (!contact) {
        errorCount++;
        continue;
      }

      const segmentId = await getSegmentId(segmentName);
      const existingMember = await prisma.segmentMember.findUnique({
        where: { segmentId_contactId: { segmentId, contactId: contact.id } },
      });
      if (existingMember) {
        updatedCount++;
      } else {
        await prisma.segmentMember.create({ data: { segmentId, contactId: contact.id } });
        createdCount++;
      }
    } catch {
      errorCount++;
    }
  }

  await prisma.importBatch.create({
    data: { kind: ImportKind.SEGMENTOS, filename, rowCount: rows.length, createdCount, updatedCount, errorCount },
  });

  revalidatePath("/importar");
  revalidatePath("/importar/segmentos");
  revalidatePath("/segmentos");

  return { createdCount, updatedCount, errorCount, rowCount: rows.length };
}
