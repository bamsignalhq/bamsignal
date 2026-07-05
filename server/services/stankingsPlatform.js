/**
 * BamSignal → Stankings Platform client.
 * All shared capabilities route through HQ; zero duplicate wallet/notification/purchase logic.
 */

const PLATFORM_URL = () => String(process.env.STANKINGS_PLATFORM_URL || "").replace(/\/$/, "");
const PLATFORM_KEY = () => String(process.env.STANKINGS_PLATFORM_SERVICE_KEY || "").trim();

export function isStankingsPlatformEnabled() {
  return Boolean(PLATFORM_URL());
}

async function platformFetch(path, { method = "GET", body } = {}) {
  const base = PLATFORM_URL();
  if (!base) return { ok: false, skipped: true, error: "STANKINGS_PLATFORM_URL not set" };

  const headers = { "Content-Type": "application/json" };
  if (PLATFORM_KEY()) headers["x-stankings-platform-key"] = PLATFORM_KEY();

  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: payload.error || response.statusText, status: response.status };
  }
  return payload;
}

export async function joinStankingsIdentity({ memberId, email, displayName }) {
  return platformFetch("/api/platform/bamsignal/identity/join", {
    method: "POST",
    body: { memberId, email, displayName }
  });
}

export async function purchaseViaPlatform({ memberId, email, displayName, productType, productId, idempotencyKey }) {
  return platformFetch("/api/platform/bamsignal/purchase", {
    method: "POST",
    body: { memberId, email, displayName, productType, productId, idempotencyKey }
  });
}

export async function resumePlatformPurchase({ memberId, email, resumeToken, paystackReference }) {
  return platformFetch("/api/platform/bamsignal/purchase", {
    method: "PUT",
    body: { memberId, email, resumeToken, paystackReference }
  });
}

export async function getPlatformWallet({ memberId, email }) {
  const query = new URLSearchParams({ memberId, ...(email ? { email } : {}) });
  return platformFetch(`/api/platform/bamsignal/wallet?${query}`);
}

export async function getPlatformWalletHome({ memberId, email, displayName }) {
  const query = new URLSearchParams({
    memberId,
    ...(email ? { email } : {}),
    ...(displayName ? { displayName } : {})
  });
  return platformFetch(`/api/platform/bamsignal/wallet/home?${query}`);
}

export async function purchaseViaWalletGate({
  memberId,
  email,
  displayName,
  entry,
  productId,
  idempotencyKey
}) {
  return platformFetch("/api/platform/bamsignal/wallet/purchase-gate", {
    method: "POST",
    body: { memberId, email, displayName, entry, productId, idempotencyKey }
  });
}

export async function notifyStankingsPlatform({
  memberId,
  email,
  templateId,
  title,
  body,
  category = "purchase",
  metadata = {}
}) {
  return platformFetch("/api/platform/bamsignal/notify", {
    method: "POST",
    body: { memberId, email, templateId, title, body, category, metadata }
  });
}

/** Map BamSignal fulfillment to platform notification template. */
export function platformNotificationForPurchase({ productType, productId }) {
  if (productType === "premium") {
    return {
      templateId: "premium_activated",
      title: "Premium Activated",
      body: "Your Signal Pass is active on BamSignal.",
      category: "purchase"
    };
  }
  if (productType === "boost") {
    const id = String(productId || "");
    if (id === "priority-signal-once") {
      return {
        templateId: "boost_activated",
        title: "Priority Signal Activated",
        body: "Your Priority Introduction is ready.",
        category: "purchase"
      };
    }
    return {
      templateId: "boost_activated",
      title: "Boost Activated",
      body: "Your boost is live on BamSignal.",
      category: "purchase"
    };
  }
  return {
    templateId: "payment_successful",
    title: "Payment Successful",
    body: "Your BamSignal purchase is confirmed.",
    category: "purchase"
  };
}

export async function afterBamSignalPurchaseFulfillment({
  memberId,
  email,
  productType,
  productId,
  reference
}) {
  if (!isStankingsPlatformEnabled()) return { ok: true, skipped: true };

  await joinStankingsIdentity({ memberId, email }).catch(() => null);

  const notice = platformNotificationForPurchase({ productType, productId });
  return notifyStankingsPlatform({
    memberId,
    email,
    ...notice,
    metadata: { reference, productType, productId }
  });
}

export async function notifyPlatformPaymentFailed({ memberId, email, reference, reason }) {
  if (!isStankingsPlatformEnabled()) return { ok: true, skipped: true };
  return notifyStankingsPlatform({
    memberId,
    email,
    templateId: "payment_failed",
    title: "Payment Failed",
    body: reason || "Your payment could not be completed.",
    category: "purchase_failed",
    metadata: { reference }
  });
}
