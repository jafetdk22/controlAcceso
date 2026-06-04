import Link from "next/link";
import { Building2, LayoutDashboard } from "lucide-react";

export function Header({
  showDashboardLink = true
}: {
  showDashboardLink?: boolean;
}) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-900 text-white shadow-glow">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Edificio Corporativo
          </p>
          <p className="text-lg font-semibold text-slate-900">Control de Acceso</p>
        </div>
      </Link>

      {showDashboardLink && (
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:bg-white sm:inline-flex"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      )}
    </header>
  );
}
