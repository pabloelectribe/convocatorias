"use server";

import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { parseCsvText, previewRows, type CsvPreview } from "@/lib/csv-import";
import { revalidatePath } from "next/cache";

export interface CsvMapping {
  name?: string;
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

  for (const row of rows) {
    try {
      const name = mapping.name ? row[mapping.name]?.trim() : "";
      if (!name) {
        errorCount++;
        continue;
      }
      const existing = await prisma.channel.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
      if (existing) {
        updatedCount++;
      } else {
        await prisma.channel.create({ data: { name } });
        createdCount++;
      }
    } catch {
      errorCount++;
    }
  }

  await prisma.importBatch.create({
    data: { kind: ImportKind.CANALES, filename, rowCount: rows.length, createdCount, updatedCount, errorCount },
  });

  revalidatePath("/importar");
  revalidatePath("/importar/canales");
  revalidatePath("/canales");

  return { createdCount, updatedCount, errorCount, rowCount: rows.length };
}
