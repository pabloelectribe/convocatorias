import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: string[][] = [
    ["RUT", "Correo", "Nombre", "Apellido", "Empresa", "Rubro", "Banca / Tamaño de empresa", "Teléfono", "Canal", "Segmento a asignar", "Evento al que asistió", "Fecha de inscripción", "Fecha de asistencia"],
    ["12.345.678-5", "camila.rojas@example.cl", "Camila", "Rojas", "Panadería El Trigal", "Gastronomía", "Banca Microempresa", "+56912345678", "Base comercial 2025", "Convocatoria Formalización 10/11", "Webinar financiamiento Sercotec", "10/03/2026", "15/03/2026"],
    ["9.876.543-3", "matias.gonzalez@example.cl", "Matías", "González", "Taller Mecánico González", "Servicios automotrices", "Banca Pyme", "+56987654321", "Instagram", "Convocatoria Formalización 10/11", "Taller de marketing digital", "18/04/2026", "22/04/2026"],
  ];
  return csvResponse("plantilla-contactos-vamosmipyme.csv", rows);
}
