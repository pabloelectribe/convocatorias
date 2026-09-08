import { prisma } from "@/lib/prisma";
import { createChannel, renameChannel } from "./actions";
import { DeleteChannelButton } from "./DeleteChannelButton";

export const dynamic = "force-dynamic";

export default async function CanalesPage() {
  const channels = await prisma.channel.findMany({
    include: { _count: { select: { contacts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Canales de origen</h1>
        <p className="text-sm text-slate-500">
          De dónde llegan los contactos (formulario web, feria, redes sociales, referidos, importaciones, etc.).
          Se usan para saber por qué canal se captó a cada cliente.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Contactos</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <form action={renameChannel.bind(null, c.id)} className="flex items-center gap-2">
                      <input className="input" name="name" defaultValue={c.name} />
                      <button className="btn-secondary shrink-0" type="submit">Guardar</button>
                    </form>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{c._count.contacts}</td>
                  <td className="px-4 py-2 text-right">
                    <DeleteChannelButton channelId={c.id} channelName={c.name} contactCount={c._count.contacts} />
                  </td>
                </tr>
              ))}
              {channels.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Aún no hay canales.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={createChannel} className="card p-4 space-y-3 h-fit">
          <h2 className="font-medium">Nuevo canal</h2>
          <div>
            <label className="label" htmlFor="name">Nombre</label>
            <input className="input" id="name" name="name" placeholder="Ej: Instagram Ads" required />
          </div>
          <button className="btn-primary w-full" type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
}
