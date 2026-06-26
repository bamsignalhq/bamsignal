/** Dependency & Supply Chain Certification™ — verified category registry. */

export const DEPENDENCY_CERT_CATEGORIES = [
  { id: "npm-packages", label: "npm packages" },
  { id: "docker-base", label: "Docker base image" },
  { id: "node-version", label: "Node version" },
  { id: "android-dependencies", label: "Android dependencies" },
  { id: "firebase-sdk", label: "Firebase SDK" },
  { id: "supabase-sdk", label: "Supabase SDK" },
  { id: "payment-sdks", label: "Payment SDKs" },
  { id: "notification-sdks", label: "Notification SDKs" }
];

export const DEPENDENCY_CERT_TRACKED_PACKAGES = {
  supabase: ["@supabase/supabase-js"],
  firebase: ["firebase-admin"],
  payment: ["axios"],
  notification: [
    "@capacitor/push-notifications",
    "@capacitor-community/fcm",
    "telegraf",
    "firebase-admin"
  ],
  android: ["@capacitor/android", "@capacitor/core"]
};

export const DEPENDENCY_CERT_INCOMPATIBLE_LICENSES = new Set([
  "GPL",
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "AGPL-3.0-only",
  "SSPL-1.0"
]);

export const DEPENDENCY_CERT_BLOCK_ON_CRITICAL = true;

export const DEPENDENCY_CERT_EXPECTED = {
  dockerBaseImage: "node:20-slim",
  nodeMajor: 20,
  androidCompileSdk: 35
};
