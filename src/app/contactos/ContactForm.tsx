import Link from "next/link";
import { RutInput } from "@/components/RutInput";

export interface ContactFormValues {
  firstName?: string | null;
  lastName?: string | null;
  rut?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  sector?: string | null;
  comuna?: string | null;
  region?: string | null;
  channelId?: string | null;
}

export function ContactForm({
  action,
  channels,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  channels: { id: string; name: string }[];
  values?: ContactFormValues;
  submitLabel: string;
}) {
  const v = values || {};
  return (
    <form action={action} className="card p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="firstName">Nombre</label>
          <input className="input" id="firstName" name="firstName" defaultValue={v.firstName || ""} />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Apellido</label>
          <input className="input" id="lastName" name="lastName" defaultValue={v.lastName || ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="rut">RUT</label>
          <RutInput id="rut" name="rut" defaultValue={v.rut} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" defaultValue={v.email || ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="phone">Teléfono</label>
          <input className="input" id="phone" name="phone" defaultValue={v.phone || ""} />
        </div>
        <div>
          <label className="label" htmlFor="companyName">Empresa</label>
          <input className="input" id="companyName" name="companyName" defaultValue={v.companyName || ""} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="sector">Sector</label>
          <input className="input" id="sector" name="sector" defaultValue={v.sector || ""} />
        </div>
        <div>
          <label className="label" htmlFor="comuna">Comuna</label>
          <input className="input" id="comuna" name="comuna" defaultValue={v.comuna || ""} />
        </div>
        <div>
          <label className="label" htmlFor="region">Región</label>
          <input className="input" id="region" name="region" defaultValue={v.region || ""} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="channelId">Canal de origen</label>
          <Link href="/canales" className="text-xs text-brand-600 hover:underline">Gestionar canales</Link>
        </div>
        <select className="input" id="channelId" name="channelId" defaultValue={v.channelId || ""}>
          <option value="">— Sin especificar —</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
