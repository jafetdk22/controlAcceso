"use client";

import { RANGES, type RangeKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}

export function DateRangeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-soft backdrop-blur">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            "rounded-xl px-3.5 py-1.5 text-sm font-medium transition",
            value === r.key
              ? "bg-brand-900 text-white shadow-glow"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
