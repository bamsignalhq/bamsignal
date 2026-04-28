import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bamsignal.app",
  appName: "BamSignal",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
