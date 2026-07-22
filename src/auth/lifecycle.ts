/**
 * Account lifecycle contracts — Sprint 2.
 * Extends existing account_status; does not replace Supabase Auth.
 */

export type AccountLifecycleStatus =
  | "pending"
  | "email_verification"
  | "profile_completion"
  | "active"
  | "suspended"
  | "locked"
  | "disabled"
  | "deleted"
  | "recovered"
  | "archived";

export type AccountLifecycleTransition = {
  logId: string;
  profileId: string | null;
  previousStatus: AccountLifecycleStatus;
  newStatus: AccountLifecycleStatus;
  reasonCode: string;
  reason: string;
  actor: string;
  actorRole: "member" | "admin" | "system";
  occurredAt: string;
};

export const ACCOUNT_LIFECYCLE_STAGES: readonly {
  status: AccountLifecycleStatus;
  label: string;
  terminal: boolean;
}[] = [
  { status: "pending", label: "Pending", terminal: false },
  { status: "email_verification", label: "Email Verification", terminal: false },
  { status: "profile_completion", label: "Profile Completion", terminal: false },
  { status: "active", label: "Active", terminal: false },
  { status: "suspended", label: "Suspended", terminal: false },
  { status: "locked", label: "Locked", terminal: false },
  { status: "disabled", label: "Disabled", terminal: false },
  { status: "deleted", label: "Deleted", terminal: true },
  { status: "recovered", label: "Recovered", terminal: false },
  { status: "archived", label: "Archived", terminal: true }
] as const;
