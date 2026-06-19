/** Synced by scripts/build-android-release.mjs from src/buildInfo.ts */
import { BUILD_CODE, BUILD_TIME, BUILD_VERSION } from "../buildInfo";

export const APP_VERSION_NAME = BUILD_VERSION;
export const APP_VERSION_CODE = Number(BUILD_CODE);
export const APP_BUILD_VERSION = BUILD_VERSION;
export const APP_BUILD_CODE = BUILD_CODE;
export const APP_BUILD_TIME =
  typeof __APP_BUILD_TIME__ !== "undefined" ? __APP_BUILD_TIME__ : BUILD_TIME;
export const APP_BUILD_LABEL = `Build ${BUILD_VERSION} (${BUILD_CODE})`;
