import type { DependencyCertificationCategoryId } from "../types/dependencyCertification";

export const DEPENDENCY_CERTIFICATION_CATEGORIES: Array<{
  id: DependencyCertificationCategoryId;
  label: string;
}> = [
  { id: "npm-packages", label: "npm packages" },
  { id: "docker-base", label: "Docker base image" },
  { id: "node-version", label: "Node version" },
  { id: "android-dependencies", label: "Android dependencies" },
  { id: "firebase-sdk", label: "Firebase SDK" },
  { id: "supabase-sdk", label: "Supabase SDK" },
  { id: "payment-sdks", label: "Payment SDKs" },
  { id: "notification-sdks", label: "Notification SDKs" }
];

export const DEPENDENCY_CERTIFICATION_RELEASE_BLOCKERS = [
  "Critical dependency vulnerability (npm audit critical)"
] as const;
