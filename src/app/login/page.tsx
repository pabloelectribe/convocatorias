import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkPassword, sessionToken, SESSION_COOKIE } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");
  if (!checkPassword(password)) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
  }
  cookies().set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next || "/");
}

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card w-full max-w-sm p-6">
        <h1 className="text-lg font-semibold text-brand-700">Convocatorias · vamosmipyme.cl</h1>
        <p className="mt-1 text-sm text-slate-500">Acceso interno al sistema de gestión de convocatorias.</p>
        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={searchParams.next || "/"} />
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input className="input" id="password" name="password" type="password" required autoFocus />
          </div>
          {searchParams.error && <p className="text-sm text-red-600">Contraseña incorrecta.</p>}
          <button type="submit" className="btn-primary w-full">Entrar</button>
        </form>
      </div>
    </div>
  );
}
