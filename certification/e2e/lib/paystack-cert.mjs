/**
 * Invoke existing Paystack webhook handler for certification fulfillment checks.
 */
import crypto from "node:crypto";
import { config } from "../config.mjs";

export async function simulatePremiumWebhook(email, { reference, productId = "signal-pass-monthly" } = {}) {
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET?.trim() || process.env.PAYSTACK_SECRET_KEY?.trim() || "";
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY or PAYSTACK_WEBHOOK_SECRET required for webhook certification.");
  }

  const ref = String(reference || `cert-premium-${config.runId}`).trim();
  const payload = {
    event: "charge.success",
    data: {
      reference: ref,
      amount: 399900,
      status: "success",
      customer: { email: email.trim().toLowerCase() },
      metadata: {
        product_type: "premium",
        product_id: productId,
        user_email: email.trim().toLowerCase()
      }
    }
  };
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

  const response = await fetch(`${config.baseUrl}/api/paystack/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": signature
    },
    body: rawBody
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { ok: response.ok, status: response.status, body, reference: ref };
}
