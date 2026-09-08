import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { checkInByQuery } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CheckinPage({ params, searchParams }: { params: { id: string }; searchParams: { msg?: string; ok?: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { attendances: { include: { contact: true }, orderBy: { checkedInAt: "desc" } } },
  });
  if (!event) notFound();

  const eventId = event.id;
  async function action(formData: FormData) {
    "use server";
    const result = await checkInByQuery(eventId, formData);
    redirect(`/eventos/${eventId}/checkin?ok=${result.ok ? "1" : "0"}&msg=${encodeURIComponent(result.message)}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Check-in · {event.title}</h1>
        <Link href={`/eventos/${event.id}`} className="text-sm text-brand-600 hover:underline">← Volver al evento</Link>
      </div>

      <form action={action} className="card p-4 space-y-3">
        <label className="label" htmlFor="query">RUT, email o código de ticket</label>
        <input className="input" id="query" name="query" autoFocus placeholder="12.345.678-9" />
        <button className="btn-primary w-full" type="submit">Registrar asistencia</button>
      </form>

      {searchParams.msg && (
        <p className={`text-sm rounded-md p-3 ${searchParams.ok === "1" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {searchParams.msg}
        </p>
      )}

      <div className="card p-4">
        <h2 className="font-medium mb-2">Últimos check-ins ({event.attendances.length})</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {event.attendances.map((a) => (
            <li key={a.id} className="py-1.5">{fullName(a.contact)}</li>
          ))}
          {event.attendances.length === 0 && <p className="text-slate-400">Aún no hay check-ins.</p>}
        </ul>
      </div>
    </div>
  );
}
