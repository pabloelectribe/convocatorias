"use server";

import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { normalizeRut, formatRut, isValidRut } from "@/lib/rut";
import { parseFlexibleDate } from "@/lib/dates";
import { TimelineType } from "@/lib/enums";
import { revalidatePath } from "next/cache";

export interface CsvMapping {
  rut?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  activity?: string;
  date?: string;
  channel?: string;
}

export interface CsvPreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  rowCount: number;
}

function parseCsvText(text: string): Record<string, string>[] {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

export async function previewCsv(fileText: string): Promise<CsvPreview> {
  "use server";
  const rows = parseCsvText(fileText);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, sampleRows: rows.slice(0, 5), rowCount: rows.length };
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

  const channelCache = new Map<string, string>();
  async function getChannelId(name: string): Promise<string> {
    const key = name.trim();
    if (channelCache.has(key)) return channelCache.get(key)!;
    const channel = await prisma.channel.upsert({ where: { name: key }, update: {}, create: { name: key } });
    channelCache.set(key, channel.id);
    return channel.id;
  }

  for (const row of rows) {
    try {
      const rutRaw = mapping.rut ? row[mapping.rut] : "";
      const email = mapping.email ? row[mapping.email]?.trim().toLowerCase() : "";
      const rut = rutRaw && isValidRut(rutRaw) ? formatRut(rutRaw) : rutRaw ? normalizeRut(rutRaw) : null;

      if (!rut && !email) {
        errorCount++;
        continue;
      }

      const firstName = mapping.firstName ? row[mapping.firstName]?.trim() : undefined;
      const lastName = mapping.lastName ? row[mapping.lastName]?.trim() : undefined;
      const companyName = mapping.companyName ? row[mapping.companyName]?.trim() : undefined;
      const phone = mapping.phone ? row[mapping.phone]?.trim() : undefined;
      const activity = mapping.activity ? row[mapping.activity]?.trim() : undefined;
      const dateRaw = mapping.date ? row[mapping.date] : undefined;
      const channelName = mapping.channel ? row[mapping.channel]?.trim() : undefined;

      const occurredAt = dateRaw ? parseFlexibleDate(dateRaw) || new Date() : new Date();
      const channelId = channelName ? await getChannelId(channelName) : undefined;

      let contact = await prisma.contact.findFirst({
        where: { OR: [...(rut ? [{ rut }] : []), ...(email ? [{ email }] : [])] },
      });

      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            rut: contact.rut || rut || undefined,
            email: contact.email || email || undefined,
            firstName: contact.firstName || firstName || undefined,
            lastName: contact.lastName || lastName || undefined,
            companyName: contact.companyName || companyName || undefined,
            phone: contact.phone || phone || undefined,
            channelId: contact.channelId || channelId,
          },
        });
        updatedCount++;
      } else {
        contact = await prisma.contact.create({
          data: { rut, email: email || null, firstName, lastName, companyName, phone, channelId },
        });
        await prisma.timelineEvent.create({
          data: { contactId: contact.id, type: TimelineType.CONTACT_CREATED, title: "Contacto creado", description: `Importado desde ${filename}`, occurredAt },
        });
        createdCount++;
      }

      if (activity) {
        await prisma.timelineEvent.create({
          data: {
            contactId: contact.id,
            type: TimelineType.FORM_SUBMITTED,
            title: `Actividad registrada: ${activity}`,
            description: `Importado desde ${filename}`,
            occurredAt,
          },
        });
      }
    } catch {
      errorCount++;
    }
  }

  await prisma.importBatch.create({
    data: { filename, rowCount: rows.length, createdCount, updatedCount, errorCount },
  });

  revalidatePath("/importar");
  revalidatePath("/contactos");
  revalidatePath("/");

  return { createdCount, updatedCount, errorCount, rowCount: rows.length };
}
