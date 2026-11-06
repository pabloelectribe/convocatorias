"use server";

import { prisma } from "@/lib/prisma";
import { normalizeRut, formatRut, isValidRut } from "@/lib/rut";
import { parseFlexibleDate } from "@/lib/dates";
import { TimelineType, RegistrationSource, ImportKind } from "@/lib/enums";
import { slugify, ticketCode } from "@/lib/slug";
import { parseCsvText, previewRows, type CsvPreview } from "@/lib/csv-import";
import { revalidatePath } from "next/cache";

export interface CsvMapping {
  rut?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  sector?: string;
  businessSegment?: string;
  phone?: string;
  activity?: string;
  date?: string;
  channel?: string;
  eventName?: string;
  registeredAt?: string;
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

  const channelCache = new Map<string, string>();
  async function getChannelId(name: string): Promise<string> {
    const key = name.trim();
    if (channelCache.has(key)) return channelCache.get(key)!;
    const channel = await prisma.channel.upsert({ where: { name: key }, update: {}, create: { name: key } });
    channelCache.set(key, channel.id);
    return channel.id;
  }

  const eventCache = new Map<string, string>();
  async function getOrCreateEventId(title: string, fallbackDate: Date): Promise<string> {
    const key = title.trim().toLowerCase();
    if (eventCache.has(key)) return eventCache.get(key)!;
    let event = await prisma.event.findFirst({ where: { title: { equals: title.trim(), mode: "insensitive" } } });
    if (!event) {
      let slug = slugify(title);
      const existingSlug = await prisma.event.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;
      event = await prisma.event.create({
        data: { title: title.trim(), slug, modality: "PRESENCIAL", startAt: fallbackDate, status: "FINALIZADO" },
      });
    }
    eventCache.set(key, event.id);
    return event.id;
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
      const sector = mapping.sector ? row[mapping.sector]?.trim() : undefined;
      const businessSegment = mapping.businessSegment ? row[mapping.businessSegment]?.trim() : undefined;
      const phone = mapping.phone ? row[mapping.phone]?.trim() : undefined;
      const activity = mapping.activity ? row[mapping.activity]?.trim() : undefined;
      const dateRaw = mapping.date ? row[mapping.date] : undefined;
      const channelName = mapping.channel ? row[mapping.channel]?.trim() : undefined;
      const eventName = mapping.eventName ? row[mapping.eventName]?.trim() : undefined;
      const registeredAtRaw = mapping.registeredAt ? row[mapping.registeredAt] : undefined;

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
            sector: contact.sector || sector || undefined,
            businessSegment: contact.businessSegment || businessSegment || undefined,
            phone: contact.phone || phone || undefined,
            channelId: contact.channelId || channelId,
          },
        });
        updatedCount++;
      } else {
        contact = await prisma.contact.create({
          data: { rut, email: email || null, firstName, lastName, companyName, sector, businessSegment, phone, channelId },
        });
        await prisma.timelineEvent.create({
          data: { contactId: contact.id, type: TimelineType.CONTACT_CREATED, title: "Contacto creado", description: `Importado desde ${filename}`, occurredAt },
        });
        createdCount++;
      }

      if (eventName) {
        const eventId = await getOrCreateEventId(eventName, occurredAt);
        const registeredAt = registeredAtRaw ? parseFlexibleDate(registeredAtRaw) || occurredAt : occurredAt;

        const existingRegistration = await prisma.registration.findUnique({
          where: { eventId_contactId: { eventId, contactId: contact.id } },
        });
        if (!existingRegistration) {
          await prisma.registration.create({
            data: { eventId, contactId: contact.id, source: RegistrationSource.IMPORTACION, ticketCode: ticketCode(), registeredAt },
          });
          await prisma.timelineEvent.create({
            data: { contactId: contact.id, eventId, type: TimelineType.REGISTERED, title: "Se inscribió al evento", description: `Importado desde ${filename}`, occurredAt: registeredAt },
          });
        }

        const existingAttendance = await prisma.attendance.findUnique({
          where: { eventId_contactId: { eventId, contactId: contact.id } },
        });
        if (!existingAttendance) {
          await prisma.attendance.create({ data: { eventId, contactId: contact.id, checkedInAt: occurredAt } });
          await prisma.timelineEvent.create({
            data: { contactId: contact.id, eventId, type: TimelineType.ATTENDED, title: "Asistió al evento (check-in)", description: `Importado desde ${filename}`, occurredAt },
          });
        }
      } else if (activity) {
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
    data: { kind: ImportKind.CONTACTOS, filename, rowCount: rows.length, createdCount, updatedCount, errorCount },
  });

  revalidatePath("/importar");
  revalidatePath("/importar/contactos");
  revalidatePath("/contactos");
  revalidatePath("/eventos");
  revalidatePath("/");

  return { createdCount, updatedCount, errorCount, rowCount: rows.length };
}
