"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  variant: "visitor" | "supplier";
}

export function OptionCard({
  href,
  title,
  subtitle,
  description,
  icon,
  variant
}: Props) {
  const gradient =
    variant === "visitor"
      ? "from-brand-900 via-brand-800 to-brand-600"
      : "from-accent-600 via-accent-500 to-accent-400";

  return (
    <Link
      href={href}
      className={cn(
        "group relative block cursor-pointer overflow-hidden rounded-[2rem] p-10 text-white shadow-glow transition",
        "min-h-[360px] flex flex-col justify-between",
        "bg-gradient-to-br",
        gradient,
        "hover:-translate-y-1 hover:shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
      )}
    >
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
          {icon}
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/20">
          {subtitle}
        </span>
      </div>

      <div className="relative space-y-3">
        <h2 className="font-display text-4xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="max-w-md text-base text-white/80">{description}</p>
      </div>

      <div className="relative flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Continuar
        </span>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 transition group-hover:bg-white group-hover:text-brand-900">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
