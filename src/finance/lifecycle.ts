/**
 * Financial transaction lifecycle — Sprint 3.
 */

export type FinancialTransactionStatus =
  | "initialized"
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "cancelled"
  | "refunded"
  | "reversed"
  | "expired";

export const FINANCIAL_TRANSACTION_STATUSES: readonly FinancialTransactionStatus[] = [
  "initialized",
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
  "refunded",
  "reversed",
  "expired"
] as const;

export type FinancialLedgerEntry = {
  entryId: string;
  transactionId: string;
  reference: string | null;
  amountKobo: number;
  netKobo: number;
  lifecycleStatus: FinancialTransactionStatus;
  purpose: string;
  createdAt: string;
};

export type MemberWalletSnapshot = {
  balanceKobo: number;
  pendingCreditsKobo: number;
  pendingDebitsKobo: number;
  reservedKobo: number;
  lifetimeSpendKobo: number;
  lifetimePurchasesKobo: number;
  lifetimeRefundsKobo: number;
  derivedAt: string;
};
