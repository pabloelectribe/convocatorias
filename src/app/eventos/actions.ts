"use server";

import { prisma } from "@/lib/prisma";
import { slugify, ticketCode } from "@/lib/slug";
import { EventModality, TimelineType, RegistrationSource, EmailType, EMAIL_TYPE_LABEL } from "@/lib/enums";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { buildEmail } from "@/lib/email-templates";
import { getBaseUrl } from "@/lib/url";
import { zonedTimeToUtc } from "@/lib/dates";

function combineDateTime(formData: FormData, prefix: string): Date | null {
  const date = String(formData.get(`${prefix}Date`) || "");
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const hour = Number(formData.get(`${prefix}Hour`) || 0);
  const minute = Number(formData.get(`${prefix}Minute`) || 0);
  const parsed = zonedTimeToUtc(y, m, d, hour, minute);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const topic = String(formData.get("topic") || "").trim() || null;
  const modality = String(formData.get("modality") || "ZOOM") as EventModality;
  const location = String(formData.get("location") || "").trim() || null;
  const zoomLink = String(formData.get("zoomLink") || "").trim() || null;
  const startAt = combineDateTime(formData, "start");
  const endAt = combineDateTime(formData, "end");
  const capacityRaw = String(formData.get("capacity") || "");
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;

  if (!title || !startAt) throw new Error("Título y fecha de inicio son obligatorios");

  let slug = slugify(title);
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const event = await prisma.event.create({
    data: { title, description, topic, modality, location, zoomLink, startAt, endAt, capacity, slug },
  });

  revalidatePath("/eventos");
  redirect(`/eventos/${event.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const topic = String(formData.get("topic") || "").trim() || null;
  const modality = String(formData.get("modality") || "ZOOM") as EventModality;
  const location = String(formData.get("location") || "").trim() || null;
  const zoomLink = String(formData.get("zoomLink") || "").trim() || null;
  const startAt = combineDateTime(formData, "start");
  const endAt = combineDateTime(formData, "end");
  const capacityRaw = String(formData.get("capacity") || "");
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;

  if (!title || !startAt) throw new Error("Título y fecha de inicio son obligatorios");

  await prisma.event.update({
    where: { id: eventId },
    data: { title, description, topic, modality, location, zoomLink, startAt, endAt, capacity },
  });

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
}

export async function updateEventStatus(eventId: string, status: "BORRADOR" | "PUBLICADO" | "FINALIZADO" | "CANCELADO") {
  "use server";
  await prisma.event.update({ where: { id: eventId }, data: { status } });
  revalidatePath(`/eventos/${eventId}`);
}

export async function inviteSegment(eventId: string, formData: FormData) {
  "use server";
  const segmentId = String(formData.get("segmentId") || "");
  if (!segmentId) return;
  const members = await prisma.segmentMember.findMany({ where: { segmentId }, select: { contactId: true } });
  const existingInvites = await prisma.invitation.findMany({ where: { eventId }, select: { contactId: true } });
  const already = new Set(existingInvites.map((i) => i.contactId));
  const toInvite = members.map((m) => m.contactId).filter((id) => !already.has(id));

  for (const contactId of toInvite) {
    await prisma.invitation.create({ data: { eventId, contactId, segmentId } });
    await prisma.timelineEvent.create({
      data: { contactId, eventId, type: TimelineType.INVITED, title: "Invitación enviada" },
    });
  }
  revalidatePath(`/eventos/${eventId}`);
}

export async function inviteContact(eventId: string, formData: FormData) {
  "use server";
  const query = String(formData.get("query") || "").trim();
  if (!query) return;
  const contact = await prisma.contact.findFirst({ where: { OR: [{ rut: query }, { email: query }] } });
  if (!contact) return;

  await prisma.invitation.upsert({
    where: { eventId_contactId: { eventId, contactId: contact.id } },
    update: {},
    create: { eventId, contactId: contact.id },
  });
  await prisma.timelineEvent.create({
    data: { contactId: contact.id, eventId, type: TimelineType.INVITED, title: "Invitación enviada" },
  });
  revalidatePath(`/eventos/${eventId}`);
}

async function markAttended(eventId: string, contactId: string) {
  await prisma.attendance.upsert({
    where: { eventId_contactId: { eventId, contactId } },
    update: {},
    create: { eventId, contactId },
  });
  const alreadyLogged = await prisma.timelineEvent.findFirst({
    where: { eventId, contactId, type: TimelineType.ATTENDED },
  });
  if (!alreadyLogged) {
    await prisma.timelineEvent.create({
      data: { contactId, eventId, type: TimelineType.ATTENDED, title: "Asistió al evento (check-in)" },
    });
  }
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/checkin`);
}

export async function checkInContact(eventId: string, contactId: string) {
  "use server";
  await markAttended(eventId, contactId);
}

export async function checkInByQuery(eventId: string, formData: FormData) {
  "use server";
  const query = String(formData.get("query") || "").trim();
  if (!query) return { ok: false, message: "Ingresa un RUT, email o código de ticket." };

  const registration = await prisma.registration.findFirst({
    where: {
      eventId,
      OR: [{ ticketCode: query }, { contact: { rut: query } }, { contact: { email: query } }],
    },
    include: { contact: true },
  });
  if (registration) {
    await markAttended(eventId, registration.contactId);
    return { ok: true, message: `Check-in exitoso: ${registration.contact.firstName} ${registration.contact.lastName}` };
  }

  const contact = await prisma.contact.findFirst({
    where: { OR: [{ rut: query }, { email: query }] },
  });
  const invited = contact ? await prisma.invitation.findUnique({ where: { eventId_contactId: { eventId, contactId: contact.id } } }) : null;
  if (contact && invited) {
    await markAttended(eventId, contact.id);
    return { ok: true, message: `Check-in exitoso: ${contact.firstName} ${contact.lastName}` };
  }

  return { ok: false, message: "No se encontró una inscripción o invitación con ese dato." };
}

export async function sendInvitationTypeEmail(invitationId: string, type: EmailType) {
  "use server";
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { event: true, contact: true },
  });
  if (!invitation || !invitation.contact.email) {
    return { ok: false, error: "El contacto no tiene email registrado." };
  }

  const link = `${getBaseUrl()}/invitacion/${invitation.token}`;
  const { subject, html } = buildEmail(type, invitation.event, invitation.contact, link);
  const result = await sendEmail({ to: invitation.contact.email, subject, html });

  await prisma.emailLog.create({
    data: { invitationId, type, success: result.ok, error: result.error },
  });
  if (result.ok) {
    await prisma.timelineEvent.create({
      data: {
        contactId: invitation.contactId,
        eventId: invitation.eventId,
        type: TimelineType.INVITED,
        title: `Correo enviado: ${EMAIL_TYPE_LABEL[type]}`,
        description: invitation.event.title,
      },
    });
  }
  return result;
}

const EMAIL_CONCURRENCY = 5;

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<{ ok: boolean }>): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      const result = await fn(item);
      if (result.ok) sent++;
      else failed++;
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return { sent, failed };
}

export async function sendInvitationEmails(eventId: string): Promise<{ sent: number; failed: number }> {
  "use server";
  const invitations = await prisma.invitation.findMany({
    where: { eventId, status: { in: ["ENVIADA", "ABIERTA"] } },
  });
  const result = await mapWithConcurrency(invitations, EMAIL_CONCURRENCY, (inv) => sendInvitationTypeEmail(inv.id, EmailType.INVITACION));
  revalidatePath(`/eventos/${eventId}`);
  return result;
}

export async function sendReminderEmails(eventId: string): Promise<{ sent: number; failed: number }> {
  "use server";
  const invitations = await prisma.invitation.findMany({
    where: { eventId, status: { in: ["ENVIADA", "ABIERTA"] } },
    include: { emails: true },
  });
  const result = await mapWithConcurrency(invitations, EMAIL_CONCURRENCY, (inv) => {
    const type = inv.emails.length > 0 ? EmailType.REINSISTENCIA : EmailType.RECORDATORIO;
    return sendInvitationTypeEmail(inv.id, type);
  });
  revalidatePath(`/eventos/${eventId}`);
  return result;
}

export async function resendInvitationEmail(eventId: string, invitationId: string) {
  "use server";
  await sendInvitationTypeEmail(invitationId, EmailType.REINSISTENCIA);
  revalidatePath(`/eventos/${eventId}`);
}

export async function registerContactDirectly(eventId: string, contactId: string, source: RegistrationSource) {
  const existing = await prisma.registration.findUnique({ where: { eventId_contactId: { eventId, contactId } } });
  if (existing) return existing;
  const registration = await prisma.registration.create({
    data: { eventId, contactId, source, ticketCode: ticketCode() },
  });
  await prisma.timelineEvent.create({
    data: { contactId, eventId, type: TimelineType.REGISTERED, title: "Se inscribió al evento" },
  });
  const invitation = await prisma.invitation.findUnique({ where: { eventId_contactId: { eventId, contactId } } });
  if (invitation) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "REGISTRADA", respondedAt: new Date() } });
  }
  return registration;
}
