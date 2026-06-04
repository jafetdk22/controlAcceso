"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";
import { getSession, signInWithPassword } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Si ya hay sesión, ir al dashboard
  useEffect(() => {
    let cancelled = false;
    getSession()
      .then((s) => {
        if (cancelled) return;
        if (s) router.replace("/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(translate(msg));
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Lado izquierdo - branding */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent-500/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Edificio Corporativo
            </p>
            <p className="text-lg font-semibold">Control de Acceso</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight">
            Panel de administración
          </h1>
          <p className="max-w-md text-lg text-white/80">
            Monitorea visitantes, proveedores y el flujo completo de accesos del
            edificio en tiempo real.
          </p>
          <ul className="space-y-3 text-sm text-white/80">
            <Feature text="Indicadores y gráficas desde 1 hora hasta 5 años" />
            <Feature text="Desglose por negocio y bitácora completa" />
            <Feature text="Acceso protegido con autenticación" />
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} · Acceso restringido a personal autorizado
        </p>
      </aside>

      {/* Lado derecho - formulario */}
      <main className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-900 text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Edificio Corporativo
              </p>
              <p className="font-semibold text-slate-900">Control de Acceso</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
            <LockKeyhole className="h-3.5 w-3.5" /> Iniciar sesión
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Panel de administración
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa tus credenciales para acceder al dashboard y a la bitácora de
            accesos.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label-field">Correo</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edificio.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Contraseña</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPwd ? "Ocultar" : "Mostrar"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando…
                </>
              ) : (
                <>
                  Entrar al panel
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              ← Volver al kiosko
            </Link>
            <span>v1.0 · supabase auth</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
        <ShieldCheck className="h-3 w-3" />
      </span>
      {text}
    </li>
  );
}

function translate(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "El correo aún no ha sido confirmado.";
  if (m.includes("too many requests"))
    return "Demasiados intentos. Espera unos minutos.";
  return msg;
}
