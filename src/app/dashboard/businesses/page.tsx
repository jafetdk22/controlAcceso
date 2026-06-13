"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Store
} from "lucide-react";
import { Header } from "@/components/Header";
import { BusinessFormModal } from "@/components/BusinessFormModal";
import { useSession } from "@/lib/auth";
import { listBusinesses } from "@/lib/queries";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";

const NO_FLOOR = "__none__";

export default function BusinessesAdminPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useSession();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [extraFloors, setExtraFloors] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<string | null>(null);

  const [editing, setEditing] = useState<Business | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, session, router]);

  function load() {
    setLoading(true);
    listBusinesses()
      .then((data) => {
        setBusinesses(data);
        setError(null);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Error al cargar negocios")
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Pisos = los de la BD + los agregados localmente, ordenados.
  const floors = useMemo(() => {
    const set = new Set<string>();
    let hasNone = false;
    for (const b of businesses) {
      if (b.floor && b.floor.trim()) set.add(b.floor.trim());
      else hasNone = true;
    }
    for (const f of extraFloors) set.add(f);
    const list = Array.from(set).sort((a, b) =>
      a.localeCompare(b, "es", { numeric: true })
    );
    if (hasNone) list.push(NO_FLOOR);
    return list;
  }, [businesses, extraFloors]);

  // Asegura una tab activa válida.
  useEffect(() => {
    if (floors.length === 0) {
      setActiveFloor(null);
    } else if (!activeFloor || !floors.includes(activeFloor)) {
      setActiveFloor(floors[0]);
    }
  }, [floors, activeFloor]);

  const visible = useMemo(() => {
    if (!activeFloor) return [];
    return businesses
      .filter((b) =>
        activeFloor === NO_FLOOR
          ? !b.floor || !b.floor.trim()
          : (b.floor ?? "").trim() === activeFloor
      )
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [businesses, activeFloor]);

  function addFloor() {
    const name = window.prompt("Nombre del nuevo piso o ubicación:", "Piso ");
    const trimmed = name?.trim();
    if (!trimmed) return;
    if (!floors.includes(trimmed)) setExtraFloors((f) => [...f, trimmed]);
    setActiveFloor(trimmed);
  }

  function onSaved(saved: Business) {
    setBusinesses((list) => {
      const idx = list.findIndex((b) => b.id === saved.id);
      if (idx === -1) return [...list, saved];
      const copy = [...list];
      copy[idx] = saved;
      return copy;
    });
    // Si se le asignó un piso nuevo, salta a esa tab.
    if (saved.floor && saved.floor.trim()) setActiveFloor(saved.floor.trim());
    setEditing(null);
    setCreating(false);
  }

  function onDeleted(id: string) {
    setBusinesses((list) => list.filter((b) => b.id !== id));
    setEditing(null);
    setCreating(false);
  }

  if (authLoading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
      </div>
    );
  }

  const newFloorDefault = activeFloor && activeFloor !== NO_FLOOR ? activeFloor : "";

  return (
    <div className="min-h-screen">
      <Header showDashboardLink={false} />

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            onClick={() => setCreating(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Agregar negocio
          </button>
        </div>

        {/* Título */}
        <section className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
            <Store className="h-3.5 w-3.5" /> Negocios
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Administración de negocios
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Registra negocios, organízalos por piso y configura su marca, horario
            y datos de contacto.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">No se pudieron cargar los negocios.</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {/* Tabs por piso */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {floors.map((f) => {
            const count = businesses.filter((b) =>
              f === NO_FLOOR
                ? !b.floor || !b.floor.trim()
                : (b.floor ?? "").trim() === f
            ).length;
            const label = f === NO_FLOOR ? "Sin piso" : f;
            return (
              <button
                key={f}
                onClick={() => setActiveFloor(f)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition",
                  activeFloor === f
                    ? "border-brand-900 bg-brand-900 text-white shadow-soft"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                )}
              >
                {label}
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px]",
                    activeFloor === f
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
          <button
            onClick={addFloor}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" />
            Piso
          </button>
        </div>

        {/* Grid de negocios */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-3xl border border-white/70 bg-white/70"
              />
            ))}
          </div>
        ) : floors.length === 0 ? (
          <EmptyState onAdd={() => setCreating(true)} />
        ) : visible.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No hay negocios en este piso
            </h3>
            <p className="max-w-md text-sm text-slate-500">
              Agrega el primer negocio de{" "}
              {activeFloor === NO_FLOOR ? "esta ubicación" : activeFloor}.
            </p>
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Agregar negocio
            </button>
          </div>
        ) : (
          <div className="grid animate-rise gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((b) => (
              <BusinessAdminCard key={b.id} business={b} onEdit={() => setEditing(b)} />
            ))}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <BusinessFormModal
          business={editing}
          defaultFloor={newFloorDefault}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}

function BusinessAdminCard({
  business,
  onEdit
}: {
  business: Business;
  onEdit: () => void;
}) {
  const b = business;
  const schedule =
    b.open_time && b.close_time
      ? `${b.open_time}–${b.close_time}${b.days ? ` · ${b.days}` : ""}`
      : b.days || null;

  return (
    <button
      onClick={onEdit}
      className="group relative flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl"
        style={{ backgroundColor: b.color ?? "#345196" }}
      />
      <div className="flex items-start gap-3">
        {b.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={b.logo_url}
            alt={b.name}
            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl text-white"
            style={{ backgroundColor: b.color ?? "#345196" }}
          >
            <Building2 className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-900">{b.name}</h3>
            {!b.active && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                Inactivo
              </span>
            )}
          </div>
          {b.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
              {b.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-1 space-y-1.5 text-xs text-slate-500">
        {schedule && (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" /> {schedule}
          </p>
        )}
        {b.phone && (
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" /> {b.phone}
          </p>
        )}
        {b.email && (
          <p className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {b.email}
          </p>
        )}
        {b.address && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {b.address}
          </p>
        )}
      </div>

      <span className="mt-auto pt-1 text-xs font-medium text-brand-700 opacity-0 transition group-hover:opacity-100">
        Editar →
      </span>
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Store className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold text-slate-900">Aún no hay negocios</h3>
      <p className="max-w-md text-sm text-slate-500">
        Registra el primer negocio del edificio. Podrás organizarlos por piso y
        configurar su marca y horario.
      </p>
      <button onClick={onAdd} className="btn-primary">
        <Plus className="h-4 w-4" />
        Agregar negocio
      </button>
    </div>
  );
}
