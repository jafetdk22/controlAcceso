"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Home, LayoutDashboard } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Header } from "@/components/Header";

function SuccessContent() {
  const sp = useSearchParams();
  const name = sp.get("name") ?? "";
  const business = sp.get("business") ?? "";
  const type = sp.get("type") === "supplier" ? "Proveedor" : "Visitante";
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(
      new Intl.DateTimeFormat("es-MX", {
        dateStyle: "full",
        timeStyle: "short"
      }).format(new Date())
    );
  }, []);

  // Auto-volver al inicio en 30 segundos (modo kiosko)
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 30_000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-2">
      <div className="glass-card animate-rise overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-10 text-white">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="relative mt-6 font-display text-4xl font-semibold tracking-tight">
            ¡Bienvenido{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="relative mt-2 max-w-md text-white/85">
            Tu acceso ha sido registrado exitosamente. Por favor pasa a recepción
            para recoger tu credencial.
          </p>
        </div>

        <div className="grid gap-6 p-8 sm:grid-cols-2">
          <Info label="Tipo de ingreso" value={type} />
          <Info label="Negocio" value={business || "—"} />
          <Info label="Nombre" value={name || "—"} />
          <Info label="Fecha y hora" value={now} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-8 py-5">
          <p className="text-xs text-slate-500">
            Esta pantalla volverá al inicio automáticamente en 30 s.
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-secondary">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/" className="btn-primary">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="p-10 text-center text-slate-400">Cargando…</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
