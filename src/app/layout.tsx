import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de Acceso · Edificio",
  description:
    "Sistema de control de acceso para visitantes y proveedores. Kiosko de registro y dashboard analítico.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
