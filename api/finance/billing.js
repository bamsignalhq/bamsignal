import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import {
  getLedgerEntriesForMember
} from "../../server/services/finance/ledger.js";
import { listFinancialLifecycleTransitions } from "../../server/services/finance/lifecycle.js";
import { listRefundsForMember } from "../../server/services/finance/refunds.js";
import { deriveMemberWalletSnapshot } from "../../server/services/finance/wallet.js";
import { isDatabaseReady, query } from "../../server/db.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "history").toLowerCase();

  try {
    const auth = await requireMemberAuth(req, body);
    if (!auth.ok) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || "Unauthorized" });
    }

    const profileId = auth.memberId;
    if (!profileId) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    if (action === "wallet") {
      const wallet = await deriveMemberWalletSnapshot(profileId);
      return res.status(200).json({ ok: true, wallet });
    }

    if (action === "purchases") {
      const purchases = await getLedgerEntriesForMember(profileId, { limit: body.limit });
      return res.status(200).json({ ok: true, purchases });
    }

    if (action === "refunds") {
      const refunds = await listRefundsForMember(profileId, { limit: body.limit });
      return res.status(200).json({ ok: true, refunds });
    }

    if (action === "subscription-history") {
      if (!isDatabaseReady()) {
        return res.status(200).json({ ok: true, events: [] });
      }
      const { rows } = await query(
        `select event_type, product_id, plan_id, source_payment_ref, actor, created_at
         from membership_events
         where member_id = $1
         order by created_at desc
         limit $2`,
        [profileId, Math.min(Number(body.limit) || 50, 200)]
      );
      return res.status(200).json({ ok: true, events: rows });
    }

    if (action === "lifecycle") {
      const reference = String(body.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ ok: false, error: "reference required" });
      }
      const transitions = await listFinancialLifecycleTransitions(reference, { limit: body.limit });
      return res.status(200).json({ ok: true, transitions });
    }

    if (action === "history") {
      const [purchases, refunds, wallet, subscriptionEvents] = await Promise.all([
        getLedgerEntriesForMember(profileId, { limit: body.limit || 30 }),
        listRefundsForMember(profileId, { limit: body.limit || 20 }),
        deriveMemberWalletSnapshot(profileId),
        isDatabaseReady()
          ? query(
              `select event_type, product_id, plan_id, source_payment_ref, created_at
               from membership_events where member_id = $1
               order by created_at desc limit $2`,
              [profileId, Math.min(Number(body.limit) || 30, 200)]
            ).then((r) => r.rows)
          : []
      ]);

      let paymentAttempts = [];
      if (isDatabaseReady()) {
        const email = auth.email || null;
        if (email) {
          const attempts = await query(
            `select paystack_reference, product_type, product_id, amount_kobo, verified_at, return_path
             from payment_events
             where lower(user_email) = lower($1)
             order by updated_at desc
             limit $2`,
            [email, Math.min(Number(body.limit) || 30, 200)]
          );
          paymentAttempts = attempts.rows;
        }
      }

      return res.status(200).json({
        ok: true,
        wallet,
        purchases,
        refunds,
        subscriptionEvents,
        paymentAttempts
      });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "finance_billing_error",
      error,
      status: 500,
      message: "Billing request failed.",
      context: { action }
    });
  }
}
