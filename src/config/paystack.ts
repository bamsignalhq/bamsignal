/** Paystack public key — frontend only. Never use secret key here. */
export function getPaystackPublicKey(): string {
  const vite = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.trim();
  const next = import.meta.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  return vite || next || "";
}

export function isValidPaystackPublicKey(key: string): boolean {
  return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(key);
}

export function paystackInlineReady(): boolean {
  const key = getPaystackPublicKey();
  return Boolean(key) && isValidPaystackPublicKey(key);
}

export const PAYMENT_START_ERROR = "Payment could not start. Please try again.";
