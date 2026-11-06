import { formatDateTime } from "@/lib/format";

export function ImportBatchHistory({
  batches,
}: {
  batches: Array<{ id: string; filename: string; importedAt: Date; rowCount: number; createdCount: number; updatedCount: number; errorCount: number }>;
}) {
  return (
    <div className="card overflow-x-auto">
      <h2 className="font-medium px-4 pt-4">Historial de importaciones</h2>
      <table className="w-full text-sm mt-2">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
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
              <td className="px-4 py-2 font-medium font-mono text-xs">{b.filename}</td>
              <td className="px-4 py-2 text-slate-500">{formatDateTime(b.importedAt)}</td>
              <td className="px-4 py-2">{b.rowCount}</td>
              <td className="px-4 py-2">{b.createdCount}</td>
              <td className="px-4 py-2">{b.updatedCount}</td>
              <td className="px-4 py-2">{b.errorCount}</td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aún no se han importado archivos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
