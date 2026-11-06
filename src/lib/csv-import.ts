import { parse } from "csv-parse/sync";

export interface CsvPreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  rowCount: number;
}

export function parseCsvText(text: string): Record<string, string>[] {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

export function previewRows(text: string): CsvPreview {
  const rows = parseCsvText(text);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, sampleRows: rows.slice(0, 5), rowCount: rows.length };
}
