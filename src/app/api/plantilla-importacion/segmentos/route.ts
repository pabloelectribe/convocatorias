import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: string[][] = [
    ["RUT", "Correo", "Nombre del segmento"],
    ["12.345.678-5", "camila.rojas@example.cl", "Exportadores"],
    ["9.876.543-3", "matias.gonzalez@example.cl", "Región Metropolitana"],
  ];
  return csvResponse("plantilla-segmentos-vamosmipyme.csv", rows);
}
