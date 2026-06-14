/** Configurable support inbox — override with VITE_SUPPORT_EMAIL in env */
export const SUPPORT_EMAIL =
  (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim() || "support@bamsignal.com";

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
