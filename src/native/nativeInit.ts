import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { dispatchNativeDeepLinkRoute } from "./appBridge";
import { initBackgroundSync } from "./backgroundSync";
import { parseNativeDeepLink } from "./deepLinks";
import { initNativePushNotifications, setPushRouteHandler } from "./pushNotifications";

export async function initNativeExperience(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  setPushRouteHandler((route) => dispatchNativeDeepLinkRoute(route));

  await Promise.all([
    configureNativeChrome(),
    initNativePushNotifications(),
    initBackgroundSync()
  ]);
}

async function configureNativeChrome(): Promise<void> {
  try {
    await SplashScreen.hide({ fadeOutDuration: 280 });
  } catch {
    /* optional */
  }

  if (Capacitor.getPlatform() === "android") {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#101923" });
    } catch {
      /* optional */
    }
  }
}

export function handleNativeLaunchUrl(rawUrl: string): boolean {
  const route = parseNativeDeepLink(rawUrl);
  if (!route) return false;
  dispatchNativeDeepLinkRoute(route);
  return true;
}
