import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createContact } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoContactoPage() {
  const channels = await prisma.channel.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo contacto</h1>
      <form action={createContact} className="card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="firstName">Nombre</label>
            <input className="input" id="firstName" name="firstName" />
          </div>
          <div>
            <label className="label" htmlFor="lastName">Apellido</label>
            <input className="input" id="lastName" name="lastName" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="rut">RUT</label>
            <input className="input" id="rut" name="rut" placeholder="12.345.678-9" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="phone">Teléfono</label>
            <input className="input" id="phone" name="phone" />
          </div>
          <div>
            <label className="label" htmlFor="companyName">Empresa</label>
            <input className="input" id="companyName" name="companyName" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="sector">Sector</label>
            <input className="input" id="sector" name="sector" />
          </div>
          <div>
            <label className="label" htmlFor="comuna">Comuna</label>
            <input className="input" id="comuna" name="comuna" />
          </div>
          <div>
            <label className="label" htmlFor="region">Región</label>
            <input className="input" id="region" name="region" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="channelId">Canal de origen</label>
            <Link href="/canales" className="text-xs text-brand-600 hover:underline">Gestionar canales</Link>
          </div>
          <select className="input" id="channelId" name="channelId">
            <option value="">— Sin especificar —</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Guardar contacto</button>
      </form>
    </div>
  );
}
