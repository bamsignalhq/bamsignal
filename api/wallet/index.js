import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import { PAYSTACK_CHANNELS } from "../../server/paystackChannels.js";
import { initializePaystackTransaction } from "../../server/services/paystackClient.js";
import {
  buildPaystackPurchaseMetadata,
  recordPurchaseIntent,
  resolveBayGoldFundingIntent
} from "../../server/services/paymentFortress.js";
import {
  getPlatformWalletHome,
  isStankingsPlatformEnabled,
  purchaseViaWalletGate,
  resumePlatformPurchase
} from "../../server/services/stankingsPlatform.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function walletHandler(req, res) {
  try {
    const identity = await requireMemberAuth(req, res);
    if (!identity) return;

    if (!isStankingsPlatformEnabled()) {
      return res.status(503).json({ ok: false, error: "Stankings Platform not configured." });
    }

    const memberId = identity.userId;
    const email = identity.email;
    const displayName = identity.displayName || identity.name;

    if (req.method === "GET") {
      const home = await getPlatformWalletHome({ memberId, email, displayName });
      if (!home.ok) {
        return res.status(home.status || 502).json(home);
      }
      return res.json(home);
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);
    const action = String(body.action || "purchase-gate");

    if (action === "purchase-gate") {
      const result = await purchaseViaWalletGate({
        memberId,
        email,
        displayName,
        entry: body.entry || body.productType || "boost",
        productId: body.productId,
        idempotencyKey: body.idempotencyKey
      });
      return res.status(result.ok ? 200 : result.status || 502).json(result);
    }

    if (action === "resume") {
      const result = await resumePlatformPurchase({
        memberId,
        email,
        resumeToken: body.resumeToken,
        paystackReference: body.paystackReference
      });
      return res.status(result.ok ? 200 : result.status || 502).json(result);
    }

    if (action === "initialize-funding") {
      const intent = resolveBayGoldFundingIntent({
        shortfallBayGold: body.shortfallBayGold,
        resumeToken: body.resumeToken
      });
      if (!intent.resumeToken) {
        return res.status(400).json({ ok: false, error: "Resume token required for wallet funding." });
      }
      if (!email) {
        return res.status(400).json({ ok: false, error: "Verified email required." });
      }

      const returnPath = String(body.returnPath || "/home").trim() || "/home";
      const reference = `bs_baygold_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`.slice(0, 64);

      await recordPurchaseIntent({
        reference,
        userId: identity.userId,
        intent,
        source: "wallet-initialize-funding"
      });

      const callbackUrl = `${String(process.env.PAYSTACK_CALLBACK_URL || process.env.APP_URL || "").replace(/\/$/, "")}/payment-return`;
      const data = await initializePaystackTransaction({
        email,
        amount: intent.amountKobo,
        reference,
        callback_url: callbackUrl,
        channels: PAYSTACK_CHANNELS,
        metadata: buildPaystackPurchaseMetadata({
          intent,
          name: displayName || "",
          returnPath,
          sourcePage: returnPath
        })
      });

      return res.json({
        ok: true,
        reference: data?.reference || reference,
        authorization_url: data?.authorization_url,
        access_code: data?.access_code
      });
    }

    return res.status(400).json({ ok: false, error: "Unknown wallet action" });
  } catch (error) {
    return sendLoggedApiError(res, req, error, "wallet_handler_failed");
  }
}
