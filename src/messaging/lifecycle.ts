export type ConversationStatus =
  | "pending"
  | "active"
  | "archived"
  | "muted"
  | "blocked"
  | "reported"
  | "closed"
  | "deleted";

export type MembershipStatus =
  | "joined"
  | "left"
  | "removed"
  | "blocked"
  | "muted"
  | "hidden"
  | "archived";

export type MessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "edited"
  | "deleted"
  | "failed"
  | "expired";

export type PresenceStatus = "online" | "offline" | "invisible";

export type NotificationCategory =
  | "message"
  | "match"
  | "subscription"
  | "payment"
  | "safety"
  | "moderation"
  | "system"
  | "referral";

export type NotificationChannel = "in_app" | "push" | "email" | "sms";

export type RealtimeEventType =
  | "conversation.created"
  | "conversation.archived"
  | "message.sent"
  | "message.delivered"
  | "message.read"
  | "message.failed"
  | "presence.online"
  | "presence.offline"
  | "typing.started"
  | "typing.stopped";

export type NotificationEventType =
  | "notification.created"
  | "notification.queued"
  | "notification.sent"
  | "notification.failed"
  | "notification.dismissed"
  | "notification.read";

export const CONVERSATION_STATUSES: readonly ConversationStatus[] = [
  "pending",
  "active",
  "archived",
  "muted",
  "blocked",
  "reported",
  "closed",
  "deleted"
] as const;

export const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = [
  "joined",
  "left",
  "removed",
  "blocked",
  "muted",
  "hidden",
  "archived"
] as const;

export const MESSAGE_STATUSES: readonly MessageStatus[] = [
  "queued",
  "sending",
  "sent",
  "delivered",
  "read",
  "edited",
  "deleted",
  "failed",
  "expired"
] as const;

export const REALTIME_EVENT_TYPES: readonly RealtimeEventType[] = [
  "conversation.created",
  "conversation.archived",
  "message.sent",
  "message.delivered",
  "message.read",
  "message.failed",
  "presence.online",
  "presence.offline",
  "typing.started",
  "typing.stopped"
] as const;

export const NOTIFICATION_EVENT_TYPES: readonly NotificationEventType[] = [
  "notification.created",
  "notification.queued",
  "notification.sent",
  "notification.failed",
  "notification.dismissed",
  "notification.read"
] as const;
