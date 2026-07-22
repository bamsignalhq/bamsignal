import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { publishFinancialEvent } from "./eventBus.js";

export const SUBSCRIPTION_STATUSES = Object.freeze([
  "trial",
  "active",
  "grace_period",
  "payment_pending",
  "expired",
  "cancelled",
  "suspended"
]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_subscription_state");
    await assertSchemaTable("member_subscription_lifecycle_log");
    return true;
  } catch {
    return false;
  }
}

/**
 * Derive subscription status from existing membership fields — does not replace membership engine.
 */
export function resolveSubscriptionStatus(member = {}, context = {}) {
  if (member.shadow_banned || context.suspended) return "suspended";
  if (context.cancelled) return "cancelled";

  const premiumUntil = member.premium_until ? new Date(member.premium_until) : null;
  const now = Date.now();
  const isPremium = Boolean(member.is_premium || context.isPremium);

  if (context.paymentPending) return "payment_pending";
  if (context.trial) return "trial";

  if (premiumUntil && premiumUntil.getTime() > now) {
    const graceMs = Number(context.gracePeriodMs) || 3 * 24 * 60 * 60 * 1000;
    if (premiumUntil.getTime() - now <= graceMs && context.inGraceWindow) {
      return "grace_period";
    }
    return "active";
  }

  if (isPremium) return "active";
  if (premiumUntil && premiumUntil.getTime() <= now) return "expired";
  return context.hadSubscription ? "expired" : "cancelled";
}

export async function transitionSubscriptionLifecycle(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!SUBSCRIPTION_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTables()) || !input.memberId) return { ok: false, skipped: true };

  const previousStatus = String(input.previousStatus || "unknown");
  const logId = String(input.logId || crypto.randomUUID());

  try {
    await query(
      `insert into member_subscription_lifecycle_log (
         log_id, member_id, previous_status, new_status, reason_code, reason, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
       on conflict (log_id) do nothing`,
      [
        logId,
        input.memberId,
        previousStatus,
        newStatus,
        String(input.reasonCode || "system"),
        String(input.reason || "").slice(0, 500),
        String(input.actor || "system"),
        JSON.stringify(input.metadata || {})
      ]
    );

    await query(
      `insert into member_subscription_state (member_id, status, product_id, plan_id, source_payment_ref, metadata)
       values ($1,$2,$3,$4,$5,$6::jsonb)
       on conflict (member_id) do update set
         status = excluded.status,
         product_id = coalesce(excluded.product_id, member_subscription_state.product_id),
         plan_id = coalesce(excluded.plan_id, member_subscription_state.plan_id),
         source_payment_ref = coalesce(excluded.source_payment_ref, member_subscription_state.source_payment_ref),
         metadata = member_subscription_state.metadata || excluded.metadata,
         updated_at = now()`,
      [
        input.memberId,
        newStatus,
        input.productId || null,
        input.planId || null,
        input.sourcePaymentRef || null,
        JSON.stringify(input.metadata || {})
      ]
    );

    const eventType =
      newStatus === "expired"
        ? "subscription.expired"
        : newStatus === "active" || newStatus === "trial"
          ? "subscription.activated"
          : null;

    if (eventType) {
      await publishFinancialEvent({
        eventType,
        subscriptionActivated: eventType === "subscription.activated",
        subscriptionExpired: eventType === "subscription.expired",
        memberId: input.memberId,
        reference: input.sourcePaymentRef || null,
        productId: input.productId || null,
        subscriptionStatus: newStatus,
        idempotencyKey: `subscription:${input.memberId}:${newStatus}:${input.sourcePaymentRef || logId}`
      });
    }

    return { ok: true, logId, previousStatus, newStatus };
  } catch (error) {
    console.warn("[finance:subscriptions] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

export async function getSubscriptionState(memberId) {
  if (!(await ensureTables()) || !memberId) return null;
  const { rows } = await query(
    `select member_id, status, product_id, plan_id, source_payment_ref, updated_at
     from member_subscription_state where member_id = $1`,
    [memberId]
  );
  return rows[0] || null;
}

export async function listSubscriptionTransitions(memberId, options = {}) {
  if (!(await ensureTables()) || !memberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason_code, reason, actor, occurred_at
     from member_subscription_lifecycle_log
     where member_id = $1
     order by occurred_at desc
     limit $2`,
    [memberId, limit]
  );
  return rows;
}

/** Hook after membership payment activation */
export async function recordSubscriptionActivatedFromPayment(input = {}) {
  if (!input.memberId) return { ok: false, skipped: true };
  const previous = (await getSubscriptionState(input.memberId))?.status || "payment_pending";
  return transitionSubscriptionLifecycle({
    memberId: input.memberId,
    previousStatus: previous,
    newStatus: input.trial ? "trial" : "active",
    productId: input.productId || null,
    planId: input.planId || null,
    sourcePaymentRef: input.paymentRef || null,
    reasonCode: "payment_activation",
    reason: "Subscription activated from payment",
    actor: "payment_fortress",
    metadata: input.metadata || {}
  });
}
