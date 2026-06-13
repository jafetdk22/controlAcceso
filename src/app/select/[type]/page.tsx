"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Users } from "lucide-react";
import { BusinessCard } from "@/components/BusinessCard";
import { listBusinesses } from "@/lib/queries";
import type { Business, VisitorType } from "@/lib/types";

export default function SelectBusinessPage() {
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const type = (params?.type === "supplier" ? "supplier" : "visitor") as VisitorType;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listBusinesses()
      .then((data) => {
        if (!cancelled) setBusinesses(data.filter((b) => b.active !== false));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error desconocido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isVisitor = type === "visitor";
  const Icon = isVisitor ? Users : Truck;
  const typeLabel = isVisitor ? "Visitante" : "Proveedor";

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            aria-label="Volver"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-soft transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <span
            className={
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] shadow-soft ring-1 " +
              (isVisitor
                ? "bg-brand-900 text-white ring-brand-900/20"
                : "bg-accent-500 text-white ring-accent-500/20")
            }
          >
            <Icon className="h-4 w-4" />
            {typeLabel}
          </span>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} />
        ) : businesses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid animate-rise gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {businesses.map((b, i) => (
              <BusinessCard key={b.id} business={b} visitorType={type} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-60 animate-pulse rounded-3xl border border-white/70 bg-white/70"
        />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-12 text-center">
      <h3 className="text-lg font-semibold text-slate-900">
        No se pudieron cargar los negocios
      </h3>
      <p className="max-w-md text-sm text-slate-500">
        Verifica que tus credenciales de Supabase estén configuradas en{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.local</code> y que el
        esquema se haya ejecutado en tu proyecto.
      </p>
      <pre className="max-w-full overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs text-white">
        {message}
      </pre>
      <Link href="/" className="btn-secondary">
        Volver
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
      <h3 className="text-lg font-semibold text-slate-900">Sin negocios</h3>
      <p className="max-w-md text-sm text-slate-500">
        Aún no hay negocios registrados. Ejecuta seed.sql en tu Supabase.
      </p>
    </div>
  );
}
