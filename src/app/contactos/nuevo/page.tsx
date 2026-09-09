import { prisma } from "@/lib/prisma";
import { ContactForm } from "../ContactForm";
import { createContact } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoContactoPage() {
  const channels = await prisma.channel.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo contacto</h1>
      <ContactForm action={createContact} channels={channels} submitLabel="Guardar contacto" />
    </div>
  );
}
