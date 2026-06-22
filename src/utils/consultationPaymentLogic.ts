import {
  CONSULTATION_PAYMENT_AMOUNT_KOBO,
  CONSULTATION_PAYMENT_AMOUNT_LABEL,
  CONSULTATION_PAYMENT_FEE_LABEL,
  CONSULTATION_PAYMENT_STATUS_LABELS,
  CONSULTATION_PAYMENT_TERMINAL_TIMELINE,
  CONSULTATION_PAYMENT_TIMELINE_STEPS
} from "../constants/consultationPayment";
import type { SignalConciergeStatus } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultationPayment,
  ConsultationPaymentStatus,
  PaymentReceipt,
  PaymentSummary,
  PaymentTimelineEntry,
  PaymentTimelineKind
} from "../types/consultationPayment";

const PAID_MEMBER_STATUSES = new Set<SignalConciergeStatus>([
  "consultation-scheduled",
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married",
  "legacy-archive"
]);

const INITIALIZED_MEMBER_STATUSES = new Set<SignalConciergeStatus>([
  "applied",
  "under-review",
  "waitlisted"
]);

const CANCELLED_MEMBER_STATUSES = new Set<SignalConciergeStatus>(["paused", "closed"]);

const CONSULTATION_ELIGIBLE_STATUSES = new Set<SignalConciergeStatus>([
  "consultation-scheduled",
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married",
  "legacy-archive"
]);

function timelineEntryId(kind: PaymentTimelineKind, at: string): string {
  return `pay_tl_${kind}_${Date.parse(at)}`;
}

export function createTimelineEntry(input: {
  kind: PaymentTimelineKind;
  label: string;
  detail?: string;
  at: string;
}): PaymentTimelineEntry {
  return {
    id: timelineEntryId(input.kind, input.at),
    kind: input.kind,
    label: input.label,
    detail: input.detail,
    at: input.at
  };
}

/** Append-only — never removes or reorders existing entries. */
export function appendTimelineEntry(
  timeline: PaymentTimelineEntry[],
  entry: PaymentTimelineEntry
): PaymentTimelineEntry[] {
  if (timeline.some((item) => item.kind === entry.kind)) return timeline;
  return [...timeline, entry];
}

export function appendTimelineEntries(
  timeline: PaymentTimelineEntry[],
  entries: PaymentTimelineEntry[]
): PaymentTimelineEntry[] {
  return entries.reduce((current, entry) => appendTimelineEntry(current, entry), timeline);
}

export function buildStandardTimelineProgress(
  createdAt: string,
  status: ConsultationPaymentStatus,
  timestamps: {
    initializedAt?: string;
    paidAt?: string;
    consultationEligibleAt?: string;
    failedAt?: string;
    refundedAt?: string;
    cancelledAt?: string;
  } = {}
): PaymentTimelineEntry[] {
  let timeline: PaymentTimelineEntry[] = [
    createTimelineEntry({
      kind: "created",
      label: CONSULTATION_PAYMENT_TIMELINE_STEPS[0].label,
      detail: CONSULTATION_PAYMENT_TIMELINE_STEPS[0].detail,
      at: createdAt
    })
  ];

  const shouldInclude = (kind: PaymentTimelineKind): boolean => {
    if (kind === "payment-initialized") {
      return status === "initialized" || status === "paid" || status === "refunded";
    }
    if (kind === "payment-completed") {
      return status === "paid" || status === "refunded";
    }
    if (kind === "consultation-eligible") {
      return status === "paid" && Boolean(timestamps.consultationEligibleAt);
    }
    return false;
  };

  for (const step of CONSULTATION_PAYMENT_TIMELINE_STEPS.slice(1)) {
    if (!shouldInclude(step.kind)) continue;
    const at =
      step.kind === "payment-initialized"
        ? timestamps.initializedAt ?? createdAt
        : step.kind === "payment-completed"
          ? timestamps.paidAt ?? createdAt
          : timestamps.consultationEligibleAt ?? timestamps.paidAt ?? createdAt;

    timeline = appendTimelineEntry(
      timeline,
      createTimelineEntry({
        kind: step.kind,
        label: step.label,
        detail: step.detail,
        at
      })
    );
  }

  const terminal = CONSULTATION_PAYMENT_TERMINAL_TIMELINE[status];
  if (terminal) {
    const at =
      status === "failed"
        ? timestamps.failedAt ?? createdAt
        : status === "refunded"
          ? timestamps.refundedAt ?? createdAt
          : timestamps.cancelledAt ?? createdAt;

    timeline = appendTimelineEntry(
      timeline,
      createTimelineEntry({
        kind: terminal.kind,
        label: terminal.label,
        detail: terminal.detail,
        at
      })
    );
  }

  return timeline;
}

export function deriveConsultationPaymentStatusFromMember(
  member: ConciergeMemberRecord
): ConsultationPaymentStatus {
  if (CANCELLED_MEMBER_STATUSES.has(member.status)) return "cancelled";
  if (PAID_MEMBER_STATUSES.has(member.status)) return "paid";
  if (INITIALIZED_MEMBER_STATUSES.has(member.status)) return "pending";
  return "pending";
}

export function isConsultationEligibleForMember(member: ConciergeMemberRecord): boolean {
  return CONSULTATION_ELIGIBLE_STATUSES.has(member.status);
}

export function buildPaymentReceipt(payment: ConsultationPayment): PaymentReceipt | undefined {
  if (payment.status !== "paid" && payment.status !== "refunded") return undefined;

  const narrative =
    payment.status === "paid"
      ? `${payment.memberName} — ${CONSULTATION_PAYMENT_FEE_LABEL} received. ${CONSULTATION_PAYMENT_AMOUNT_LABEL}. Permanent record.`
      : `${payment.memberName} — ${CONSULTATION_PAYMENT_FEE_LABEL} refunded.`;

  return {
    paymentId: payment.paymentId,
    issuedAt: payment.paidAt ?? payment.updatedAt,
    memberName: payment.memberName,
    memberId: payment.memberId,
    journeyId: payment.journeyId,
    feeLabel: CONSULTATION_PAYMENT_FEE_LABEL,
    amountLabel: payment.amountLabel,
    amountKobo: payment.amountKobo,
    currency: payment.currency,
    status: payment.status,
    reference: payment.paymentId,
    narrative
  };
}

export function buildPaymentSummary(payment: ConsultationPayment): PaymentSummary {
  const receiptAvailable = payment.status === "paid" || payment.status === "refunded";
  const consultationEligible = payment.status === "paid" && Boolean(payment.consultationEligibleAt);

  return {
    paymentId: payment.paymentId,
    memberId: payment.memberId,
    memberName: payment.memberName,
    journeyId: payment.journeyId,
    feeLabel: CONSULTATION_PAYMENT_FEE_LABEL,
    amountLabel: payment.amountLabel,
    status: payment.status,
    statusLabel: CONSULTATION_PAYMENT_STATUS_LABELS[payment.status],
    receiptAvailable,
    consultationEligible,
    narrative: `${CONSULTATION_PAYMENT_FEE_LABEL} — ${payment.amountLabel}. ${CONSULTATION_PAYMENT_STATUS_LABELS[payment.status]}.`
  };
}

export function createConsultationPaymentDraft(input: {
  id: string;
  paymentId: string;
  member: ConciergeMemberRecord;
  createdAt: string;
}): ConsultationPayment {
  const status = deriveConsultationPaymentStatusFromMember(input.member);
  const now = input.createdAt;
  const eligible = isConsultationEligibleForMember(input.member);
  const paidAt = status === "paid" ? now : undefined;
  const consultationEligibleAt = status === "paid" && eligible ? now : undefined;
  const initializedAt = status === "initialized" ? now : undefined;

  const timeline = buildStandardTimelineProgress(now, status, {
    initializedAt,
    paidAt,
    consultationEligibleAt
  });

  const payment: ConsultationPayment = {
    id: input.id,
    paymentId: input.paymentId,
    memberId: input.member.id,
    journeyId: input.member.journeyId,
    memberName: input.member.aboutYou.name,
    amountKobo: CONSULTATION_PAYMENT_AMOUNT_KOBO,
    amountLabel: CONSULTATION_PAYMENT_AMOUNT_LABEL,
    currency: "NGN",
    feeKind: "consultation-fee",
    status,
    timeline,
    createdAt: now,
    updatedAt: now,
    initializedAt,
    paidAt,
    consultationEligibleAt
  };

  const receipt = buildPaymentReceipt(payment);
  return receipt ? { ...payment, receipt } : payment;
}

export function withConsultationPaymentStatus(
  payment: ConsultationPayment,
  status: ConsultationPaymentStatus,
  at = new Date().toISOString()
): ConsultationPayment {
  const timestamps = {
    initializedAt: payment.initializedAt,
    paidAt: payment.paidAt,
    consultationEligibleAt: payment.consultationEligibleAt,
    failedAt: payment.failedAt,
    refundedAt: payment.refundedAt,
    cancelledAt: payment.cancelledAt
  };

  if (status === "initialized" && !timestamps.initializedAt) timestamps.initializedAt = at;
  if (status === "paid" && !timestamps.paidAt) timestamps.paidAt = at;
  if (status === "failed" && !timestamps.failedAt) timestamps.failedAt = at;
  if (status === "refunded" && !timestamps.refundedAt) timestamps.refundedAt = at;
  if (status === "cancelled" && !timestamps.cancelledAt) timestamps.cancelledAt = at;

  const timeline = buildStandardTimelineProgress(payment.createdAt, status, timestamps);
  const mergedTimeline = appendTimelineEntries(payment.timeline, timeline);

  const next: ConsultationPayment = {
    ...payment,
    status,
    timeline: mergedTimeline,
    updatedAt: at,
    ...timestamps
  };

  const receipt = buildPaymentReceipt(next);
  return receipt ? { ...next, receipt } : { ...next, receipt: undefined };
}
