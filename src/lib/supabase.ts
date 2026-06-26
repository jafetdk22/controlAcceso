import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// La anon key de Supabase es pública por diseño (viaja al navegador en cada
// request; la seguridad real la dan las políticas RLS). Por eso la dejamos como
// valor por defecto: así producción funciona aunque las variables de entorno no
// estén configuradas en la plataforma de despliegue. Las variables de entorno,
// si existen, tienen prioridad.
const DEFAULT_SUPABASE_URL = "https://awptuqnkmwvycriwzdwc.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3cHR1cW5rbXd2eWNyaXd6ZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTc5NjYsImV4cCI6MjA5Njg5Mzk2Nn0.EM_dKfBJpnbLKujrIjw0Z3upg0lsDiN4r_F0Vb2zW5A";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  url,
  key,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "access-control.auth",
      detectSessionInUrl: false
    }
  }
);
