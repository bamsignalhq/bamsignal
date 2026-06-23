import type { DataIntegrityCheckId, IntegrityStatusId } from "../types/dataIntegrity";

export const INTEGRITY_STATUSES: { id: IntegrityStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "warning", label: "Warning" },
  { id: "critical", label: "Critical" }
];

export const INTEGRITY_STATUS_LABELS: Record<IntegrityStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

export const DATA_INTEGRITY_CHECKS: { id: DataIntegrityCheckId; label: string }[] = [
  { id: "journey-ids", label: "Journey IDs" },
  { id: "consultant-assignments", label: "Consultant Assignments" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-ups", label: "Follow-Ups" },
  { id: "archives", label: "Archives" },
  { id: "legacy-profiles", label: "Legacy Profiles" },
  { id: "payments", label: "Payments" },
  { id: "meetings", label: "Meetings" },
  { id: "notifications", label: "Notifications" }
];

export const DATA_INTEGRITY_CHECK_LABELS: Record<DataIntegrityCheckId, string> = Object.fromEntries(
  DATA_INTEGRITY_CHECKS.map((check) => [check.id, check.label])
) as Record<DataIntegrityCheckId, string>;
