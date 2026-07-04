import {
  appendPaymentAudit,
  recordPaymentVerified
} from "./paymentEvents.js";
import { claimFulfillmentEmailSend, fulfillmentEmailAlreadySent } from "./paymentFulfillments.js";
import { requireDatabaseReadyForPayments } from "./paymentDb.js";
import {
  buildPurchaseConfirmationEmailBody,
  buildPurchaseConfirmationPlainText,
  loadEmailBranding,
  wrapEmailLayoutAsync
} from "./emailBranding.js";
import { logAlertableEvent, logObservabilityEvent, logThresholdedAlert } from "./observability.js";
import { isRetryableHttpStatus, isRetryableNetworkError, withBoundedRetry } from "./retryPolicy.js";

const SUPPORT_EMAIL = "support@bamsignal.com";

function formatNairaFromKobo(amountKobo) {
  const naira = Math.round(Number(amountKobo || 0) / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

function formatPurchaseDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos"
  }).format(date);
}

function productDisplayName(productType, productId) {
  const id = String(productId || "").trim();
  if (productType === "consultation-fee") return "Signal Concierge consultation fee";
  if (productType === "premium") return "Signal Pass";
  if (productType === "quickie") return "Fast Connection Pass";
  if (productType === "boost") {
    switch (id) {
      case "signal-boost":
        return "Boost Visibility";
      case "priority-signal-once":
        return "Priority Introduction";
      case "profile-boost":
        return "Featured Profile";
      case "city-boost":
        return "City Boost";
      case "city-spotlight":
        return "City Spotlight";
      default:
        return "Boost";
    }
  }
  return "BamSignal purchase";
}

function purchaseEmailSubject(productType, productId) {
  const id = String(productId || "").trim();
  if (productType === "consultation-fee") return "Your consultation fee is confirmed";
  if (productType === "premium") return "Your Signal Pass is active ❤️";
  if (productType === "quickie") return "Your Fast Connection Pass is active ❤️";
  if (productType === "boost") {
    if (id === "priority-signal-once") return "Your Priority Introduction is ready";
    if (id === "profile-boost") return "Your Featured Profile is active";
    return "Your Boost is live on BamSignal";
  }
  return "Your BamSignal purchase is confirmed";
}

function nextStepsCopy(productType, productId) {
  const id = String(productId || "").trim();
  if (productType === "consultation-fee") {
    return "Your consultation fee is received. You may now schedule your private Signal Concierge consultation when you are ready.";
  }
  if (productType === "premium") {
    return "Your Signal Pass benefits are now active — unlimited signals, premium filters, and more.";
  }
  if (productType === "quickie") {
    return "Your Fast Connection Pass is active — unlock faster connections this week.";
  }
  if (productType === "boost") {
    if (id === "priority-signal-once") {
      return "Your next Signal will be prioritized — send one when you're ready.";
    }
    if (id === "profile-boost") {
      return "Your profile is featured statewide — keep your photos and bio fresh.";
    }
    return "Your boost is live — open BamSignal to see it in action.";
  }
  return "Your BamSignal benefits are now active.";
}

async function sendResendPurchaseEmail({ to, subject, html, text, reference = null }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logObservabilityEvent(
      "email_send_skipped",
      { reason: "resend_not_configured", channel: "purchase_confirmation" },
      "warn"
    );
    return { ok: false, skipped: true, reason: "resend_not_configured" };
  }

  const from =
    process.env.SUPPORT_EMAIL_FROM?.trim() ||
    process.env.SIGNUP_EMAIL_FROM?.trim() ||
    "BamSignal <support@bamsignal.com>";

  const response = await withBoundedRetry(
    async () => {
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ from, to, subject, html, text })
      });

      if (!result.ok && isRetryableHttpStatus(result.status)) {
        const error = new Error(`resend_status_${result.status}`);
        error.status = result.status;
        throw error;
      }

      return result;
    },
    {
      service: "resend",
      attempts: 3,
      shouldRetry: (error) => isRetryableNetworkError(error) || isRetryableHttpStatus(error?.status),
      context: { channel: "purchase_confirmation", reference }
    }
  );

  if (!response.ok) {
    logThresholdedAlert("email_send_failed", {
      channel: "purchase_confirmation",
      reference,
      status: response.status,
      reason: "resend_rejected"
    });
    return { ok: false, error: "email_send_failed" };
  }

  return { ok: true };
}

export async function sendPurchaseConfirmationEmail({
  reference,
  email,
  firstName,
  productType,
  productId,
  amountKobo,
  userId,
  returnPath
}) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!reference || !normalizedEmail.includes("@")) {
    return { ok: false, skipped: true, reason: "missing_recipient" };
  }

  requireDatabaseReadyForPayments();

  await recordPaymentVerified({
    reference,
    userId,
    userEmail: normalizedEmail,
    productType,
    productId,
    amountKobo,
    returnPath
  });

  if (await fulfillmentEmailAlreadySent(reference)) {
    await appendPaymentAudit(reference, "payment_success_email_skipped", {
      reason: "already_sent",
      userId: userId || null,
      productType,
      productId
    });
    return { ok: true, skipped: true, reason: "already_sent" };
  }

  const claimed = await claimFulfillmentEmailSend(reference);
  if (!claimed) {
    await appendPaymentAudit(reference, "payment_success_email_skipped", {
      reason: "already_sent",
      userId: userId || null,
      productType,
      productId
    });
    return { ok: true, skipped: true, reason: "already_sent" };
  }

  const productName = productDisplayName(productType, productId);
  const amountLabel = formatNairaFromKobo(amountKobo);
  const purchasedAt = formatPurchaseDate();
  const safeName = String(firstName || "there").trim() || "there";
  const branding = await loadEmailBranding();
  const bodyHtml = buildPurchaseConfirmationEmailBody({
    firstName: safeName,
    productName,
    amountLabel,
    reference,
    purchasedAt,
    nextSteps: nextStepsCopy(productType, productId),
    supportEmail: SUPPORT_EMAIL
  });
  const html = await wrapEmailLayoutAsync({
    branding,
    preheader: `${productName} purchase confirmed`,
    bodyHtml
  });
  const text = buildPurchaseConfirmationPlainText({
    firstName: safeName,
    productName,
    amountLabel,
    reference,
    purchasedAt,
    nextSteps: nextStepsCopy(productType, productId),
    supportEmail: SUPPORT_EMAIL
  });

  const sendResult = await sendResendPurchaseEmail({
    to: normalizedEmail,
    subject: purchaseEmailSubject(productType, productId),
    html,
    text,
    reference
  });

  if (!sendResult.ok) {
    await appendPaymentAudit(reference, "payment_success_email_failed", {
      userId: userId || null,
      productType,
      productId,
      error: sendResult.error || sendResult.reason || "send_failed"
    });
    return sendResult;
  }

  await appendPaymentAudit(reference, "payment_success_email_sent", {
    userId: userId || null,
    userEmail: normalizedEmail,
    productType,
    productId,
    returnPath: returnPath || null
  });

  return { ok: true, sent: true };
}

export async function logPaymentInitialized({
  reference,
  userId,
  authUserId,
  profileId,
  userEmail,
  productType,
  productId,
  returnPath
}) {
  await appendPaymentAudit(reference, "payment_initialized", {
    userId: userId || authUserId || null,
    authUserId: authUserId || userId || null,
    profileId: profileId || null,
    userEmail: userEmail || null,
    productType,
    productId,
    returnPath: returnPath || null
  });
}
