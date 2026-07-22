import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const CONFIG_TABLE = "ops_runtime_configuration";
const AUDIT_TABLE = "ops_runtime_configuration_audit";

export const RUNTIME_CONFIG_KEYS = Object.freeze([
  "signup",
  "messaging",
  "payments",
  "notifications",
  "matching",
  "concierge",
  "maintenance_mode",
  "emergency_banner",
  "beta_features"
]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(CONFIG_TABLE);
    await assertSchemaTable(AUDIT_TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function getRuntimeConfiguration(configKey = null) {
  if (!(await ensureTables())) return configKey ? null : [];
  if (configKey) {
    const { rows } = await query(
      "select config_key, enabled, rollout_percentage, value, description, updated_by, updated_at from ops_runtime_configuration where config_key = $1 limit 1",
      [String(configKey)]
    );
    return rows[0] || null;
  }
  const { rows } = await query(
    "select config_key, enabled, rollout_percentage, value, description, updated_by, updated_at from ops_runtime_configuration order by config_key asc"
  );
  return rows;
}

export async function isRuntimeFeatureEnabled(configKey, context = {}) {
  const config = await getRuntimeConfiguration(configKey);
  if (!config) return false;
  if (config.enabled) return true;
  const rollout = Number(config.rollout_percentage || 0);
  if (rollout <= 0) return false;
  if (rollout >= 100) return true;
  const seed = String(context.memberId || context.userKey || "global");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100;
  }
  return hash < rollout;
}

export async function updateRuntimeConfiguration(input = {}) {
  const configKey = String(input.configKey || "").trim();
  if (!RUNTIME_CONFIG_KEYS.includes(configKey)) return { ok: false, error: "invalid_key" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const reason = String(input.reason || "Configuration updated").slice(0, 500);
  if (!reason) return { ok: false, error: "reason_required" };

  const current = await getRuntimeConfiguration(configKey);
  const previousValue = current
    ? { enabled: current.enabled, rollout_percentage: current.rollout_percentage, value: current.value }
    : {};

  const newValue = {
    enabled: input.enabled != null ? Boolean(input.enabled) : previousValue.enabled,
    rollout_percentage:
      input.rolloutPercentage != null
        ? Math.min(100, Math.max(0, Number(input.rolloutPercentage)))
        : previousValue.rollout_percentage,
    value: input.value != null ? input.value : previousValue.value || {}
  };

  await query(
    `insert into ops_runtime_configuration (config_key, enabled, rollout_percentage, value, description, updated_by)
     values ($1,$2,$3,$4::jsonb,$5,$6)
     on conflict (config_key)
     do update set enabled = excluded.enabled,
                   rollout_percentage = excluded.rollout_percentage,
                   value = excluded.value,
                   updated_by = excluded.updated_by,
                   updated_at = now()`,
    [
      configKey,
      newValue.enabled,
      newValue.rollout_percentage,
      JSON.stringify(newValue.value || {}),
      String(input.description || current?.description || ""),
      String(input.actor || "system")
    ]
  );

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_runtime_configuration_audit (
       log_id, config_key, previous_value, new_value, reason, actor, actor_role
     ) values ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7)
     on conflict (log_id) do nothing`,
    [
      logId,
      configKey,
      JSON.stringify(previousValue),
      JSON.stringify(newValue),
      reason,
      String(input.actor || "system"),
      String(input.actorRole || "system")
    ]
  );

  const { writeImmutableAudit } = await import("./audit.js");
  await writeImmutableAudit({
    actor: input.actor || "system",
    actorRole: input.actorRole || "system",
    action: "feature.updated",
    entityType: "runtime_configuration",
    entityId: configKey,
    oldValue: previousValue,
    newValue,
    reason
  });

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: "feature.updated",
    payload: { configKey, previousValue, newValue },
    actor: input.actor || "system",
    idempotencyKey: `feature.updated:${configKey}:${logId}`
  });

  await publishAdminEvent({
    eventType: "configuration.updated",
    payload: { configKey },
    actor: input.actor || "system",
    idempotencyKey: `configuration.updated:${configKey}:${logId}`
  });

  return { ok: true, configKey, previousValue, newValue, logId };
}

export async function listRuntimeConfigurationAudit(configKey, options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_value, new_value, reason, actor, occurred_at
     from ops_runtime_configuration_audit
     where config_key = $1
     order by occurred_at desc
     limit $2`,
    [configKey, limit]
  );
  return rows;
}
