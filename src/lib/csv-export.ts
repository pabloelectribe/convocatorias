/** Convierte filas de texto a CSV (separado por comas, compatible con Excel/Chile). */
export function toCsv(rows: string[][]): string {
  const escape = (value: string) => {
    if (/[",\n;]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const body = rows.map((row) => row.map((cell) => escape(cell ?? "")).join(",")).join("\r\n");
  // BOM para que Excel detecte UTF-8 y muestre bien las tildes/ñ.
  return "﻿" + body;
}

export function csvResponse(filename: string, rows: string[][]): Response {
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
