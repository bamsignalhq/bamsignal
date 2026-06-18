/** Keep in sync with android/app/build.gradle defaultConfig. */
export const APP_VERSION_NAME = "1.0.12";
export const APP_VERSION_CODE = 15;
export const APP_BUILD_VERSION = APP_VERSION_NAME;
export const APP_BUILD_CODE = String(APP_VERSION_CODE);
export const APP_BUILD_TIME =
  typeof __APP_BUILD_TIME__ !== "undefined" ? __APP_BUILD_TIME__ : "";
export const APP_BUILD_LABEL = `Build ${APP_VERSION_NAME} (${APP_VERSION_CODE})`;
