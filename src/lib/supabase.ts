import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// La URL del proyecto no es secreta, así que sirve como valor por defecto.
// La anon key NO se hardcodea: el escáner de secretos de Netlify bloquea el
// build si la encuentra en el repo. Debe venir de las variables de entorno
// (configuradas en Netlify / Vercel y en .env.local para desarrollo).
const DEFAULT_SUPABASE_URL = "https://awptuqnkmwvycriwzdwc.supabase.co";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Falta NEXT_PUBLIC_SUPABASE_ANON_KEY. Configúrala en las variables de entorno (Netlify/Vercel) o en .env.local"
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  url,
  key ?? "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "access-control.auth",
      detectSessionInUrl: false
    }
  }
);
