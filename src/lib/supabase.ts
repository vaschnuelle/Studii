import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns true when required Supabase environment variables are available.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

/**
 * Lazily creates and returns a shared Supabase browser client instance.
 * Throws when required env variables are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    );
  }

  return supabaseClient;
}
