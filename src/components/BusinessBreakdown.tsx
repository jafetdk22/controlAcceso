"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { BusinessBreakdownRow } from "@/lib/queries";
import { initials } from "@/lib/utils";

interface Props {
  rows: BusinessBreakdownRow[];
  onSelect?: (id: string) => void;
}

export function BusinessBreakdown({ rows, onSelect }: Props) {
  const chartData = rows.slice(0, 8).map((r) => ({
    name: r.business_name,
    total: r.total,
    color: r.color ?? "#345196",
    id: r.business_id
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="glass-card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
              Top negocios por accesos
            </h3>
            <p className="text-xs text-slate-500">
              Comparativo total en el rango seleccionado
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 12, fill: "#334155" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 30px -10px rgba(15,23,42,0.18)"
                }}
              />
              <Bar
                dataKey="total"
                radius={[6, 6, 6, 6]}
                onClick={(d: unknown) => {
                  const id = (d as { id?: string } | null)?.id;
                  if (id) onSelect?.(id);
                }}
              >
                {chartData.map((d) => (
                  <Cell key={d.id} fill={d.color} cursor="pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
          Desglose por negocio
        </h3>
        <p className="text-xs text-slate-500">Visitantes y proveedores por empresa</p>

        <ul className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
          {rows.length === 0 && (
            <li className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Sin registros en este rango.
            </li>
          )}
          {rows.map((r) => {
            const visitorPct = r.total === 0 ? 0 : (r.visitors / r.total) * 100;
            return (
              <li
                key={r.business_id}
                onClick={() => onSelect?.(r.business_id)}
                className="cursor-pointer rounded-2xl border border-transparent px-3 py-2.5 transition hover:border-slate-200 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                    style={{ background: r.color ?? "#345196" }}
                  >
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.logo_url}
                        alt=""
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      initials(r.business_name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {r.business_name}
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-slate-900">
                        {r.total}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-brand-700"
                        style={{ width: `${visitorPct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{r.visitors} visitantes</span>
                      <span>{r.suppliers} proveedores</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
