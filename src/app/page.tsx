import { Users, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { OptionCard } from "@/components/OptionCard";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-6">
        <section className="grid animate-rise gap-6 md:grid-cols-2">
          <OptionCard
            href="/select/visitor"
            title="Visitante"
            subtitle="Personas"
            description="Reuniones, entrevistas, citas, visitas a colaboradores u oficinas dentro del edificio."
            icon={<Users className="h-8 w-8" />}
            variant="visitor"
          />
          <OptionCard
            href="/select/supplier"
            title="Proveedor"
            subtitle="Servicios"
            description="Entregas, mantenimiento, soporte técnico, mensajería y suministros para los negocios del edificio."
            icon={<Truck className="h-8 w-8" />}
            variant="supplier"
          />
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} · Control de Acceso · Edificio Corporativo</p>
          <p className="font-mono uppercase tracking-widest">
            v1.0 · supabase backend
          </p>
        </footer>
      </main>
    </div>
  );
}
