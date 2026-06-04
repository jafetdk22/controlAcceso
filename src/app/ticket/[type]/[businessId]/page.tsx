"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Home, Loader2, Printer } from "lucide-react";
import { getBusiness, registerAccess } from "@/lib/queries";
import type { Business, VisitorType } from "@/lib/types";
import { initials } from "@/lib/utils";

export default function TicketPage() {
  const router = useRouter();
  const params = useParams<{ type: string; businessId: string }>();
  const type = (params?.type === "supplier" ? "supplier" : "visitor") as VisitorType;
  const businessId = params?.businessId ?? "";

  const [business, setBusiness] = useState<Business | null>(null);
  const [stage, setStage] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [accessId, setAccessId] = useState<string>("");
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);
  const printedRef = useRef(false);

  // Cargar negocio + registrar acceso
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const biz = await getBusiness(businessId);
        if (!biz) throw new Error("Negocio no encontrado");
        if (cancelled) return;
        setBusiness(biz);

        const log = await registerAccess({
          business_id: businessId,
          visitor_type: type,
          full_name: type === "visitor" ? "Visitante" : "Proveedor"
        });
        if (cancelled) return;

        setAccessId(log.id);
        setIssuedAt(new Date(log.entry_time ?? Date.now()));
        setStage("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error desconocido");
        setStage("error");
      }
    }
    run();

    return () => {
      cancelled = true;
    };
  }, [businessId, type]);

  // Auto-imprimir cuando el ticket está listo
  useEffect(() => {
    if (stage !== "ready" || printedRef.current) return;
    printedRef.current = true;
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, [stage]);

  // Volver al inicio tras 30s
  useEffect(() => {
    if (stage !== "ready") return;
    const t = setTimeout(() => router.push("/"), 30_000);
    return () => clearTimeout(t);
  }, [stage, router]);

  const typeLabel = type === "visitor" ? "Visitante" : "Proveedor";
  const color = business?.color ?? "#345196";

  const code = useMemo(() => {
    if (!accessId) return "";
    return accessId.replace(/-/g, "").slice(0, 8).toUpperCase();
  }, [accessId]);

  const fechaStr = useMemo(() => {
    if (!issuedAt) return "";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(issuedAt);
  }, [issuedAt]);

  const horaStr = useMemo(() => {
    if (!issuedAt) return "";
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(issuedAt);
  }, [issuedAt]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        {stage === "loading" && (
          <div className="glass-card flex flex-col items-center gap-3 p-12 text-center no-print">
            <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
            <p className="text-sm text-slate-500">Generando ticket de acceso…</p>
          </div>
        )}

        {stage === "error" && (
          <div className="glass-card flex flex-col items-center gap-4 p-12 text-center no-print">
            <h2 className="text-lg font-semibold text-slate-900">
              No se pudo emitir el ticket
            </h2>
            <p className="max-w-md text-sm text-slate-500">{error}</p>
            <button onClick={() => router.push("/")} className="btn-primary">
              <Home className="h-4 w-4" /> Volver al inicio
            </button>
          </div>
        )}

        {stage === "ready" && business && (
          <>
            {/* Ticket imprimible */}
            <div className="ticket mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-100">
              <div
                className="px-6 py-5 text-center text-white"
                style={{ background: color }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-80">
                  Edificio Corporativo
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em]">
                  Pase de acceso
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
                <div
                  className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl text-3xl font-bold text-white shadow-soft"
                  style={{ background: color }}
                >
                  {business.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials(business.name)}</span>
                  )}
                </div>
                <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-slate-900">
                  {business.name}
                </h1>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ background: `${color}14`, color }}
                >
                  {typeLabel}
                </span>
              </div>

              <div className="ticket-divider" />

              <dl className="grid grid-cols-2 gap-y-3 px-6 py-5 text-sm">
                <Item label="Piso" value={business.floor ?? "—"} />
                <Item label="Negocio" value={business.name} />
                <Item label="Fecha" value={fechaStr} />
                <Item label="Hora" value={horaStr} />
              </dl>

              <div className="ticket-divider" />

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Folio
                  </p>
                  <p className="font-mono text-lg font-semibold tracking-wider text-slate-900">
                    {code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Tipo
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{typeLabel}</p>
                </div>
              </div>

              <div
                className="px-6 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-white"
                style={{ background: color }}
              >
                Presenta este pase en recepción
              </div>
            </div>

            {/* Acciones (no se imprimen) */}
            <div className="no-print mt-8 flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Acceso registrado · ticket impreso
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                >
                  <Printer className="h-4 w-4" /> Imprimir de nuevo
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="btn-primary"
                >
                  <Home className="h-4 w-4" /> Finalizar
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Esta pantalla volverá al inicio automáticamente en 30 s.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
