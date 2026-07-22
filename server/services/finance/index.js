export { FINANCIAL_STATUSES, transitionFinancialLifecycle, listFinancialLifecycleTransitions } from "./lifecycle.js";
export {
  appendFinancialLedgerEntry,
  getLedgerEntriesByReference,
  getLedgerEntriesForMember,
  searchLedgerEntries,
  recordPaymentLedgerEvent
} from "./ledger.js";
export { deriveMemberWalletSnapshot, deriveWalletByUserKey } from "./wallet.js";
export { createRefundRecord, completeRefundRecord, listRefundRecords, listRefundsForMember } from "./refunds.js";
export { runFinancialReconciliation, getLatestReconciliationRun } from "./reconciliation.js";
export {
  incrementFinancialMetric,
  recordGatewayLatency,
  getFinancialObservabilityMetrics,
  classifyProductMetric
} from "./observability.js";
export { buildAdminFinancialOperationsContract } from "./adminContract.js";
export {
  FINANCIAL_EVENT_TYPES,
  publishFinancialEvent,
  subscribeFinancialEvents,
  listFinancialEvents,
  resolvePaymentFinancialEventType
} from "./eventBus.js";
export {
  resolveFinancialIdempotencyKey,
  resolveRefundIdempotencyKey,
  resolveWebhookIdempotencyKey
} from "./idempotency.js";
export {
  SUBSCRIPTION_STATUSES,
  resolveSubscriptionStatus,
  transitionSubscriptionLifecycle,
  getSubscriptionState,
  listSubscriptionTransitions,
  recordSubscriptionActivatedFromPayment
} from "./subscriptions.js";

/** Unified payment financial hook — never throws. */
export async function handlePaymentFinancialEvent(input = {}) {
  const { recordPaymentLedgerEvent } = await import("./ledger.js");
  const { classifyProductMetric, incrementFinancialMetric } = await import("./observability.js");
  const { deriveMemberWalletSnapshot } = await import("./wallet.js");

  const result = await recordPaymentLedgerEvent(input);
  if (input.productType) classifyProductMetric(input.productType);
  if (input.lifecycleStatus === "successful" && input.amountKobo) {
    incrementFinancialMetric("revenueKobo", Number(input.amountKobo) || 0);
  }
  if (input.duplicateWebhook) incrementFinancialMetric("duplicateWebhooks");

  if (input.lifecycleStatus === "successful" && input.memberId) {
    await deriveMemberWalletSnapshot(input.memberId, { publishEvent: true });
    void import("../passportIntegration/index.js")
      .then(({ handlePlatformTrustEvent }) =>
        handlePlatformTrustEvent({
          memberId: input.memberId,
          sourceSystem: "finance",
          eventType: "payment_successful",
          correlationId: input.reference || input.transactionId,
          payload: { amountKobo: input.amountKobo, productType: input.productType }
        })
      )
      .catch(() => {});
  }

  if (input.lifecycleStatus === "refunded" && input.memberId) {
    void import("../passportIntegration/index.js")
      .then(({ handlePlatformTrustEvent }) =>
        handlePlatformTrustEvent({
          memberId: input.memberId,
          sourceSystem: "finance",
          eventType: "payment_refund",
          correlationId: input.reference || input.transactionId
        })
      )
      .catch(() => {});
  }

  return result;
}
