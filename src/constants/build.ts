/** Injected at build time via vite.config.ts; falls back to src/buildInfo.ts */
import { CACHE_VERSION } from "../buildInfo";

export const APP_BUILD_ID =
  typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : CACHE_VERSION;
