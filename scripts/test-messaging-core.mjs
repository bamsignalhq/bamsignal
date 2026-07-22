#!/usr/bin/env node
/**
 * Sprint 4 — Messaging, Notifications, Presence & Realtime tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONVERSATION_STATUSES } from "../server/services/messaging/conversations.js";
import { MESSAGE_STATUSES } from "../server/services/messaging/messages.js";
import { REALTIME_EVENT_TYPES } from "../server/services/messaging/eventBus.js";
import { NOTIFICATION_EVENT_TYPES } from "../server/services/messaging/notificationEventBus.js";
import { NOTIFICATION_CATEGORIES } from "../server/services/messaging/notifications.js";
import {
  resolveMessageIdempotencyKey,
  resolveDeliveryIdempotencyKey,
  resolveNotificationIdempotencyKey
} from "../server/services/messaging/idempotency.js";
import {
  getMessagingObservabilityMetrics,
  incrementMessagingMetric
} from "../server/services/messaging/observability.js";
import { computeRetryBackoff } from "../server/services/messaging/delivery.js";
import { MEMBERSHIP_STATUSES } from "../server/services/messaging/membership.js";
import { PRODUCTION_CERT_VERSION } from "../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

const migration = read("migrations/0060_member_messaging_core.sql");
assert(migration.includes("member_conversation_state"), "conversation state table");
assert(migration.includes("member_message_state"), "message state table");
assert(migration.includes("member_message_delivery_queue"), "delivery queue");
assert(migration.includes("member_presence_state"), "presence table");
assert(migration.includes("member_realtime_events"), "realtime events");
assert(migration.includes("member_notification_outbox"), "notification outbox");
assert(migration.includes("member_messaging_moderation_events"), "moderation events");

const amendment = read("migrations/0061_member_messaging_amendments.sql");
assert(amendment.includes("member_conversation_membership"), "membership service table");
assert(amendment.includes("member_conversation_sequence"), "message sequence table");
assert(amendment.includes("member_notification_events"), "notification event bus table");

const schema = read("server/services/schemaVerification.js");
for (const table of [
  "member_conversation_state",
  "member_conversation_lifecycle_log",
  "member_message_state",
  "member_message_lifecycle_log",
  "member_message_delivery_queue",
  "member_conversation_read_state",
  "member_presence_state",
  "member_typing_state",
  "member_notification_outbox",
  "member_realtime_events",
  "member_messaging_moderation_events",
  "member_conversation_membership",
  "member_conversation_membership_log",
  "member_conversation_sequence",
  "member_notification_events"
]) {
  assert(schema.includes(`"${table}"`), `schema requires ${table}`);
}

const persistence = read("server/services/memberPersistence.js");
assert(persistence.includes("handleMessagingSendEvent"), "persistMessage hooks messaging pipeline");

const memberSocial = read("server/memberSocial.js");
assert(memberSocial.includes("ensureConversationPair"), "signal accept hooks conversation lifecycle");
assert(read("server/services/messaging/membership.js").includes("ensureMembershipPair"), "membership pair on accept");
assert(read("server/services/messaging/messages.js").includes("allocateMessageSequence"), "sequence numbers on send");
assert(read("server/services/messaging/notificationEventBus.js").includes("notification.queued"), "notification event bus");
assert(existsSync(join(rootPath, "scripts/certify-messaging-journey.mjs")), "journey certification script");

const appSource = read("server/app.js");
assert(appSource.includes("/api/messaging/member"), "member messaging route");
assert(appSource.includes("/api/messaging/admin"), "admin messaging route");

assert(CONVERSATION_STATUSES.length === 8, "eight conversation states");
assert(MESSAGE_STATUSES.length === 9, "nine message states");
assert(REALTIME_EVENT_TYPES.length === 10, "ten messaging realtime event types");
assert(NOTIFICATION_EVENT_TYPES.length === 6, "six notification event types");
assert(MEMBERSHIP_STATUSES.length === 7, "seven membership states");
assert(NOTIFICATION_CATEGORIES.length === 8, "eight notification categories");

assert(
  resolveMessageIdempotencyKey({ messageId: "m1", conversationId: "c1" }) === "msg:c1:m1",
  "message idempotency key"
);
assert(
  resolveDeliveryIdempotencyKey("m1", "u1") === "delivery:m1:u1:deliver",
  "delivery idempotency key"
);
assert(resolveNotificationIdempotencyKey("n1") === "notify:n1", "notification idempotency key");

const backoff = computeRetryBackoff(2);
assert(new Date(backoff).getTime() > Date.now(), "retry backoff future");

incrementMessagingMetric("messagesSent", 1);
const metrics = getMessagingObservabilityMetrics();
assert(metrics.messagesSent >= 1, "messaging metrics");

assert(PRODUCTION_CERT_VERSION === "1.4.0", "certification version for Sprint 4");

for (const doc of [
  "docs/architecture/MESSAGING.md",
  "docs/architecture/PRESENCE.md",
  "docs/architecture/NOTIFICATIONS.md",
  "docs/architecture/REALTIME.md",
  "docs/operations/MESSAGING_RUNBOOK.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

const messagingIndex = read("src/messaging/index.ts");
assert(messagingIndex.includes("MembershipStatus"), "TS membership contracts");

const operator = read("server/services/operatorDashboardContract.js");
assert(operator.includes("getMessagingObservabilityMetrics"), "operator dashboard messaging metrics");

if (failed) process.exit(1);
console.log("messaging core tests ok");
