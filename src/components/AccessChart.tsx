"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ChartPoint } from "@/lib/queries";

interface Props {
  data: ChartPoint[];
}

export function AccessChart({ data }: Props) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Flujo de accesos
          </h3>
          <p className="text-xs text-slate-500">Visitantes vs. proveedores por intervalo</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color="#345196" label="Visitantes" />
          <LegendDot color="#e09a32" label="Proveedores" />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#345196" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#345196" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-s" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e09a32" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#e09a32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 30px -10px rgba(15,23,42,0.18)"
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              name="Visitantes"
              stroke="#345196"
              strokeWidth={2.2}
              fill="url(#grad-v)"
            />
            <Area
              type="monotone"
              dataKey="suppliers"
              name="Proveedores"
              stroke="#e09a32"
              strokeWidth={2.2}
              fill="url(#grad-s)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
