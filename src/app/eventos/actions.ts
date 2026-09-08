"use server";

import { prisma } from "@/lib/prisma";
import { slugify, ticketCode } from "@/lib/slug";
import { EventModality, TimelineType, RegistrationSource } from "@/lib/enums";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const topic = String(formData.get("topic") || "").trim() || null;
  const modality = String(formData.get("modality") || "ZOOM") as EventModality;
  const location = String(formData.get("location") || "").trim() || null;
  const zoomLink = String(formData.get("zoomLink") || "").trim() || null;
  const startAt = new Date(String(formData.get("startAt")));
  const endAtRaw = String(formData.get("endAt") || "");
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  const capacityRaw = String(formData.get("capacity") || "");
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;

  if (!title || isNaN(startAt.getTime())) throw new Error("Título y fecha de inicio son obligatorios");

  let slug = slugify(title);
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const event = await prisma.event.create({
    data: { title, description, topic, modality, location, zoomLink, startAt, endAt, capacity, slug },
  });

  revalidatePath("/eventos");
  redirect(`/eventos/${event.id}`);
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

  if (!registration) return { ok: false, message: "No se encontró una inscripción con ese dato." };

  await prisma.attendance.upsert({
    where: { eventId_contactId: { eventId, contactId: registration.contactId } },
    update: {},
    create: { eventId, contactId: registration.contactId },
  });
  const alreadyLogged = await prisma.timelineEvent.findFirst({
    where: { eventId, contactId: registration.contactId, type: TimelineType.ATTENDED },
  });
  if (!alreadyLogged) {
    await prisma.timelineEvent.create({
      data: { contactId: registration.contactId, eventId, type: TimelineType.ATTENDED, title: "Asistió al evento (check-in)" },
    });
  }
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/checkin`);
  return { ok: true, message: `Check-in exitoso: ${registration.contact.firstName} ${registration.contact.lastName}` };
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
