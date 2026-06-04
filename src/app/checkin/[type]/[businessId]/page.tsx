"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  IdCard,
  Loader2,
  Phone,
  User
} from "lucide-react";
import { Header } from "@/components/Header";
import { getBusiness, registerAccess } from "@/lib/queries";
import type { Business, VisitorType } from "@/lib/types";
import { initials } from "@/lib/utils";

export default function CheckinPage() {
  const router = useRouter();
  const params = useParams<{ type: string; businessId: string }>();
  const type = (params?.type === "supplier" ? "supplier" : "visitor") as VisitorType;
  const businessId = params?.businessId ?? "";

  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBiz, setLoadingBiz] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    id_document: "",
    company: "",
    phone: "",
    reason: "",
    host_name: ""
  });

  useEffect(() => {
    let cancelled = false;
    getBusiness(businessId)
      .then((b) => {
        if (!cancelled) setBusiness(b);
      })
      .finally(() => {
        if (!cancelled) setLoadingBiz(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.full_name.trim()) {
      setFormError("Por favor ingresa tu nombre completo.");
      return;
    }
    try {
      setSubmitting(true);
      await registerAccess({
        business_id: businessId,
        visitor_type: type,
        full_name: form.full_name.trim(),
        id_document: form.id_document.trim() || undefined,
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        reason: form.reason.trim() || undefined,
        host_name: form.host_name.trim() || undefined
      });
      const q = new URLSearchParams({
        business: business?.name ?? "",
        type,
        name: form.full_name.trim()
      });
      router.push(`/success?${q.toString()}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el acceso.");
    } finally {
      setSubmitting(false);
    }
  }

  const isVisitor = type === "visitor";

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-2">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Tarjeta del negocio */}
          <aside className="glass-card animate-fade-in flex h-fit flex-col gap-6 p-8">
            {loadingBiz ? (
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ) : business ? (
              <>
                <div
                  className="grid h-24 w-24 place-items-center rounded-3xl text-3xl font-bold text-white shadow-soft"
                  style={{ background: business.color ?? "#345196" }}
                >
                  {business.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    <span>{initials(business.name)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Negocio seleccionado
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900">
                    {business.name}
                  </h2>
                  {business.description && (
                    <p className="mt-2 text-sm text-slate-500">
                      {business.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-200/70 pt-5 text-sm">
                  <Row
                    icon={<Building2 className="h-4 w-4" />}
                    label="Edificio"
                    value="Corporativo Principal"
                  />
                  <Row
                    icon={<User className="h-4 w-4" />}
                    label="Tipo de ingreso"
                    value={isVisitor ? "Visitante" : "Proveedor"}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Negocio no encontrado.</p>
            )}
          </aside>

          {/* Formulario */}
          <form
            onSubmit={onSubmit}
            className="glass-card animate-rise space-y-6 p-8"
          >
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
                Registro de acceso
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Completa la información para continuar. Tus datos son tratados de
                forma confidencial.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Nombre completo *"
                placeholder="Ej. María García"
                value={form.full_name}
                onChange={onChange("full_name")}
                icon={<User className="h-4 w-4" />}
                autoFocus
                required
              />
              <Field
                label="Identificación"
                placeholder="INE / pasaporte / gafete"
                value={form.id_document}
                onChange={onChange("id_document")}
                icon={<IdCard className="h-4 w-4" />}
              />
              {!isVisitor && (
                <Field
                  label="Empresa"
                  placeholder="Ej. DHL Express"
                  value={form.company}
                  onChange={onChange("company")}
                  icon={<Building2 className="h-4 w-4" />}
                />
              )}
              <Field
                label="Teléfono"
                placeholder="Ej. +52 55 1234 5678"
                value={form.phone}
                onChange={onChange("phone")}
                icon={<Phone className="h-4 w-4" />}
              />
              {isVisitor && (
                <Field
                  label="Persona a visitar"
                  placeholder="Nombre del anfitrión"
                  value={form.host_name}
                  onChange={onChange("host_name")}
                  icon={<User className="h-4 w-4" />}
                />
              )}
            </div>

            <div>
              <label className="label-field">Motivo de la visita</label>
              <textarea
                value={form.reason}
                onChange={onChange("reason")}
                placeholder={
                  isVisitor
                    ? "Ej. Reunión de trabajo con el equipo comercial"
                    : "Ej. Entrega de paquetería"
                }
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5">
              <Link href={`/select/${type}`} className="btn-secondary">
                Cambiar negocio
              </Link>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Registrar acceso
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Row({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-slate-500">
        {icon} {label}
      </span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function Field({
  label,
  icon,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`input-field ${icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}
