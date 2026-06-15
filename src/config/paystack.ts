/**
 * Paystack public key — optional on the frontend.
 * Checkout uses hosted authorization_url from the backend; no client key is required.
 * Never use PAYSTACK_SECRET_KEY here.
 */
export function getPaystackPublicKey(): string {
  const vite = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.trim();
  const next = import.meta.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  return vite || next || "";
}

export function isValidPaystackPublicKey(key: string): boolean {
  return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(key);
}

export const PAYMENT_START_ERROR = "Payment could not start. Please try again.";
export const PAYMENT_PUBLIC_KEY_ERROR =
  "Payment setup error: public key is missing or invalid. Please contact support.";
