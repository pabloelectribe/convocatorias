import { SeedButton } from "./SeedButton";

export default function SeedPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Datos de ejemplo</h1>
        <p className="text-sm text-slate-500">
          Esta acción borra todos los contactos, segmentos, eventos, invitaciones e importaciones
          actuales de la base de datos y los reemplaza por un set de datos ficticios pensado para
          explorar el prototipo (contactos, segmentos, eventos pasados y futuros, invitaciones,
          inscripciones y asistencias ya cargadas).
        </p>
        <p className="text-sm text-amber-700 bg-amber-50 rounded-md p-3 mt-3">
          ⚠️ No la uses si ya cargaste datos reales que quieras conservar: es destructiva y no se
          puede deshacer.
        </p>
      </div>
      <SeedButton />
    </div>
  );
}
