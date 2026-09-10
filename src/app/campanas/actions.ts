"use server";

import { prisma } from "@/lib/prisma";
import { TimelineType } from "@/lib/enums";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const medium = String(formData.get("medium") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!name || !medium) throw new Error("Nombre y medio son obligatorios");

  const campaign = await prisma.campaign.create({ data: { name, medium, notes } });
  revalidatePath("/campanas");
  redirect(`/campanas/${campaign.id}`);
}

async function logTouch(campaignId: string, contactId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return;
  const touch = await prisma.campaignTouch.create({ data: { campaignId, contactId } });
  await prisma.timelineEvent.create({
    data: {
      contactId,
      type: TimelineType.CAMPAIGN_TOUCH,
      title: `Contacto por ${campaign.medium}`,
      description: campaign.name,
      occurredAt: touch.occurredAt,
    },
  });
}

export async function logTouchForSegment(campaignId: string, formData: FormData) {
  "use server";
  const segmentId = String(formData.get("segmentId") || "");
  if (!segmentId) return;
  const members = await prisma.segmentMember.findMany({ where: { segmentId }, select: { contactId: true } });
  for (const m of members) {
    await logTouch(campaignId, m.contactId);
  }
  revalidatePath(`/campanas/${campaignId}`);
}

export async function logTouchForContact(campaignId: string, formData: FormData) {
  "use server";
  const query = String(formData.get("query") || "").trim();
  if (!query) return;
  const contact = await prisma.contact.findFirst({ where: { OR: [{ rut: query }, { email: query }] } });
  if (!contact) return;
  await logTouch(campaignId, contact.id);
  revalidatePath(`/campanas/${campaignId}`);
}

export async function logTouchFromContactPage(contactId: string, formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  if (!campaignId) return;
  await logTouch(campaignId, contactId);
  revalidatePath(`/contactos/${contactId}`);
  revalidatePath(`/campanas/${campaignId}`);
}
