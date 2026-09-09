import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "../../ContactForm";
import { updateContact } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarContactoPage({ params }: { params: { id: string } }) {
  const [contact, channels] = await Promise.all([
    prisma.contact.findUnique({ where: { id: params.id } }),
    prisma.channel.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!contact) notFound();

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar contacto</h1>
        <Link href={`/contactos/${contact.id}`} className="btn-secondary">← Volver</Link>
      </div>
      <ContactForm action={updateContact.bind(null, contact.id)} channels={channels} values={contact} submitLabel="Guardar cambios" />
    </div>
  );
}
