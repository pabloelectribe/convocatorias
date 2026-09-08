"use server";

import { prisma } from "@/lib/prisma";
import { TimelineType, InvitationStatus } from "@/lib/enums";
import { ticketCode } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function respondInvitation(token: string, response: "confirm" | "decline") {
  "use server";
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return;

  if (response === "decline") {
    await prisma.invitation.update({
      where: { token },
      data: { status: InvitationStatus.DECLINADA, respondedAt: new Date() },
    });
    await prisma.timelineEvent.create({
      data: { contactId: invitation.contactId, eventId: invitation.eventId, type: TimelineType.DECLINED, title: "Invitación declinada" },
    });
  } else {
    await prisma.invitation.update({
      where: { token },
      data: { status: InvitationStatus.REGISTRADA, respondedAt: new Date() },
    });
    await prisma.registration.upsert({
      where: { eventId_contactId: { eventId: invitation.eventId, contactId: invitation.contactId } },
      update: {},
      create: { eventId: invitation.eventId, contactId: invitation.contactId, source: "INVITACION", ticketCode: ticketCode() },
    });
    await prisma.timelineEvent.create({
      data: { contactId: invitation.contactId, eventId: invitation.eventId, type: TimelineType.REGISTERED, title: "Confirmó su inscripción vía invitación" },
    });
  }
  revalidatePath(`/invitacion/${token}`);
}
