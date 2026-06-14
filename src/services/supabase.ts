import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";

const productionSupabaseUrl = "https://nswiwxmavuqpuzlsascs.supabase.co";
const productionSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zd2l3eG1hdnVxcHV6bHNhc2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzg1MzksImV4cCI6MjA5MTc1NDUzOX0.5npMr6niRCG1n2EJL4B8ZSeeEel7ZZIVq6btbM3oghs";

export const publicAppUrl = (
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || "https://bamsignal.com"
).replace(/\/$/, "");

export const isNativePlatform = Capacitor.getPlatform() !== "web";

export const apiUrl = (path: string) => (isNativePlatform ? `${publicAppUrl}${path}` : path);

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || productionSupabaseUrl;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || productionSupabaseAnonKey;

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
