"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createSegment(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!name) throw new Error("El nombre es obligatorio");
  const segment = await prisma.segment.create({ data: { name, description } });
  revalidatePath("/segmentos");
  redirect(`/segmentos/${segment.id}`);
}

export async function addMemberByRutOrEmail(segmentId: string, formData: FormData) {
  "use server";
  const query = String(formData.get("query") || "").trim();
  if (!query) return;
  const contact = await prisma.contact.findFirst({
    where: { OR: [{ rut: query }, { email: query }] },
  });
  if (!contact) return;
  await prisma.segmentMember.upsert({
    where: { segmentId_contactId: { segmentId, contactId: contact.id } },
    update: {},
    create: { segmentId, contactId: contact.id },
  });
  revalidatePath(`/segmentos/${segmentId}`);
}

export async function removeMember(segmentId: string, contactId: string) {
  "use server";
  await prisma.segmentMember.delete({ where: { segmentId_contactId: { segmentId, contactId } } }).catch(() => {});
  revalidatePath(`/segmentos/${segmentId}`);
}
