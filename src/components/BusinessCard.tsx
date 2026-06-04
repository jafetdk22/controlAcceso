"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Business, VisitorType } from "@/lib/types";
import { initials } from "@/lib/utils";

interface Props {
  business: Business;
  visitorType: VisitorType;
  index?: number;
}

export function BusinessCard({ business, visitorType, index = 0 }: Props) {
  const color = business.color ?? "#345196";
  const href = `/ticket/${visitorType}/${business.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(15,23,42,0.35)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white shadow-soft ring-1 ring-white/30"
          style={{ background: color }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span>{initials(business.name)}</span>
          )}
        </div>

        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-brand-900 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          {business.name}
        </h3>
        {business.floor && (
          <p className="mt-1 text-sm font-medium" style={{ color }}>
            {business.floor}
          </p>
        )}
        {business.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {business.description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs">
        <span
          className="pill font-semibold uppercase tracking-wider"
          style={{ background: `${color}14`, color }}
        >
          {visitorType === "visitor" ? "Visitante" : "Proveedor"}
        </span>
        <span className="text-slate-400">Toca para imprimir ticket</span>
      </div>
    </Link>
  );
}
