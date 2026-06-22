export type ConsultationPaymentStatus =
  | "pending"
  | "initialized"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentTimelineKind =
  | "created"
  | "payment-created"
  | "payment-initialized"
  | "payment-completed"
  | "consultation-eligible"
  | "consultation-unlocked"
  | "payment-failed"
  | "payment-refunded"
  | "payment-cancelled";

export type PaymentTimelineEntry = {
  id: string;
  kind: PaymentTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type PaymentReceipt = {
  paymentId: string;
  issuedAt: string;
  memberName: string;
  memberId: string;
  journeyId?: string;
  feeLabel: string;
  amountLabel: string;
  amountKobo: number;
  currency: "NGN";
  status: ConsultationPaymentStatus;
  reference?: string;
  narrative: string;
};

export type ConsultationPayment = {
  id: string;
  paymentId: string;
  memberId: string;
  journeyId?: string;
  memberName: string;
  amountKobo: number;
  amountLabel: string;
  currency: "NGN";
  feeKind: "consultation-fee";
  status: ConsultationPaymentStatus;
  timeline: PaymentTimelineEntry[];
  receipt?: PaymentReceipt;
  createdAt: string;
  updatedAt: string;
  initializedAt?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  cancelledAt?: string;
  consultationEligibleAt?: string;
  paystackReference?: string;
};

export type PaymentSummary = {
  paymentId: string;
  memberId: string;
  memberName: string;
  journeyId?: string;
  feeLabel: string;
  amountLabel: string;
  status: ConsultationPaymentStatus;
  statusLabel: string;
  receiptAvailable: boolean;
  consultationEligible: boolean;
  narrative: string;
};

/** Reserved — not implemented. */
export type ConsultationPaymentGateway =
  | "paystack"
  | "flutterwave"
  | "stripe";

/** Reserved — not implemented. */
export type ConsultationPaymentFutureCapability =
  | "international-currencies"
  | "discount-codes"
  | "scholarships";

export type ConsultationPaymentFutureConfig = {
  gateway?: ConsultationPaymentGateway;
  capability?: ConsultationPaymentFutureCapability;
  enabled?: boolean;
};
