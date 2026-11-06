import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { CsvImportWizard, type ImportFieldLabel, type AutoMapRule } from "@/components/CsvImportWizard";
import { ImportBatchHistory } from "@/components/ImportBatchHistory";
import { previewCsv, confirmImport, type CsvMapping } from "./actions";

export const dynamic = "force-dynamic";

const FIELD_LABELS: ImportFieldLabel<keyof CsvMapping>[] = [
  { key: "rut", label: "RUT" },
  { key: "email", label: "Email" },
  { key: "segmentName", label: "Nombre del segmento", required: true },
];

const AUTO_MAP_RULES: AutoMapRule<keyof CsvMapping>[] = [
  { key: "rut", keywords: ["rut"] },
  { key: "email", keywords: ["mail", "correo"] },
  { key: "segmentName", keywords: ["segmento", "lista", "grupo"] },
];

export default async function ImportarSegmentosPage() {
  const batches = await prisma.importBatch.findMany({ where: { kind: ImportKind.SEGMENTOS }, orderBy: { importedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Importar segmentos</h1>
          <p className="text-sm text-slate-500">
            Asigna contactos ya existentes a segmentos en bloque (una fila = un contacto + el segmento al que pertenece).
            El segmento se crea si no existe. Los contactos deben existir previamente (identificados por RUT o email) —
            si no los encuentra, esa fila queda como error.
          </p>
          <Link href="/importar" className="text-sm text-brand-600 hover:underline">← Volver a importaciones</Link>
        </div>
        <a href="/api/plantilla-importacion/segmentos" className="btn-secondary shrink-0">⬇ Plantilla de ejemplo</a>
      </div>

      <CsvImportWizard
        fieldLabels={FIELD_LABELS}
        autoMapRules={AUTO_MAP_RULES}
        previewAction={previewCsv}
        confirmAction={confirmImport}
        fileHint="Selecciona el archivo CSV de segmentos"
        resultLabels={{ created: "asignaciones nuevas", updated: "ya estaban en el segmento" }}
      />

      <ImportBatchHistory batches={batches} />
    </div>
  );
}
