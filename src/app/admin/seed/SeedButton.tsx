"use client";

import { useState } from "react";
import { runSeed } from "./actions";

const CONFIRM_WORD = "REEMPLAZAR";

export function SeedButton() {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ contactCount: number } | null>(null);

  async function onClick() {
    setLoading(true);
    try {
      const r = await runSeed();
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-4 space-y-3 max-w-lg">
      <div>
        <label className="label" htmlFor="confirm">
          Escribe <span className="font-mono">{CONFIRM_WORD}</span> para confirmar
        </label>
        <input
          className="input"
          id="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_WORD}
        />
      </div>
      <button
        className="btn-danger"
        disabled={confirmText !== CONFIRM_WORD || loading}
        onClick={onClick}
      >
        {loading ? "Cargando..." : "Borrar todo y cargar datos de ejemplo"}
      </button>
      {result && (
        <p className="text-sm text-green-700 bg-green-50 rounded-md p-3">
          Listo: se crearon {result.contactCount} contactos de ejemplo, segmentos, eventos e invitaciones ficticias.
        </p>
      )}
    </div>
  );
}
