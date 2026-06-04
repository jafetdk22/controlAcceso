import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // No tiramos error en build, pero advertimos al desarrollador
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  url ?? "http://localhost:54321",
  key ?? "public-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "access-control.auth",
      detectSessionInUrl: false
    }
  }
);
