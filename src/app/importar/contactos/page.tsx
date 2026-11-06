import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImportKind } from "@/lib/enums";
import { CsvImportWizard, type ImportFieldLabel } from "@/components/CsvImportWizard";
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

function autoMap(headers: string[]): Partial<CsvMapping> {
  const auto: Partial<CsvMapping> = {};
  for (const h of headers) {
    const norm = h.toLowerCase();
    if (norm.includes("rut")) auto.rut = h;
    else if (norm.includes("mail") || norm.includes("correo")) auto.email = h;
    else if (norm.includes("nombre") && !norm.includes("apellido")) auto.firstName = h;
    else if (norm.includes("apellido")) auto.lastName = h;
    else if (norm.includes("empresa") || norm.includes("razon")) auto.companyName = h;
    else if (norm.includes("fono") || norm.includes("telefono")) auto.phone = h;
    else if (norm.includes("evento")) auto.eventName = h;
    else if (norm.includes("actividad") || norm.includes("formulario")) auto.activity = h;
    else if (norm.includes("inscrip")) auto.registeredAt = h;
    else if (norm.includes("fecha")) auto.date = h;
    else if (norm.includes("canal") || norm.includes("origen")) auto.channel = h;
  }
  return auto;
}

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
        autoMap={autoMap}
        previewAction={previewCsv}
        confirmAction={confirmImport}
        fileHint="Selecciona el archivo CSV de contactos"
        resultLabels={{ created: "contactos nuevos", updated: "actualizados" }}
      />

      <ImportBatchHistory batches={batches} />
    </div>
  );
}
