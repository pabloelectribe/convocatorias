import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { CsvImportWizard, type ImportFieldLabel, type AutoMapRule } from "@/components/CsvImportWizard";
import { ImportBatchHistory } from "@/components/ImportBatchHistory";
import { previewCsv, confirmImport, type CsvMapping } from "./actions";

export const dynamic = "force-dynamic";

const FIELD_LABELS: ImportFieldLabel<keyof CsvMapping>[] = [
  { key: "rut", label: "RUT" },
  { key: "email", label: "Email", required: true },
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "companyName", label: "Empresa" },
  { key: "phone", label: "Teléfono" },
  { key: "channel", label: "Canal de origen" },
  { key: "eventName", label: "Evento al que asistió (historial)" },
  { key: "date", label: "Fecha de asistencia" },
  { key: "registeredAt", label: "Fecha de inscripción (opcional)" },
  { key: "activity", label: "Actividad / formulario (si no es un evento con ficha propia)" },
];

const AUTO_MAP_RULES: AutoMapRule<keyof CsvMapping>[] = [
  { key: "rut", keywords: ["rut"] },
  { key: "email", keywords: ["mail", "correo"] },
  { key: "firstName", keywords: ["nombre"], exclude: ["apellido"] },
  { key: "lastName", keywords: ["apellido"] },
  { key: "companyName", keywords: ["empresa", "razon"] },
  { key: "phone", keywords: ["fono", "telefono"] },
  { key: "eventName", keywords: ["evento"] },
  { key: "activity", keywords: ["actividad", "formulario"] },
  { key: "registeredAt", keywords: ["inscrip"] },
  { key: "date", keywords: ["fecha"] },
  { key: "channel", keywords: ["canal", "origen"] },
];

export default async function ImportarContactosPage() {
  const batches = await prisma.importBatch.findMany({ where: { kind: ImportKind.CONTACTOS }, orderBy: { importedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Importar contactos</h1>
          <p className="text-sm text-slate-500">
            Sube el CSV exportado manualmente desde vamosmipyme.cl, o una base histórica de clientes. Se identifican por RUT
            o email: si ya existen, se enriquecen sus datos; si son nuevos, se crean. Si mapeas la columna "Evento al que
            asistió", además registra su inscripción y asistencia a ese evento (lo crea si no existe).
          </p>
          <Link href="/importar" className="text-sm text-brand-600 hover:underline">← Volver a importaciones</Link>
        </div>
        <a href="/api/plantilla-importacion/contactos" className="btn-secondary shrink-0">⬇ Plantilla de ejemplo</a>
      </div>

      <CsvImportWizard
        fieldLabels={FIELD_LABELS}
        autoMapRules={AUTO_MAP_RULES}
        previewAction={previewCsv}
        confirmAction={confirmImport}
        fileHint="Selecciona el archivo CSV de contactos"
        resultLabels={{ created: "contactos nuevos", updated: "actualizados" }}
      />

      <ImportBatchHistory batches={batches} />
    </div>
  );
}
