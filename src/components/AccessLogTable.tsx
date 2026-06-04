"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AccessLogWithBusiness } from "@/lib/types";
import { formatDateTime, formatRelative, initials } from "@/lib/utils";

interface Props {
  logs: AccessLogWithBusiness[];
}

export function AccessLogTable({ logs }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "visitor" | "supplier">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return logs.filter((l) => {
      if (type !== "all" && l.visitor_type !== type) return false;
      if (!needle) return true;
      return (
        l.full_name.toLowerCase().includes(needle) ||
        (l.business?.name ?? "").toLowerCase().includes(needle) ||
        (l.company ?? "").toLowerCase().includes(needle) ||
        (l.reason ?? "").toLowerCase().includes(needle)
      );
    });
  }, [logs, q, type]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Bitácora de accesos
          </h3>
          <p className="text-xs text-slate-500">
            {filtered.length} de {logs.length} registros en el rango actual
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nombre, empresa, motivo…"
              className="w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-medium">
            {(["all", "visitor", "supplier"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={
                  "rounded-lg px-3 py-1.5 transition " +
                  (type === t
                    ? "bg-brand-900 text-white"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                {t === "all" ? "Todos" : t === "visitor" ? "Visitantes" : "Proveedores"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3">Persona</th>
              <th className="px-6 py-3">Negocio</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Motivo / Empresa</th>
              <th className="px-6 py-3">Ingreso</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Sin resultados.
                </td>
              </tr>
            )}
            {filtered.map((l) => {
              const isVisitor = l.visitor_type === "visitor";
              return (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                        {initials(l.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {l.full_name}
                        </p>
                        {l.phone && (
                          <p className="text-xs text-slate-500">{l.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: l.business?.color ?? "#345196" }}
                      />
                      <span className="truncate">{l.business?.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        "pill " +
                        (isVisitor
                          ? "bg-brand-50 text-brand-700"
                          : "bg-amber-50 text-amber-700")
                      }
                    >
                      {isVisitor ? "Visitante" : "Proveedor"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    <p className="truncate">{l.reason ?? "—"}</p>
                    {l.company && (
                      <p className="truncate text-xs text-slate-400">{l.company}</p>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-600" title={formatDateTime(l.entry_time)}>
                    {formatRelative(l.entry_time)}
                  </td>
                  <td className="px-6 py-3">
                    {l.exit_time ? (
                      <span className="pill bg-emerald-50 text-emerald-700">Salió</span>
                    ) : (
                      <span className="pill bg-blue-50 text-blue-700">Dentro</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
