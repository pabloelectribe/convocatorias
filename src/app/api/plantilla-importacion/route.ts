import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: string[][] = [
    ["RUT", "Correo", "Nombre", "Apellido", "Empresa", "Teléfono", "Actividad", "Fecha", "Canal"],
    ["12.345.678-5", "camila.rojas@example.cl", "Camila", "Rojas", "Panadería El Trigal", "+56912345678", "Webinar financiamiento Sercotec", "15/03/2026", "Formulario web vamosmipyme.cl"],
    ["9.876.543-3", "matias.gonzalez@example.cl", "Matías", "González", "Taller Mecánico González", "+56987654321", "Taller de marketing digital", "22/04/2026", "Feria presencial"],
  ];
  return csvResponse("plantilla-importacion-vamosmipyme.csv", rows);
}
