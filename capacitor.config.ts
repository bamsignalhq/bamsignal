import type { CapacitorConfig } from "@capacitor/cli";

const devServerUrl = process.env.CAP_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.bamsignal.app",
  appName: "BamSignal",
  webDir: "dist",
  android: {
    backgroundColor: "#1a0a2e"
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

// Live reload only when CAP_SERVER_URL is set (local dev). Release builds use bundled dist assets.
if (devServerUrl) {
  config.server = {
    url: devServerUrl,
    cleartext: devServerUrl.startsWith("http://"),
    androidScheme: "https"
  };
}

export default config;
