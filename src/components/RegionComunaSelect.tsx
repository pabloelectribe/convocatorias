"use client";

import { useState } from "react";
import { CHILE_REGIONS, COMUNAS_BY_REGION } from "@/lib/chile-regions";

export function RegionComunaSelect({
  defaultRegion,
  defaultComuna,
}: {
  defaultRegion?: string | null;
  defaultComuna?: string | null;
}) {
  const [region, setRegion] = useState(defaultRegion || "");
  const comunas = region ? COMUNAS_BY_REGION[region] || [] : [];

  return (
    <>
      <div>
        <label className="label" htmlFor="region">Región</label>
        <select
          className="input"
          id="region"
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">— Sin especificar —</option>
          {CHILE_REGIONS.map((r) => (
            <option key={r.region} value={r.region}>{r.region}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="comuna">Comuna</label>
        <select
          key={region}
          className="input"
          id="comuna"
          name="comuna"
          defaultValue={region === (defaultRegion || "") ? defaultComuna || "" : ""}
          disabled={!region}
        >
          <option value="">{region ? "— Sin especificar —" : "Elige región primero"}</option>
          {comunas.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </>
  );
}
