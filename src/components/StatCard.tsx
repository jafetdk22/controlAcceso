import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "brand" | "accent" | "emerald" | "rose";
}

const TONES: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-slate-900 text-white",
  brand: "bg-brand-900 text-white",
  accent: "bg-accent-500 text-white",
  emerald: "bg-emerald-600 text-white",
  rose: "bg-rose-500 text-white"
};

export function StatCard({ label, value, hint, icon: Icon, tone = "brand" }: Props) {
  return (
    <div className="glass-card flex items-center justify-between gap-4 p-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {hint && (
          <p className="mt-1 truncate text-xs text-slate-500" title={hint}>
            {hint}
          </p>
        )}
      </div>
      <div className={cn("grid h-12 w-12 place-items-center rounded-2xl shadow-soft", TONES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
