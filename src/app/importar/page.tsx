import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind, IMPORT_KIND_LABEL } from "@/lib/enums";
import { ImportBatchHistory } from "@/components/ImportBatchHistory";

export const dynamic = "force-dynamic";

const CARDS: Array<{ kind: keyof typeof ImportKind; href: string; description: string }> = [
  { kind: "CONTACTOS", href: "/importar/contactos", description: "Base de clientes/prospectos, con su historial de asistencia a eventos si lo tienes." },
  { kind: "EVENTOS", href: "/importar/eventos", description: "Crea o actualiza fichas de evento en bloque (título, fecha, modalidad, lugar)." },
  { kind: "SEGMENTOS", href: "/importar/segmentos", description: "Asigna contactos ya existentes a segmentos/listas en bloque." },
  { kind: "CANALES", href: "/importar/canales", description: "Crea canales de origen en bloque." },
];

export default async function ImportarPage() {
  const batches = await prisma.importBatch.findMany({ orderBy: { importedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Importar datos</h1>
        <p className="text-sm text-slate-500">
          Cada tipo de dato tiene su propio CSV y plantilla de ejemplo, para que los trabajes por separado.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CARDS.map((c) => (
          <Link key={c.kind} href={c.href} className="card p-4 hover:border-brand-300 transition-colors">
            <h2 className="font-medium text-brand-700">{IMPORT_KIND_LABEL[c.kind]}</h2>
            <p className="text-sm text-slate-500 mt-1">{c.description}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-medium mb-2">Historial de todas las importaciones</h2>
        <ImportBatchHistoryWithKind batches={batches} />
      </div>
    </div>
  );
}

function ImportBatchHistoryWithKind({
  batches,
}: {
  batches: Array<{ id: string; kind: string; filename: string; importedAt: Date; rowCount: number; createdCount: number; updatedCount: number; errorCount: number }>;
}) {
  if (batches.length === 0) {
    return <ImportBatchHistory batches={[]} />;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">Tipo</th>
            <th className="px-4 py-2 font-medium">Archivo</th>
            <th className="px-4 py-2 font-medium">Fecha</th>
            <th className="px-4 py-2 font-medium">Filas</th>
            <th className="px-4 py-2 font-medium">Nuevos</th>
            <th className="px-4 py-2 font-medium">Actualizados</th>
            <th className="px-4 py-2 font-medium">Errores</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-2"><span className="badge bg-slate-100 text-slate-600">{IMPORT_KIND_LABEL[b.kind as keyof typeof ImportKind] ?? b.kind}</span></td>
              <td className="px-4 py-2 font-medium font-mono text-xs">{b.filename}</td>
              <td className="px-4 py-2 text-slate-500">{new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" }).format(b.importedAt)}</td>
              <td className="px-4 py-2">{b.rowCount}</td>
              <td className="px-4 py-2">{b.createdCount}</td>
              <td className="px-4 py-2">{b.updatedCount}</td>
              <td className="px-4 py-2">{b.errorCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
