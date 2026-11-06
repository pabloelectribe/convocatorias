import { csvResponse } from "@/lib/csv-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: string[][] = [
    ["Nombre del canal"],
    ["Feria presencial"],
    ["Instagram"],
    ["Base comercial 2025"],
  ];
  return csvResponse("plantilla-canales-vamosmipyme.csv", rows);
}
