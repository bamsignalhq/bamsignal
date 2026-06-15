import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type PendingVerification = {
  id: string;
  userName: string;
  phone: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
};

export function getPendingVerifications(): PendingVerification[] {
  return readJson<PendingVerification[]>(STORAGE_KEYS.verificationQueue, []);
}

export function submitVerificationRequest(userName: string, phone: string): void {
  const list = getPendingVerifications();
  if (list.some((v) => v.phone === phone && v.status === "pending")) return;
  list.unshift({
    id: `v-${Date.now()}`,
    userName,
    phone,
    submittedAt: new Date().toISOString(),
    status: "pending"
  });
  writeJson(STORAGE_KEYS.verificationQueue, list);
}

export function approveVerification(id: string): void {
  writeJson(
    STORAGE_KEYS.verificationQueue,
    getPendingVerifications().map((v) =>
      v.id === id ? { ...v, status: "approved" as const } : v
    )
  );
}

export function rejectVerification(id: string, reason: string): void {
  writeJson(
    STORAGE_KEYS.verificationQueue,
    getPendingVerifications().map((v) =>
      v.id === id ? { ...v, status: "rejected" as const, rejectReason: reason } : v
    )
  );
}

export function pendingCount(): number {
  return getPendingVerifications().filter((v) => v.status === "pending").length;
}

export function verificationStats() {
  const all = getPendingVerifications();
  const pending = all.filter((v) => v.status === "pending");
  const approved = all.filter((v) => v.status === "approved");
  const rejected = all.filter((v) => v.status === "rejected");

  const reviewDurations = approved
    .map((v) => new Date(v.submittedAt).getTime())
    .filter(Boolean);
  const avgReviewHours =
    reviewDurations.length > 0
      ? Math.round(
          reviewDurations.reduce((sum, start) => sum + (Date.now() - start), 0) /
            reviewDurations.length /
            3600000
        )
      : null;

  return {
    pending: pending.length,
    approved: approved.length,
    rejected: rejected.length,
    avgReviewHours
  };
}

export function isUserVerificationPending(phone: string): boolean {
  return getPendingVerifications().some((v) => v.phone === phone && v.status === "pending");
}

export function isUserVerificationApproved(phone: string): boolean {
  return getPendingVerifications().some((v) => v.phone === phone && v.status === "approved");
}
