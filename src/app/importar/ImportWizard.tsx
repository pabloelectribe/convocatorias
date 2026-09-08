"use client";

import { useState } from "react";
import { previewCsv, confirmImport, type CsvPreview, type CsvMapping, type ImportResult } from "./actions";

const FIELD_LABELS: Array<{ key: keyof CsvMapping; label: string; required?: boolean }> = [
  { key: "rut", label: "RUT" },
  { key: "email", label: "Email", required: true },
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "companyName", label: "Empresa" },
  { key: "phone", label: "Teléfono" },
  { key: "activity", label: "Actividad / formulario registrado" },
  { key: "date", label: "Fecha de la actividad" },
  { key: "channel", label: "Canal de origen" },
];

export function ImportWizard() {
  const [fileText, setFileText] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setFilename(file.name);
    const text = await file.text();
    setFileText(text);
    setLoading(true);
    try {
      const p = await previewCsv(text);
      setPreview(p);
      const auto: CsvMapping = {};
      for (const h of p.headers) {
        const norm = h.toLowerCase();
        if (norm.includes("rut")) auto.rut = h;
        else if (norm.includes("mail") || norm.includes("correo")) auto.email = h;
        else if (norm.includes("nombre") && !norm.includes("apellido")) auto.firstName = h;
        else if (norm.includes("apellido")) auto.lastName = h;
        else if (norm.includes("empresa") || norm.includes("razon")) auto.companyName = h;
        else if (norm.includes("fono") || norm.includes("telefono")) auto.phone = h;
        else if (norm.includes("actividad") || norm.includes("evento") || norm.includes("formulario")) auto.activity = h;
        else if (norm.includes("fecha")) auto.date = h;
        else if (norm.includes("canal") || norm.includes("origen")) auto.channel = h;
      }
      setMapping(auto);
    } catch (err) {
      setError("No se pudo leer el archivo CSV. Verifica el formato.");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm() {
    if (!fileText) return;
    setLoading(true);
    setError(null);
    try {
      const r = await confirmImport(fileText, filename, mapping);
      setResult(r);
      setPreview(null);
      setFileText(null);
    } catch (err) {
      setError("Ocurrió un error al importar. Revisa el mapeo de columnas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <label className="label" htmlFor="csvfile">Selecciona el archivo CSV exportado desde vamosmipyme.cl</label>
        <input id="csvfile" type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
        {loading && <p className="text-sm text-slate-500 mt-2">Procesando...</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {preview && (
        <div className="card p-4 space-y-4">
          <div>
            <h2 className="font-medium">Mapeo de columnas</h2>
            <p className="text-sm text-slate-500">{preview.rowCount} filas detectadas. Indica qué columna corresponde a cada campo.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {FIELD_LABELS.map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}{f.required && " *"}</label>
                <select
                  className="input"
                  value={mapping[f.key] || ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))}
                >
                  <option value="">— No mapear —</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Vista previa (primeras filas)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {preview.headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left bg-slate-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {preview.headers.map((h) => (
                        <td key={h} className="px-2 py-1">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn-primary" onClick={onConfirm} disabled={loading || !mapping.email}>
            {loading ? "Importando..." : `Importar ${preview.rowCount} filas`}
          </button>
          {!mapping.email && <p className="text-xs text-amber-600">Debes mapear al menos el campo Email para poder importar.</p>}
        </div>
      )}

      {result && (
        <div className="card p-4 bg-green-50 border-green-200 text-green-800">
          <p className="font-medium">Importación completada</p>
          <p className="text-sm">
            {result.rowCount} filas procesadas · {result.createdCount} contactos nuevos · {result.updatedCount} actualizados · {result.errorCount} con errores.
          </p>
        </div>
      )}
    </div>
  );
}
