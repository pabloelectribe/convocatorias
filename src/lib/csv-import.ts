import { parse } from "csv-parse/sync";

export interface CsvPreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  rowCount: number;
}

/** Excel en español suele exportar CSV separado por ";" en vez de ",". Detectamos por la primera línea con contenido. */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

export function parseCsvText(text: string): Record<string, string>[] {
  if (text.charCodeAt(0) === 0xfffd || /^PK\x03\x04/.test(text) || text.slice(0, 2) === "PK") {
    throw new Error("El archivo parece ser un Excel (.xlsx) y no un CSV. En Excel usa \"Guardar como\" → CSV (UTF-8) y vuelve a subirlo.");
  }
  try {
    return parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      delimiter: detectDelimiter(text),
      relax_column_count: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "formato inválido";
    throw new Error(`No se pudo leer el CSV (${msg}). Revisa que el archivo esté exportado correctamente como CSV.`);
  }
}

export function previewRows(text: string): CsvPreview {
  const rows = parseCsvText(text);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, sampleRows: rows.slice(0, 5), rowCount: rows.length };
}
