import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { CsvImportWizard, type ImportFieldLabel } from "@/components/CsvImportWizard";
import { ImportBatchHistory } from "@/components/ImportBatchHistory";
import { previewCsv, confirmImport, type CsvMapping } from "./actions";

export const dynamic = "force-dynamic";

const FIELD_LABELS: ImportFieldLabel<keyof CsvMapping>[] = [
  { key: "title", label: "Título", required: true },
  { key: "startAt", label: "Fecha y hora de inicio", required: true },
  { key: "endAt", label: "Fecha y hora de término" },
  { key: "modality", label: "Modalidad (Zoom/Presencial/Híbrido)" },
  { key: "location", label: "Lugar" },
  { key: "zoomLink", label: "Link de Zoom" },
  { key: "topic", label: "Temática" },
  { key: "description", label: "Descripción" },
  { key: "capacity", label: "Capacidad" },
  { key: "status", label: "Estado (Borrador/Publicado/Finalizado/Cancelado)" },
];

function autoMap(headers: string[]): Partial<CsvMapping> {
  const auto: Partial<CsvMapping> = {};
  for (const h of headers) {
    const norm = h.toLowerCase();
    if (norm.includes("titulo") || norm === "evento") auto.title = h;
    else if (norm.includes("termino") || norm.includes("fin")) auto.endAt = h;
    else if (norm.includes("inicio") || norm.includes("fecha")) auto.startAt = h;
    else if (norm.includes("modalidad")) auto.modality = h;
    else if (norm.includes("lugar") || norm.includes("direccion")) auto.location = h;
    else if (norm.includes("zoom")) auto.zoomLink = h;
    else if (norm.includes("tematica") || norm.includes("categoria")) auto.topic = h;
    else if (norm.includes("descripcion")) auto.description = h;
    else if (norm.includes("capacidad") || norm.includes("cupos")) auto.capacity = h;
    else if (norm.includes("estado")) auto.status = h;
  }
  return auto;
}

export default async function ImportarEventosPage() {
  const batches = await prisma.importBatch.findMany({ where: { kind: ImportKind.EVENTOS }, orderBy: { importedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Importar eventos</h1>
          <p className="text-sm text-slate-500">
            Crea o actualiza fichas de evento en bloque. Se identifican por título (si ya existe uno con el mismo título,
            se actualiza en vez de duplicarlo).
          </p>
          <Link href="/importar" className="text-sm text-brand-600 hover:underline">← Volver a importaciones</Link>
        </div>
        <a href="/api/plantilla-importacion/eventos" className="btn-secondary shrink-0">⬇ Plantilla de ejemplo</a>
      </div>

      <CsvImportWizard
        fieldLabels={FIELD_LABELS}
        autoMap={autoMap}
        previewAction={previewCsv}
        confirmAction={confirmImport}
        fileHint="Selecciona el archivo CSV de eventos"
        resultLabels={{ created: "eventos nuevos", updated: "actualizados" }}
      />

      <ImportBatchHistory batches={batches} />
    </div>
  );
}
