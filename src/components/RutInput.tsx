"use client";

import { useState } from "react";
import { formatRut, isValidRut } from "@/lib/rut";

export function RutInput({
  id,
  name,
  defaultValue,
  required,
}: {
  id?: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ? formatRut(defaultValue) : "");
  const [touched, setTouched] = useState(false);

  const invalid = touched && value.length > 0 && !isValidRut(value);

  return (
    <div>
      <input
        className={`input ${invalid ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
        id={id}
        name={name}
        value={value}
        placeholder="12.345.678-9"
        required={required}
        inputMode="text"
        maxLength={12}
        onChange={(e) => setValue(formatRut(e.target.value))}
        onBlur={() => setTouched(true)}
      />
      {invalid && <p className="mt-1 text-xs text-red-600">RUT inválido (verifica el dígito verificador).</p>}
    </div>
  );
}
