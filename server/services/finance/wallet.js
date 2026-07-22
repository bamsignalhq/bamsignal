import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const TABLE = "member_financial_ledger";

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

async function publishWalletUpdated(memberId, snapshot) {
  try {
    const { publishFinancialEvent } = await import("./eventBus.js");
    await publishFinancialEvent({
      eventType: "wallet.updated",
      walletUpdated: true,
      memberId,
      wallet: snapshot,
      idempotencyKey: `wallet:${memberId}:${snapshot.derivedAt}`
    });
  } catch {
    /* must not block wallet reads */
  }
}

/**
 * Wallet balances are always derived from ledger — never cached as authority.
 */
export async function deriveMemberWalletSnapshot(memberId, options = {}) {
  if (!(await ensureTable()) || !memberId) {
    return {
      balanceKobo: 0,
      pendingCreditsKobo: 0,
      pendingDebitsKobo: 0,
      reservedKobo: 0,
      lifetimeSpendKobo: 0,
      lifetimePurchasesKobo: 0,
      lifetimeRefundsKobo: 0,
      derivedAt: new Date().toISOString(),
      skipped: true
    };
  }

  const { rows } = await query(
    `select
       coalesce(sum(case when lifecycle_status = 'successful' and entry_type = 'credit' then net_kobo else 0 end), 0) as lifetime_purchases,
       coalesce(sum(case when lifecycle_status = 'successful' and entry_type = 'debit' then net_kobo else 0 end), 0) as lifetime_spend,
       coalesce(sum(case when lifecycle_status = 'refunded' then net_kobo else 0 end), 0) as lifetime_refunds,
       coalesce(sum(case when lifecycle_status in ('pending', 'processing', 'initialized') and entry_type = 'credit' then net_kobo else 0 end), 0) as pending_credits,
       coalesce(sum(case when lifecycle_status in ('pending', 'processing') and entry_type = 'debit' then net_kobo else 0 end), 0) as pending_debits,
       coalesce(sum(case when lifecycle_status = 'processing' and metadata->>'reserved' = 'true' then net_kobo else 0 end), 0) as reserved
     from member_financial_ledger
     where member_id = $1`,
    [memberId]
  );

  const row = rows[0] || {};
  const snapshot = {
    balanceKobo:
      (Number(row.lifetime_purchases) || 0) -
      (Number(row.lifetime_spend) || 0) -
      (Number(row.lifetime_refunds) || 0),
    pendingCreditsKobo: Number(row.pending_credits) || 0,
    pendingDebitsKobo: Number(row.pending_debits) || 0,
    reservedKobo: Number(row.reserved) || 0,
    lifetimeSpendKobo: Number(row.lifetime_spend) || 0,
    lifetimePurchasesKobo: Number(row.lifetime_purchases) || 0,
    lifetimeRefundsKobo: Number(row.lifetime_refunds) || 0,
    derivedAt: new Date().toISOString()
  };

  if (options.publishEvent) {
    await publishWalletUpdated(memberId, snapshot);
  }

  return snapshot;
}

export async function deriveWalletByUserKey(userKey, options = {}) {
  if (!(await ensureTable()) || !userKey) return deriveMemberWalletSnapshot(null, options);
  const member = await query(
    `select id from app_member_profiles
     where lower(coalesce(email, '')) = lower($1)
        or phone = $1
     limit 1`,
    [String(userKey).trim()]
  );
  const memberId = member.rows[0]?.id || null;
  return deriveMemberWalletSnapshot(memberId, options);
}
