"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChannel(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.channel.upsert({ where: { name }, update: {}, create: { name } });
  revalidatePath("/canales");
}

export async function renameChannel(channelId: string, formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const clash = await prisma.channel.findUnique({ where: { name } });
  if (clash && clash.id !== channelId) return;
  await prisma.channel.update({ where: { id: channelId }, data: { name } });
  revalidatePath("/canales");
}

export async function deleteChannel(channelId: string) {
  "use server";
  await prisma.contact.updateMany({ where: { channelId }, data: { channelId: null } });
  await prisma.channel.delete({ where: { id: channelId } });
  revalidatePath("/canales");
  revalidatePath("/contactos");
}
