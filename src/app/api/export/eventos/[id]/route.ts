import { prisma } from "@/lib/prisma";
import { csvResponse } from "@/lib/csv-export";
import { rutDisplay, fullName } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      invitations: { include: { contact: true } },
      registrations: { include: { contact: true } },
      attendances: true,
    },
  });
  if (!event) return new Response("No encontrado", { status: 404 });

  const attendedIds = new Set(event.attendances.map((a) => a.contactId));
  const registeredByContact = new Map(event.registrations.map((r) => [r.contactId, r]));

  const contactsById = new Map<string, (typeof event.invitations)[number]["contact"]>();
  for (const inv of event.invitations) contactsById.set(inv.contactId, inv.contact);
  for (const reg of event.registrations) contactsById.set(reg.contactId, reg.contact);

  const invitationByContact = new Map(event.invitations.map((i) => [i.contactId, i]));

  const rows: string[][] = [
    ["Nombre", "RUT", "Email", "Empresa", "Estado invitación", "Inscrito", "Código de ticket", "Asistió"],
  ];
  for (const [contactId, contact] of contactsById) {
    const invitation = invitationByContact.get(contactId);
    const registration = registeredByContact.get(contactId);
    rows.push([
      fullName(contact),
      rutDisplay(contact.rut),
      contact.email || "",
      contact.companyName || "",
      invitation ? invitation.status : "Sin invitación (autoinscrito)",
      registration ? "Sí" : "No",
      registration?.ticketCode || "",
      attendedIds.has(contactId) ? "Sí" : "No",
    ]);
  }

  return csvResponse(`evento-${event.slug}.csv`, rows);
}
