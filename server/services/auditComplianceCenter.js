/**
 * Audit & Compliance Center™ — append-only integrity (server-side).
 */

export function assertAuditLogAppendOnly(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Audit integrity violation: events cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.action !== current.action ||
      prior.actor !== current.actor
    ) {
      throw new Error("Audit integrity violation: history cannot be modified");
    }
  }
}

export function appendAuditEventRecord(events, input) {
  const record = {
    ...input,
    id: `audit_${String(events.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const next = [...events, record];
  assertAuditLogAppendOnly(events, next);
  return next;
}
