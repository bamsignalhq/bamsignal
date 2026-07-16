import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { ERROR_COPY } from "../constants/copy";
import { USER_MESSAGES } from "../constants/userMessages";

export const publicAppUrl = (
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || "https://bamsignal.com"
).replace(/\/$/, "");

export const isNativePlatform = Capacitor.getPlatform() !== "web";

/** Canonical API URL — production/native always hit bamsignal.com; dev uses Vite proxy. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV && Capacitor.getPlatform() === "web") {
    return normalized;
  }
  return `${publicAppUrl}${normalized}`;
}

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
          persistSession: true,
          storage: typeof window !== "undefined" ? window.localStorage : undefined
        }
      })
    : null;

export function friendlyAuthError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const maybe = error as { message?: string; kind?: string };
    if (maybe.kind && maybe.message) return maybe.message;
  }

  const message = error instanceof Error ? error.message : String(error || "");
  const lower = message.toLowerCase();

  if (/failed to fetch|fetch failed|network error|load failed|unable to connect/i.test(message)) {
    return "Unable to connect. Check your internet connection and try again.";
  }

  if (/expired|invalid.*code|token/i.test(message)) {
    return "That code is not valid anymore. Request a fresh one and try again.";
  }

  if (/already exists|already registered|user already registered|already taken|already linked/i.test(message)) {
    return message.includes("email")
      ? message
      : message || "An account already exists with these details.";
  }

  if (/not configured|temporarily unavailable|email delivery is not configured/i.test(message)) {
    return "Email verification is temporarily unavailable. Please try again shortly.";
  }

  if (/wait \d+s|doesn't match|spam folder|couldn't send the code|request a new code|too many attempts|expired/i.test(message)) {
    return message;
  }

  if (/pin reset|reset code|reset your pin/i.test(message)) {
    return message;
  }

  if (/error sending confirmation email|signup is disabled/i.test(message)) {
    return "Email verification is temporarily unavailable. Please try again shortly.";
  }

  if (/trouble creating your account|couldn't finish creating|couldn't complete your signup/i.test(message)) {
    return USER_MESSAGES.signupCompleteFailed;
  }

  if (/invalid login|invalid credentials|invalid email or password|invalid username or password|invalid username or pin/i.test(lower)) {
    return "Invalid username or PIN.";
  }

  return ERROR_COPY.tryAgainSoon;
}
