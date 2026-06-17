/** Injected at build time via vite.config.ts */
export const APP_BUILD_ID =
  typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : import.meta.env.MODE;
