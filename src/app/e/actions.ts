"use server";

import { prisma } from "@/lib/prisma";
import { formatRut, isValidRut } from "@/lib/rut";
import { ticketCode } from "@/lib/slug";
import { TimelineType } from "@/lib/enums";
import { redirect } from "next/navigation";

export async function registerPublic(eventSlug: string, formData: FormData) {
  "use server";
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const firstName = String(formData.get("firstName") || "").trim() || null;
  const lastName = String(formData.get("lastName") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const rutRaw = String(formData.get("rut") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!email) return;
  const rut = rutRaw && isValidRut(rutRaw) ? formatRut(rutRaw) : null;

  let contact = await prisma.contact.findFirst({
    where: { OR: [{ email }, ...(rut ? [{ rut }] : [])] },
  });

  if (!contact) {
    let channel = await prisma.channel.findUnique({ where: { name: "Formulario web vamosmipyme.cl" } });
    if (!channel) {
      channel = await prisma.channel.create({ data: { name: "Formulario web vamosmipyme.cl" } });
    }
    contact = await prisma.contact.create({
      data: { firstName, lastName, email, rut, companyName, phone, channelId: channel.id },
    });
    await prisma.timelineEvent.create({
      data: { contactId: contact.id, type: TimelineType.CONTACT_CREATED, title: "Contacto creado", description: "Origen: autoinscripción a evento público" },
    });
  }

  const registration = await prisma.registration.upsert({
    where: { eventId_contactId: { eventId: event.id, contactId: contact.id } },
    update: {},
    create: { eventId: event.id, contactId: contact.id, source: "AUTOINSCRIPCION", ticketCode: ticketCode() },
  });
  await prisma.timelineEvent.create({
    data: { contactId: contact.id, eventId: event.id, type: TimelineType.REGISTERED, title: "Se inscribió al evento (formulario público)" },
  });

  redirect(`/e/${eventSlug}?ticket=${registration.ticketCode}`);
}
