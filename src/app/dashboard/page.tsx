"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  Filter,
  Loader2,
  LogOut,
  RefreshCw,
  Store,
  TrendingUp,
  Truck,
  Users
} from "lucide-react";
import { Header } from "@/components/Header";
import { signOut, useSession } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { AccessChart } from "@/components/AccessChart";
import { BusinessBreakdown } from "@/components/BusinessBreakdown";
import { AccessLogTable } from "@/components/AccessLogTable";
import {
  aggregateByBusiness,
  bucketLogs,
  computeKPIs,
  fetchAccessLogs,
  listBusinesses
} from "@/lib/queries";
import { RANGES, type AccessLogWithBusiness, type Business, type RangeKey, type VisitorType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { session, user, loading: authLoading } = useSession();

  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [businessId, setBusinessId] = useState<string>("all");
  const [visitorType, setVisitorType] = useState<VisitorType | "all">("all");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [logs, setLogs] = useState<AccessLogWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Guardia: si no hay sesión, redirige a /login
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/login");
    }
  }, [authLoading, session, router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const range = useMemo(
    () => RANGES.find((r) => r.key === rangeKey) ?? RANGES[2],
    [rangeKey]
  );

  useEffect(() => {
    listBusinesses().then(setBusinesses).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    fetchAccessLogs(
      {
        businessId,
        visitorType: visitorType === "all" ? undefined : visitorType,
        range
      },
      2000
    )
      .then((data) => {
        if (!cancelled) {
          setLogs(data);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar datos");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, visitorType, range]);

  const kpis = useMemo(() => computeKPIs(logs), [logs]);
  const chartData = useMemo(() => bucketLogs(logs, range), [logs, range]);
  const breakdown = useMemo(() => aggregateByBusiness(logs), [logs]);

  const selectedBusinessName = useMemo(() => {
    if (businessId === "all") return "Todos los negocios";
    return businesses.find((b) => b.id === businessId)?.name ?? "Negocio";
  }, [businesses, businessId]);

  if (authLoading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showDashboardLink={false} />

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-soft sm:inline-flex"
              title={user?.email ?? ""}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-900 text-[10px] font-bold text-white">
                {(user?.email ?? "?").charAt(0).toUpperCase()}
              </span>
              {user?.email}
            </span>
            <button
              onClick={() => {
                setLoading(true);
                setRefreshing(true);
                fetchAccessLogs(
                  {
                    businessId,
                    visitorType: visitorType === "all" ? undefined : visitorType,
                    range
                  },
                  2000
                )
                  .then(setLogs)
                  .finally(() => {
                    setLoading(false);
                    setRefreshing(false);
                  });
              }}
              className="btn-secondary"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Actualizar
            </button>
            <Link href="/dashboard/businesses" className="btn-secondary">
              <Store className="h-4 w-4" />
              Negocios
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-secondary"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Header */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
              <TrendingUp className="h-3.5 w-3.5" /> Dashboard
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Indicadores de acceso
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              {selectedBusinessName} · Rango: <strong>{range.label}</strong>
            </p>
          </div>
          <DateRangeSelector value={rangeKey} onChange={setRangeKey} />
        </section>

        {/* Filters */}
        <section className="mb-6 glass-card flex flex-wrap items-center gap-3 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Filter className="h-4 w-4" /> Filtros:
          </span>

          <select
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">Todos los negocios</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium">
            {(["all", "visitor", "supplier"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setVisitorType(t)}
                className={cn(
                  "rounded-lg px-3 py-1.5 transition",
                  visitorType === t
                    ? "bg-brand-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {t === "all" ? "Todos" : t === "visitor" ? "Visitantes" : "Proveedores"}
              </button>
            ))}
          </div>

          {(businessId !== "all" || visitorType !== "all") && (
            <button
              onClick={() => {
                setBusinessId("all");
                setVisitorType("all");
              }}
              className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Limpiar filtros
            </button>
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">No se pudieron cargar los datos.</p>
            <p className="mt-1 text-xs">{error}</p>
            <p className="mt-2 text-xs text-red-600/80">
              Configura{" "}
              <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> con tus
              credenciales de Supabase y ejecuta los scripts SQL.
            </p>
          </div>
        )}

        {/* KPIs */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard
            label="Accesos totales"
            value={kpis.total.toLocaleString("es-MX")}
            hint={`En ${range.label.toLowerCase()}`}
            icon={DoorOpen}
            tone="brand"
          />
          <StatCard
            label="Visitantes"
            value={kpis.visitors.toLocaleString("es-MX")}
            hint={
              kpis.total
                ? `${((kpis.visitors / kpis.total) * 100).toFixed(0)}% del tráfico`
                : "—"
            }
            icon={Users}
            tone="default"
          />
          <StatCard
            label="Proveedores"
            value={kpis.suppliers.toLocaleString("es-MX")}
            hint={
              kpis.total
                ? `${((kpis.suppliers / kpis.total) * 100).toFixed(0)}% del tráfico`
                : "—"
            }
            icon={Truck}
            tone="accent"
          />
          <StatCard
            label="Dentro ahora"
            value={kpis.insideNow.toLocaleString("es-MX")}
            hint="Sin hora de salida"
            icon={DoorOpen}
            tone="emerald"
          />
          <StatCard
            label="Hora pico"
            value={kpis.peakHour?.hour ?? "—"}
            hint={
              kpis.peakHour ? `${kpis.peakHour.count} accesos` : "Sin datos"
            }
            icon={TrendingUp}
            tone="rose"
          />
        </section>

        {/* Chart */}
        <section className="mb-8">
          {loading ? (
            <div className="h-80 animate-pulse rounded-3xl border border-white/70 bg-white/60" />
          ) : (
            <AccessChart data={chartData} />
          )}
        </section>

        {/* Breakdown */}
        <section className="mb-8">
          {loading ? (
            <div className="h-80 animate-pulse rounded-3xl border border-white/70 bg-white/60" />
          ) : (
            <BusinessBreakdown
              rows={breakdown}
              onSelect={(id) => setBusinessId(id)}
            />
          )}
        </section>

        {/* Log table */}
        <section>
          {loading ? (
            <div className="h-96 animate-pulse rounded-3xl border border-white/70 bg-white/60" />
          ) : (
            <AccessLogTable logs={logs} />
          )}
        </section>

        <footer className="mt-10 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Datos en tiempo real desde Supabase
          </span>
          <span className="font-mono uppercase tracking-widest">
            Actualizado · {new Date().toLocaleTimeString("es-MX")}
          </span>
        </footer>
      </main>
    </div>
  );
}
