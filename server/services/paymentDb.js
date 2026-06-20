import { isDatabaseReady, query } from "../db.js";

export const PAYMENT_DB_UNAVAILABLE = "payment_db_unavailable";
export const PAYMENT_PERSISTENCE_FAILED = "payment_persistence_failed";
export const PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE =
  "Payment could not be confirmed right now. Please try again.";

export class PaymentDatabaseError extends Error {
  constructor(message = PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE, code = PAYMENT_DB_UNAVAILABLE) {
    super(message);
    this.name = "PaymentDatabaseError";
    this.code = code;
  }
}

export function requireDatabaseReadyForPayments() {
  if (!isDatabaseReady()) {
    throw new PaymentDatabaseError();
  }
}

export async function paymentQuery(text, params = []) {
  requireDatabaseReadyForPayments();
  return query(text, params);
}

export function assertPaymentPersistenceRow(row, message = PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE) {
  if (!row) {
    throw new PaymentDatabaseError(message, PAYMENT_PERSISTENCE_FAILED);
  }
  return row;
}

export function isPaymentDatabaseError(error) {
  return (
    error instanceof PaymentDatabaseError ||
    error?.code === PAYMENT_DB_UNAVAILABLE ||
    error?.code === PAYMENT_PERSISTENCE_FAILED
  );
}

export function paymentHttpStatusForError(error) {
  return isPaymentDatabaseError(error) ? 503 : 500;
}
