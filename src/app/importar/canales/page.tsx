import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { CsvImportWizard, type ImportFieldLabel } from "@/components/CsvImportWizard";
import { ImportBatchHistory } from "@/components/ImportBatchHistory";
import { previewCsv, confirmImport, type CsvMapping } from "./actions";

export const dynamic = "force-dynamic";

const FIELD_LABELS: ImportFieldLabel<keyof CsvMapping>[] = [
  { key: "name", label: "Nombre del canal", required: true },
];

function autoMap(headers: string[]): Partial<CsvMapping> {
  const auto: Partial<CsvMapping> = {};
  for (const h of headers) {
    const norm = h.toLowerCase();
    if (norm.includes("canal") || norm.includes("nombre") || norm.includes("origen")) auto.name = h;
  }
  if (!auto.name && headers.length === 1) auto.name = headers[0];
  return auto;
}

export default async function ImportarCanalesPage() {
  const batches = await prisma.importBatch.findMany({ where: { kind: ImportKind.CANALES }, orderBy: { importedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Importar canales</h1>
          <p className="text-sm text-slate-500">
            Crea canales de origen en bloque (una fila = un canal). Si ya existe uno con ese nombre, no se duplica.
          </p>
          <Link href="/importar" className="text-sm text-brand-600 hover:underline">← Volver a importaciones</Link>
        </div>
        <a href="/api/plantilla-importacion/canales" className="btn-secondary shrink-0">⬇ Plantilla de ejemplo</a>
      </div>

      <CsvImportWizard
        fieldLabels={FIELD_LABELS}
        autoMap={autoMap}
        previewAction={previewCsv}
        confirmAction={confirmImport}
        fileHint="Selecciona el archivo CSV de canales"
        resultLabels={{ created: "canales nuevos", updated: "ya existían" }}
      />

      <ImportBatchHistory batches={batches} />
    </div>
  );
}
