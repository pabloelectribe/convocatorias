"use server";

import { seedDemoData } from "@/lib/seedDemoData";
import { revalidatePath } from "next/cache";

export async function runSeed() {
  "use server";
  const result = await seedDemoData();
  revalidatePath("/");
  revalidatePath("/contactos");
  revalidatePath("/segmentos");
  revalidatePath("/eventos");
  return result;
}
