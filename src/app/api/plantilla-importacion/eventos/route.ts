import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: string[][] = [
    ["Título", "Fecha y hora de inicio", "Fecha y hora de término", "Modalidad", "Lugar", "Link de Zoom", "Temática", "Descripción", "Capacidad", "Estado"],
    ["Taller de marketing digital", "22-04-2026 15:00", "22-04-2026 17:00", "Zoom", "", "https://zoom.us/j/123456789", "Marketing digital", "Taller práctico para pymes.", "100", "Publicado"],
    ["Feria de exportadores 2026", "10-05-2026 10:00", "10-05-2026 18:00", "Presencial", "Centro de eventos, Santiago", "", "Exportación", "Encuentro presencial con exportadores pyme.", "300", "Publicado"],
  ];
  return csvResponse("plantilla-eventos-vamosmipyme.csv", rows);
}
