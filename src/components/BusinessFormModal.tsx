"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, Trash2, X } from "lucide-react";
import {
  createBusiness,
  deleteBusiness,
  slugify,
  updateBusiness
} from "@/lib/queries";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Negocio a editar, o `null` para crear uno nuevo. */
  business: Business | null;
  /** Piso preseleccionado al crear (tab activa). */
  defaultFloor?: string;
  onClose: () => void;
  onSaved: (b: Business) => void;
  onDeleted: (id: string) => void;
}

type FormState = {
  name: string;
  slug: string;
  floor: string;
  description: string;
  color: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  days: string;
  open_time: string;
  close_time: string;
  active: boolean;
};

function toForm(b: Business | null, defaultFloor?: string): FormState {
  return {
    name: b?.name ?? "",
    slug: b?.slug ?? "",
    floor: b?.floor ?? defaultFloor ?? "",
    description: b?.description ?? "",
    color: b?.color ?? "#345196",
    logo_url: b?.logo_url ?? "",
    phone: b?.phone ?? "",
    email: b?.email ?? "",
    address: b?.address ?? "",
    days: b?.days ?? "",
    open_time: b?.open_time ?? "",
    close_time: b?.close_time ?? "",
    active: b?.active ?? true
  };
}

export function BusinessFormModal({
  business,
  defaultFloor,
  onClose,
  onSaved,
  onDeleted
}: Props) {
  const isNew = !business;
  const [form, setForm] = useState<FormState>(() => toForm(business, defaultFloor));
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Autogenerar slug desde el nombre mientras no se edite manualmente
  const autoSlug = isNew && !slugTouched ? slugify(form.name) : form.slug;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: (autoSlug || slugify(form.name)).trim(),
      floor: form.floor.trim() || null,
      description: form.description.trim() || null,
      color: form.color || null,
      logo_url: form.logo_url.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      days: form.days.trim() || null,
      open_time: form.open_time.trim() || null,
      close_time: form.close_time.trim() || null,
      active: form.active
    };
    try {
      const saved = isNew
        ? await createBusiness(payload)
        : await updateBusiness(business!.id, payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!business) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBusiness(business.id);
      onDeleted(business.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-8 w-full max-w-2xl rounded-3xl border border-white/70 bg-white shadow-glow">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl text-white"
              style={{ backgroundColor: form.color || "#345196" }}
            >
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isNew ? "Nuevo negocio" : "Editar negocio"}
              </h2>
              <p className="text-xs text-slate-500">
                {isNew
                  ? "Registra un negocio en el edificio"
                  : "Actualiza los datos del negocio"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
          {/* Identidad */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre *">
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Aurora Studios"
                autoFocus
              />
            </Field>
            <Field label="Piso / Ubicación">
              <input
                className="input-field"
                value={form.floor}
                onChange={(e) => set("floor", e.target.value)}
                placeholder="Piso 3"
              />
            </Field>
          </div>

          <Field label="Slug (URL)" hint="Se genera automáticamente del nombre">
            <input
              className="input-field font-mono text-sm"
              value={autoSlug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="aurora-studios"
            />
          </Field>

          <Field label="Descripción">
            <textarea
              className="input-field min-h-[72px] resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Estudio de diseño y producción audiovisual"
            />
          </Field>

          {/* Marca: color + logo */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Color de marca">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                />
                <input
                  className="input-field font-mono text-sm"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="#345196"
                />
              </div>
            </Field>
            <Field label="Logo (URL)">
              <div className="flex items-center gap-3">
                {form.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logo_url}
                    alt="logo"
                    className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                    onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </span>
                )}
                <input
                  className="input-field text-sm"
                  value={form.logo_url}
                  onChange={(e) => set("logo_url", e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </Field>
          </div>

          {/* Horario */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Horario de atención
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Días">
                <input
                  className="input-field"
                  value={form.days}
                  onChange={(e) => set("days", e.target.value)}
                  placeholder="Lunes a Viernes"
                />
              </Field>
              <Field label="Apertura">
                <input
                  type="time"
                  className="input-field"
                  value={form.open_time}
                  onChange={(e) => set("open_time", e.target.value)}
                />
              </Field>
              <Field label="Cierre">
                <input
                  type="time"
                  className="input-field"
                  value={form.close_time}
                  onChange={(e) => set("close_time", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Contacto */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono">
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </Field>
            <Field label="Correo">
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contacto@negocio.com"
              />
            </Field>
          </div>

          <Field label="Dirección / Referencia interna">
            <input
              className="input-field"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Local 3A, ala norte"
            />
          </Field>

          {/* Activo */}
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
            />
            <span className="text-sm">
              <span className="font-medium text-slate-900">Negocio activo</span>
              <span className="block text-xs text-slate-500">
                Los negocios inactivos se ocultan del kiosko de registro.
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {!isNew ? (
              confirmDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">¿Eliminar definitivamente?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              )
            ) : (
              <span />
            )}

            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={cn("btn-primary", saving && "opacity-70")}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isNew ? "Crear negocio" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-field">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
