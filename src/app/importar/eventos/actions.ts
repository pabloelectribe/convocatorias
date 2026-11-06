"use server";

import { prisma } from "@/lib/prisma";
import { parseFlexibleDate } from "@/lib/dates";
import { slugify } from "@/lib/slug";
import { ImportKind, EventModality, EventStatus } from "@/lib/enums";
import { parseCsvText, previewRows, type CsvPreview } from "@/lib/csv-import";
import { revalidatePath } from "next/cache";

export interface CsvMapping {
  title?: string;
  description?: string;
  topic?: string;
  modality?: string;
  location?: string;
  zoomLink?: string;
  startAt?: string;
  endAt?: string;
  capacity?: string;
  status?: string;
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

function normalizeModality(raw?: string): EventModality {
  const n = (raw || "").toLowerCase();
  if (n.includes("hibr")) return EventModality.HIBRIDO;
  if (n.includes("presencial")) return EventModality.PRESENCIAL;
  return EventModality.ZOOM;
}

function normalizeStatus(raw?: string): EventStatus {
  const n = (raw || "").toLowerCase();
  if (n.includes("public")) return EventStatus.PUBLICADO;
  if (n.includes("final")) return EventStatus.FINALIZADO;
  if (n.includes("cancel")) return EventStatus.CANCELADO;
  return EventStatus.BORRADOR;
}

export async function confirmImport(fileText: string, filename: string, mapping: CsvMapping): Promise<ImportResult> {
  "use server";
  const rows = parseCsvText(fileText);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      const title = mapping.title ? row[mapping.title]?.trim() : "";
      if (!title) {
        errorCount++;
        continue;
      }

      const startAtRaw = mapping.startAt ? row[mapping.startAt] : "";
      const startAt = startAtRaw ? parseFlexibleDate(startAtRaw) : null;
      if (!startAt) {
        errorCount++;
        continue;
      }

      const description = mapping.description ? row[mapping.description]?.trim() || undefined : undefined;
      const topic = mapping.topic ? row[mapping.topic]?.trim() || undefined : undefined;
      const modality = normalizeModality(mapping.modality ? row[mapping.modality] : undefined);
      const location = mapping.location ? row[mapping.location]?.trim() || undefined : undefined;
      const zoomLink = mapping.zoomLink ? row[mapping.zoomLink]?.trim() || undefined : undefined;
      const endAtRaw = mapping.endAt ? row[mapping.endAt] : undefined;
      const endAt = endAtRaw ? parseFlexibleDate(endAtRaw) : undefined;
      const capacityRaw = mapping.capacity ? row[mapping.capacity]?.trim() : "";
      const capacity = capacityRaw ? parseInt(capacityRaw, 10) : undefined;
      const status = normalizeStatus(mapping.status ? row[mapping.status] : undefined);

      const existing = await prisma.event.findFirst({ where: { title: { equals: title, mode: "insensitive" } } });

      if (existing) {
        await prisma.event.update({
          where: { id: existing.id },
          data: { description, topic, modality, location, zoomLink, startAt, endAt, capacity, status },
        });
        updatedCount++;
      } else {
        let slug = slugify(title);
        const existingSlug = await prisma.event.findUnique({ where: { slug } });
        if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;
        await prisma.event.create({
          data: { title, slug, description, topic, modality, location, zoomLink, startAt, endAt, capacity, status },
        });
        createdCount++;
      }
    } catch {
      errorCount++;
    }
  }

  await prisma.importBatch.create({
    data: { kind: ImportKind.EVENTOS, filename, rowCount: rows.length, createdCount, updatedCount, errorCount },
  });

  revalidatePath("/importar");
  revalidatePath("/importar/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");

  return { createdCount, updatedCount, errorCount, rowCount: rows.length };
}
