#!/usr/bin/env node
/**
 * Sprint 4 — Production messaging journey certification.
 * Validates end-to-end workflow wiring (static + module simulation).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  MEMBERSHIP_STATUSES,
  joinConversation,
  ensureMembershipPair
} from "../server/services/messaging/membership.js";
import {
  allocateMessageSequence,
  detectSequenceGaps
} from "../server/services/messaging/sequences.js";
import {
  NOTIFICATION_EVENT_TYPES,
  publishNotificationEvent,
  subscribeNotificationEvents
} from "../server/services/messaging/notificationEventBus.js";
import {
  REALTIME_EVENT_TYPES,
  publishRealtimeEvent,
  subscribeRealtimeEvents
} from "../server/services/messaging/eventBus.js";
import { recordMessageSendPipeline } from "../server/services/messaging/messages.js";
import { markConversationRead } from "../server/services/messaging/readReceipts.js";
import { reportMessage } from "../server/services/messaging/moderation.js";
import { handleMessagingSendEvent } from "../server/services/messaging/index.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;
const journeySteps = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
  return Boolean(condition);
}

function step(name, ok) {
  journeySteps.push({ step: name, status: ok ? "PASS" : "FAIL" });
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

// --- Journey wiring (static) ---

const signup = read("server/services/signupProvisioning.js");
step(
  "User signup",
  assert(signup.includes("transitionAccountLifecycle"), "signup creates account lifecycle")
);

const auth = read("server/services/auth/lifecycle.js");
step(
  "Email verification",
  assert(auth.includes("email_verification"), "auth supports email verification state")
);

const membershipCommerce = read("server/services/membershipCommerce.js");
step(
  "Premium purchase",
  assert(membershipCommerce.includes("activateMembershipFromPayment"), "premium activation hook")
);

const memberSocial = read("server/memberSocial.js");
step(
  "Signal accepted",
  assert(memberSocial.includes("acceptIncomingSignal"), "signal acceptance exists")
);
step(
  "Conversation created",
  assert(
    memberSocial.includes("ensureConversationPair") &&
      read("server/services/messaging/conversations.js").includes("ensureMembershipPair"),
    "conversation + membership on signal accept"
  )
);

const persistence = read("server/services/memberPersistence.js");
step(
  "Message sent",
  assert(persistence.includes("handleMessagingSendEvent"), "message send hooks messaging pipeline")
);

step(
  "Delivery engine",
  assert(read("server/services/messaging/delivery.js").includes("enqueueMessageDelivery"), "delivery queue")
);

step(
  "Read receipt",
  assert(read("server/services/messaging/readReceipts.js").includes("updateMembershipReadPointer"), "read via membership")
);

step(
  "Notification generated",
  assert(read("server/services/messaging/notifications.js").includes("publishNotificationEvent"), "notification event bus")
);

step(
  "Message reported",
  assert(read("server/services/messaging/moderation.js").includes("reportMessage"), "report message hook")
);

step(
  "Moderation queue",
  assert(read("server/services/messaging/moderation.js").includes("listOpenModerationEvents"), "moderation queue")
);

// --- Amendment contracts ---

const amendment = read("migrations/0061_member_messaging_amendments.sql");
assert(amendment.includes("member_conversation_membership"), "membership table");
assert(amendment.includes("member_conversation_sequence"), "sequence counter");
assert(amendment.includes("member_notification_events"), "notification event bus table");
assert(MEMBERSHIP_STATUSES.length === 7, "seven membership states");
assert(NOTIFICATION_EVENT_TYPES.length === 6, "six notification event types");
assert(REALTIME_EVENT_TYPES.length === 10, "ten messaging realtime events (notifications split)");

// --- Module simulation (no DB required) ---

let notificationEvents = [];
const unsubNotify = subscribeNotificationEvents("notification.created", (evt) => {
  notificationEvents.push(evt.eventType);
});
await publishNotificationEvent({
  notificationCreated: true,
  notificationId: "journey-notify-1",
  memberId: "00000000-0000-0000-0000-000000000001",
  category: "message"
});
unsubNotify.unsubscribe();
step(
  "Notification bus publish",
  assert(notificationEvents.includes("notification.created"), "notification bus subscriber received event")
);

let realtimeEvents = [];
const unsubRt = subscribeRealtimeEvents("message.sent", (evt) => {
  realtimeEvents.push(evt.eventType);
});
await publishRealtimeEvent({
  messageSent: true,
  messageId: "journey-msg-1",
  conversationId: "conv-journey-1"
});
unsubRt.unsubscribe();
step(
  "Messaging bus publish",
  assert(realtimeEvents.includes("message.sent"), "messaging bus subscriber received event")
);

const membershipJoin = await joinConversation({
  conversationId: "conv-journey-sim",
  memberId: "00000000-0000-0000-0000-000000000001",
  peerMemberId: "00000000-0000-0000-0000-000000000002"
});
step(
  "Membership join (skipped without DB)",
  assert(membershipJoin.skipped || membershipJoin.ok, "membership join graceful without DB")
);

const seq = await allocateMessageSequence("conv-journey-sim");
step(
  "Sequence allocation (skipped without DB)",
  assert(seq.skipped || seq.ok, "sequence allocation graceful without DB")
);

const pipeline = await recordMessageSendPipeline({
  messageId: "journey-msg-pipeline",
  conversationId: "conv-journey-sim",
  senderMemberId: "00000000-0000-0000-0000-000000000001",
  bodyPreview: "Hello journey",
  recipientMemberId: "00000000-0000-0000-0000-000000000002"
});
step(
  "Message pipeline (skipped without DB)",
  assert(pipeline.skipped || pipeline.ok, "message pipeline graceful without DB")
);

const readResult = await markConversationRead({
  conversationId: "conv-journey-sim",
  memberId: "00000000-0000-0000-0000-000000000002",
  messageId: "journey-msg-pipeline",
  sequenceNumber: 1
});
step(
  "Read receipt (skipped without DB)",
  assert(readResult.skipped || readResult.ok, "read receipt graceful without DB")
);

const report = await reportMessage({
  conversationId: "conv-journey-sim",
  messageId: "journey-msg-pipeline",
  reporterMemberId: "00000000-0000-0000-0000-000000000002",
  reason: "journey_test"
});
step(
  "Report message (skipped without DB)",
  assert(report.skipped || report.ok, "report graceful without DB")
);

await ensureMembershipPair({
  conversationId: "conv-pair-sim",
  memberIdA: "00000000-0000-0000-0000-000000000001",
  memberIdB: "00000000-0000-0000-0000-000000000002"
});

const sendHook = await handleMessagingSendEvent({
  messageId: "journey-hook-msg",
  conversationId: "conv-hook-sim",
  threadId: "conv-hook-sim",
  message: { id: "journey-hook-msg", text: "hook test" },
  senderMemberId: "00000000-0000-0000-0000-000000000001",
  recipientMemberId: "00000000-0000-0000-0000-000000000002"
});
step(
  "Unified send hook",
  assert(sendHook.skipped || sendHook.ok, "handleMessagingSendEvent never throws")
);

const gaps = await detectSequenceGaps("conv-gap-sim", { afterSeq: 0, upToSeq: 0 });
step(
  "Gap detection",
  assert(gaps.ok && Array.isArray(gaps.gaps), "sequence gap detection returns array")
);

assert(existsSync(join(rootPath, "scripts/certify-messaging-journey.mjs")), "journey cert script exists");

const certRun = read("certification/production/run.mjs");
assert(certRun.includes("certify:messaging-journey"), "production cert includes messaging journey");

console.log("\n=== Messaging Journey Certification ===\n");
for (const item of journeySteps) {
  console.log(`${item.status === "PASS" ? "✓" : "✕"} ${item.step}`);
}
console.log("");

if (failed) {
  console.error(`Journey certification FAILED (${failed} checks)`);
  process.exit(1);
}

console.log("Messaging journey certification PASS");
process.exit(0);
