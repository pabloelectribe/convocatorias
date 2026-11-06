"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { fullName, rutDisplay } from "@/lib/format";
import { bulkAddToSegment } from "./actions";

export interface ContactRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  rut: string | null;
  companyName: string | null;
  channel: { name: string } | null;
  tags: { tagId: string; tag: { name: string } }[];
}

export function ContactsTable({ contacts, segments }: { contacts: ContactRow[]; segments: { id: string; name: string }[] }) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [allChecked, setAllChecked] = useState(false);

  function getCheckboxes(): HTMLInputElement[] {
    return Array.from(bodyRef.current?.querySelectorAll<HTMLInputElement>('input[name="contactIds"]') ?? []);
  }

  function recount() {
    const boxes = getCheckboxes();
    const checked = boxes.filter((b) => b.checked).length;
    setSelectedCount(checked);
    setAllChecked(boxes.length > 0 && checked === boxes.length);
  }

  function toggleAll(checked: boolean) {
    getCheckboxes().forEach((b) => { b.checked = checked; });
    recount();
  }

  return (
    <form action={bulkAddToSegment} className="space-y-3">
      {selectedCount > 0 && (
        <div className="card p-3 flex flex-wrap items-center gap-3 bg-brand-50 border-brand-200">
          <span className="text-sm font-medium text-brand-800">{selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}</span>
          <select className="input max-w-xs" name="segmentId" required defaultValue="">
            <option value="" disabled>Seleccionar segmento...</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="btn-primary" type="submit">Asignar a segmento</button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 w-8">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos"
                  checked={allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">RUT</th>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Canal</th>
              <th className="px-4 py-2 font-medium">Temas</th>
            </tr>
          </thead>
          <tbody ref={bodyRef} className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <input type="checkbox" name="contactIds" value={c.id} onChange={recount} />
                </td>
                <td className="px-4 py-2">
                  <Link href={`/contactos/${c.id}`} className="font-medium text-brand-700 hover:underline">
                    {fullName(c)}
                  </Link>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>
                <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{rutDisplay(c.rut)}</td>
                <td className="px-4 py-2 text-slate-600">{c.companyName || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{c.channel?.name || "—"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span key={t.tagId} className="badge bg-brand-50 text-brand-700">{t.tag.name}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </form>
  );
}
