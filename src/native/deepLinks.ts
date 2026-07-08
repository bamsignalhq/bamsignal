import { parsePaymentReturnUrl } from "../utils/paymentState";

export type NativeDeepLinkRoute =
  | { kind: "payment"; reference: string }
  | { kind: "profile"; profileId: string }
  | { kind: "chats"; threadId?: string }
  | { kind: "signals" }
  | { kind: "matches" }
  | { kind: "premium" }
  | { kind: "referral"; code?: string }
  | { kind: "notifications" }
  | { kind: "discover" }
  | { kind: "home" };

export function parseNativeDeepLink(rawUrl: string): NativeDeepLinkRoute | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const payment = parsePaymentReturnUrl(trimmed);
  if (payment) return { kind: "payment", reference: payment.reference };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const scheme = url.protocol.replace(":", "");
  const isAppScheme = scheme === "com.bamsignal.com" || scheme === "bamsignal";
  const isWebHost = host === "bamsignal.com" || host.endsWith(".bamsignal.com");
  if (!isAppScheme && !isWebHost) return null;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  if (path === "/payment/success" || path === "/payment-success") {
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
    if (reference) return { kind: "payment", reference };
  }

  if (segments[0] === "profile" && segments[1]) {
    return { kind: "profile", profileId: segments[1] };
  }
  if (segments[0] === "profiles" && segments[1]) {
    return { kind: "profile", profileId: segments[1] };
  }

  if (segments[0] === "chats" || segments[0] === "chat" || segments[0] === "messages") {
    return { kind: "chats", threadId: segments[1] };
  }

  if (segments[0] === "signals" || segments[0] === "likes") {
    return { kind: "signals" };
  }
  if (segments[0] === "matches") {
    return { kind: "matches" };
  }
  if (segments[0] === "premium" || segments[0] === "subscription" || segments[0] === "pricing") {
    return { kind: "premium" };
  }
  if (segments[0] === "referral" || segments[0] === "invite" || segments[0] === "refer") {
    return { kind: "referral", code: segments[1] || url.searchParams.get("code") || undefined };
  }
  if (segments[0] === "notifications") {
    return { kind: "notifications" };
  }
  if (segments[0] === "discover") {
    return { kind: "discover" };
  }
  if (path === "/" || segments[0] === "home") {
    return { kind: "home" };
  }

  const tab = url.searchParams.get("tab");
  if (tab === "chats") return { kind: "chats", threadId: url.searchParams.get("thread") || undefined };
  if (tab === "signals" || tab === "likes") return { kind: "signals" };
  if (tab === "premium") return { kind: "premium" };

  return null;
}
