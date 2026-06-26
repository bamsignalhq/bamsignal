async function tableExists(pool, tableName) {
  const result = await pool.query(
    `select 1 from information_schema.tables
     where table_schema = 'public' and table_name = $1 limit 1`,
    [tableName]
  );
  return result.rowCount > 0;
}

/**
 * Safe auto-repairs only — destructive fixes are flagged for manual review.
 */
export async function runSafeIntegrityRepairs(pool) {
  const repairs = [];
  const flaggedForReview = [];

  async function safeDelete(label, tableName, sql, params = []) {
    try {
      if (!(await tableExists(pool, tableName))) return 0;
      const result = await pool.query(sql, params);
      const count = result.rowCount ?? 0;
      if (count > 0) repairs.push({ action: label, count, safe: true });
      return count;
    } catch (error) {
      flaggedForReview.push({
        action: label,
        detail: error instanceof Error ? error.message : String(error),
        safe: false
      });
      return 0;
    }
  }

  let totalRepaired = 0;

  if (await tableExists(pool, "email_verification_codes")) {
    totalRepaired += await safeDelete(
      "remove-expired-email-otp",
      "email_verification_codes",
      `delete from email_verification_codes where expires_at < now()`
    );
  }

  if (await tableExists(pool, "login_2fa_codes")) {
    totalRepaired += await safeDelete(
      "remove-expired-2fa-codes",
      "login_2fa_codes",
      `delete from login_2fa_codes where expires_at < now()`
    );
  }

  if (await tableExists(pool, "pin_reset_codes")) {
    totalRepaired += await safeDelete(
      "remove-expired-pin-reset",
      "pin_reset_codes",
      `delete from pin_reset_codes where expires_at < now()`
    );
  }

  if (await tableExists(pool, "signup_provisioning_attempts")) {
    totalRepaired += await safeDelete(
      "remove-expired-signup-otp",
      "signup_provisioning_attempts",
      `delete from signup_provisioning_attempts where expires_at < now() and status <> 'completed'`
    );
  }

  if (await tableExists(pool, "app_member_profiles")) {
    try {
      const result = await pool.query(
        `update app_member_profiles
         set updated_at = created_at
         where updated_at is null and created_at is not null`
      );
      const count = result.rowCount ?? 0;
      if (count > 0) {
        repairs.push({ action: "restore-profile-updated-at", count, safe: true });
        totalRepaired += count;
      }
    } catch (error) {
      flaggedForReview.push({
        action: "restore-profile-updated-at",
        detail: error instanceof Error ? error.message : String(error),
        safe: false
      });
    }
  }

  if (await tableExists(pool, "api_rate_events")) {
    totalRepaired += await safeDelete(
      "prune-stale-rate-events",
      "api_rate_events",
      `delete from api_rate_events where created_at < now() - interval '30 days'`
    );
  }

  flaggedForReview.push({
    action: "reindex-maintenance",
    detail: "Index rebuild requires manual DBA review — not auto-applied.",
    safe: false
  });

  flaggedForReview.push({
    action: "duplicate-payment-merge",
    detail: "Duplicate payment_fulfillments require manual finance review.",
    safe: false
  });

  return {
    objectsRepaired: totalRepaired,
    repairs,
    flaggedForReview
  };
}
