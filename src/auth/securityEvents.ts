/**
 * Authentication security event contracts — append-only audit.
 */

export type AuthSecurityEventType =
  | "signup"
  | "login"
  | "logout"
  | "failed_login"
  | "password_reset_requested"
  | "password_reset_completed"
  | "email_verified"
  | "pin_changed"
  | "pin_reset"
  | "session_revoked"
  | "device_registered"
  | "device_removed"
  | "account_locked"
  | "account_suspended"
  | "account_deleted"
  | "account_restored"
  | "recovery_requested"
  | "recovery_completed";

export type AuthSecurityEventRecord = {
  eventId: string;
  eventType: AuthSecurityEventType;
  authUserId: string | null;
  profileId: string | null;
  sessionId: string | null;
  deviceId: string | null;
  summary: string;
  occurredAt: string;
};
