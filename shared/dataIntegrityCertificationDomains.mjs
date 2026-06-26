/** Data Integrity Certification™ — verified domain registry. */

export const DATA_INTEGRITY_CERT_DOMAINS = [
  { id: "members", label: "Members", table: "app_users" },
  { id: "profiles", label: "Profiles", table: "app_member_profiles" },
  { id: "photos", label: "Photos", table: "photo_reviews" },
  { id: "signals", label: "Signals", table: "app_signals" },
  { id: "matches", label: "Matches", table: "app_matches" },
  { id: "chats", label: "Chats", table: "app_chat_threads" },
  { id: "messages", label: "Messages", table: "app_messages" },
  { id: "notifications", label: "Notifications", table: "payment_events" },
  { id: "payments", label: "Payments", table: "payment_fulfillments" },
  { id: "consultations", label: "Consultations", table: "member_introductions" },
  { id: "journey-ids", label: "Journey IDs", table: "concierge_members" },
  { id: "reports", label: "Reports", table: "app_reports" },
  { id: "saved-profiles", label: "Saved Profiles", table: "saved_profiles" },
  { id: "premium-status", label: "Premium Status", table: "app_users" },
  { id: "subscriptions", label: "Subscriptions", table: "subscription_events" },
  { id: "feature-flags", label: "Feature Flags", table: "platform_settings" },
  { id: "remote-config", label: "Remote Config", table: "platform_settings" },
  { id: "audit-logs", label: "Audit Logs", table: "audit_logs" }
];

export const DATA_INTEGRITY_CERT_BLOCK_ON_CRITICAL = true;
