import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";

export const publicAppUrl = (
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || "https://bamsignal.com"
).replace(/\/$/, "");

export const isNativePlatform = Capacitor.getPlatform() !== "web";

export const apiUrl = (path: string) => (isNativePlatform ? `${publicAppUrl}${path}` : path);

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || "";

if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn("[bamsignal] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from the production build.");
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          persistSession: true
        }
      })
    : null;

export function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/failed to fetch|fetch failed|network/i.test(message)) {
    return "BamSignal could not reach the server. Check your internet connection.";
  }
  if (/expired|invalid|token/i.test(message)) {
    return "That code is not valid anymore. Request a fresh one and try again.";
  }
  return message || "Authentication could not be completed. Please try again.";
}
