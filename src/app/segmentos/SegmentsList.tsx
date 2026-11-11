"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { bulkDeleteSegments } from "./actions";

export interface SegmentRow {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export function SegmentsList({ segments }: { segments: SegmentRow[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  function getCheckboxes(): HTMLInputElement[] {
    return Array.from(listRef.current?.querySelectorAll<HTMLInputElement>('input[name="segmentIds"]') ?? []);
  }

  function recount() {
    setSelectedCount(getCheckboxes().filter((b) => b.checked).length);
  }

  function selectAll(checked: boolean) {
    getCheckboxes().forEach((b) => { b.checked = checked; });
    recount();
  }

  function selectByMaxMembers(max: number) {
    getCheckboxes().forEach((b) => {
      b.checked = Number(b.dataset.count) <= max;
    });
    recount();
  }

  function onSubmit(e: React.FormEvent) {
    if (!confirm(`¿Eliminar ${selectedCount} segmento(s) seleccionado(s)? Esto no se puede deshacer. Los contactos y sus invitaciones no se eliminan, solo dejan de pertenecer a estos segmentos.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={bulkDeleteSegments} onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" className="text-brand-600 hover:underline" onClick={() => selectAll(true)}>Seleccionar todos</button>
        <span className="text-slate-300">·</span>
        <button type="button" className="text-brand-600 hover:underline" onClick={() => selectByMaxMembers(1)}>Seleccionar con 1 contacto o menos</button>
        <span className="text-slate-300">·</span>
        <button type="button" className="text-slate-500 hover:underline" onClick={() => selectAll(false)}>Limpiar selección</button>
        {selectedCount > 0 && (
          <>
            <span className="ml-auto font-medium text-slate-700">{selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}</span>
            <button className="btn-danger" type="submit">🗑 Eliminar seleccionados</button>
          </>
        )}
      </div>

      <div ref={listRef} className="card divide-y divide-slate-100">
        {segments.map((s) => (
          <label key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" name="segmentIds" value={s.id} data-count={s.memberCount} onChange={recount} />
            <Link href={`/segmentos/${s.id}`} className="flex-1 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div>
                <p className="font-medium text-brand-700">{s.name}</p>
                {s.description && <p className="text-sm text-slate-500">{s.description}</p>}
              </div>
              <span className="badge bg-slate-100 text-slate-700">{s.memberCount} contactos</span>
            </Link>
          </label>
        ))}
        {segments.length === 0 && <p className="px-4 py-8 text-center text-slate-400">Aún no hay segmentos.</p>}
      </div>
    </form>
  );
}
