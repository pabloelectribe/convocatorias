"use client";

import { useState } from "react";
import type { CsvPreview } from "@/lib/csv-import";

export interface ImportFieldLabel<K extends string> {
  key: K;
  label: string;
  required?: boolean;
}

/** Regla de auto-mapeo: si el encabezado (en minúsculas) contiene alguna keyword (y ninguna de exclude), se asigna a `key`.
 *  Se evalúan en orden por cada encabezado; la primera regla que calce gana. Es solo datos (no funciones), para poder
 *  pasarlo desde un Server Component a este Client Component. */
export interface AutoMapRule<K extends string> {
  key: K;
  keywords: string[];
  exclude?: string[];
}

export interface ImportResult {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  rowCount: number;
}

function computeAutoMap<K extends string>(headers: string[], rules: AutoMapRule<K>[], singleColumnFallbackKey?: K): Partial<Record<K, string>> {
  const result: Partial<Record<K, string>> = {};
  for (const h of headers) {
    const norm = h.toLowerCase();
    for (const rule of rules) {
      const matches = rule.keywords.some((kw) => norm.includes(kw)) && !rule.exclude?.some((ex) => norm.includes(ex));
      if (matches) {
        result[rule.key] = h;
        break;
      }
    }
  }
  if (singleColumnFallbackKey && !result[singleColumnFallbackKey] && headers.length === 1) {
    result[singleColumnFallbackKey] = headers[0];
  }
  return result;
}

export function CsvImportWizard<K extends string>({
  fieldLabels,
  autoMapRules,
  singleColumnFallbackKey,
  previewAction,
  confirmAction,
  fileHint,
  resultLabels,
}: {
  fieldLabels: ImportFieldLabel<K>[];
  autoMapRules: AutoMapRule<K>[];
  singleColumnFallbackKey?: K;
  previewAction: (fileText: string) => Promise<CsvPreview>;
  confirmAction: (fileText: string, filename: string, mapping: Partial<Record<K, string>>) => Promise<ImportResult>;
  fileHint: string;
  resultLabels: { created: string; updated: string };
}) {
  const [fileText, setFileText] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<K, string>>>({});
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
      const p = await previewAction(text);
      setPreview(p);
      setMapping(computeAutoMap(p.headers, autoMapRules, singleColumnFallbackKey));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el archivo CSV. Verifica el formato.");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm() {
    if (!fileText) return;
    setLoading(true);
    setError(null);
    try {
      const r = await confirmAction(fileText, filename, mapping);
      setResult(r);
      setPreview(null);
      setFileText(null);
    } catch {
      setError("Ocurrió un error al importar. Revisa el mapeo de columnas.");
    } finally {
      setLoading(false);
    }
  }

  const requiredOk = fieldLabels.filter((f) => f.required).every((f) => mapping[f.key]);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <label className="label" htmlFor="csvfile">{fileHint}</label>
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
            {fieldLabels.map((f) => (
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

          <button className="btn-primary" onClick={onConfirm} disabled={loading || !requiredOk}>
            {loading ? "Importando..." : `Importar ${preview.rowCount} filas`}
          </button>
          {!requiredOk && <p className="text-xs text-amber-600">Debes mapear los campos obligatorios (*) para poder importar.</p>}
        </div>
      )}

      {result && (
        <div className="card p-4 bg-green-50 border-green-200 text-green-800">
          <p className="font-medium">Importación completada</p>
          <p className="text-sm">
            {result.rowCount} filas procesadas · {result.createdCount} {resultLabels.created} · {result.updatedCount} {resultLabels.updated} · {result.errorCount} con errores.
          </p>
        </div>
      )}
    </div>
  );
}
