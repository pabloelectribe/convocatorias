"use server";

import { prisma } from "@/lib/prisma";
import { normalizeRut, formatRut, isValidRut } from "@/lib/rut";
import { TimelineType } from "@/lib/enums";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AUTHOR_COOKIE } from "@/lib/constants";

export async function createContact(formData: FormData) {
  const rutRaw = String(formData.get("rut") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const firstName = String(formData.get("firstName") || "").trim() || null;
  const lastName = String(formData.get("lastName") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const companyName = String(formData.get("companyName") || "").trim() || null;
  const sector = String(formData.get("sector") || "").trim() || null;
  const comuna = String(formData.get("comuna") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;
  const channelId = String(formData.get("channelId") || "").trim() || null;

  if (rutRaw && !isValidRut(rutRaw)) {
    throw new Error("RUT inválido");
  }
  const rut = rutRaw ? formatRut(rutRaw) : null;

  const contact = await prisma.contact.create({
    data: { rut, email, firstName, lastName, phone, companyName, sector, comuna, region, channelId },
  });

  await prisma.timelineEvent.create({
    data: { contactId: contact.id, type: TimelineType.CONTACT_CREATED, title: "Contacto creado manualmente" },
  });

  revalidatePath("/contactos");
  redirect(`/contactos/${contact.id}`);
}

export async function updateContact(contactId: string, formData: FormData) {
  "use server";
  const rutRaw = String(formData.get("rut") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const firstName = String(formData.get("firstName") || "").trim() || null;
  const lastName = String(formData.get("lastName") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const companyName = String(formData.get("companyName") || "").trim() || null;
  const sector = String(formData.get("sector") || "").trim() || null;
  const comuna = String(formData.get("comuna") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;
  const channelId = String(formData.get("channelId") || "").trim() || null;

  if (rutRaw && !isValidRut(rutRaw)) {
    throw new Error("RUT inválido");
  }
  const rut = rutRaw ? formatRut(rutRaw) : null;

  if (rut) {
    const clash = await prisma.contact.findUnique({ where: { rut } });
    if (clash && clash.id !== contactId) throw new Error("Ese RUT ya pertenece a otro contacto");
  }
  if (email) {
    const clash = await prisma.contact.findUnique({ where: { email } });
    if (clash && clash.id !== contactId) throw new Error("Ese email ya pertenece a otro contacto");
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: { rut, email, firstName, lastName, phone, companyName, sector, comuna, region, channelId },
  });

  revalidatePath("/contactos");
  revalidatePath(`/contactos/${contactId}`);
  redirect(`/contactos/${contactId}`);
}

export async function addNote(contactId: string, formData: FormData) {
  "use server";
  const text = String(formData.get("note") || "").trim();
  const authorName = String(formData.get("author") || "").trim() || null;
  if (!text) return;
  await prisma.timelineEvent.create({
    data: { contactId, type: TimelineType.NOTE, title: "Nota", description: text, authorName },
  });
  if (authorName) {
    cookies().set(AUTHOR_COOKIE, authorName, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  revalidatePath(`/contactos/${contactId}`);
}

export async function addToSegment(contactId: string, formData: FormData) {
  "use server";
  const segmentId = String(formData.get("segmentId") || "");
  if (!segmentId) return;
  await prisma.segmentMember.upsert({
    where: { segmentId_contactId: { segmentId, contactId } },
    update: {},
    create: { segmentId, contactId },
  });
  revalidatePath(`/contactos/${contactId}`);
}

export async function removeFromSegment(contactId: string, segmentId: string) {
  "use server";
  await prisma.segmentMember.delete({ where: { segmentId_contactId: { segmentId, contactId } } }).catch(() => {});
  revalidatePath(`/contactos/${contactId}`);
}

export async function addTagToContact(contactId: string, formData: FormData) {
  "use server";
  const tagId = String(formData.get("tagId") || "");
  if (!tagId) return;
  await prisma.contactTag.upsert({
    where: { contactId_tagId: { contactId, tagId } },
    update: {},
    create: { contactId, tagId },
  });
  revalidatePath(`/contactos/${contactId}`);
}

export async function inviteContactToEvent(contactId: string, formData: FormData) {
  "use server";
  const eventId = String(formData.get("eventId") || "");
  if (!eventId) return;
  await prisma.invitation.upsert({
    where: { eventId_contactId: { eventId, contactId } },
    update: {},
    create: { eventId, contactId },
  });
  await prisma.timelineEvent.create({
    data: { contactId, eventId, type: TimelineType.INVITED, title: "Invitación enviada" },
  });
  revalidatePath(`/contactos/${contactId}`);
  revalidatePath(`/eventos/${eventId}`);
}

export async function removeTagFromContact(contactId: string, tagId: string) {
  "use server";
  await prisma.contactTag.delete({ where: { contactId_tagId: { contactId, tagId } } }).catch(() => {});
  revalidatePath(`/contactos/${contactId}`);
}
