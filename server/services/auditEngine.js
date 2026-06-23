/**
 * Institutional Audit Engine™ — append-only integrity (server-side).
 */

export function assertInstitutionalAuditAppendOnly(previous, next) {
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
      prior.actor?.email !== current.actor?.email
    ) {
      throw new Error("Audit integrity violation: history cannot be modified");
    }
  }
}

export function appendInstitutionalAuditEvent(events, input) {
  const record = {
    ...input,
    id: `inst_audit_${String(events.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString()
  };
  const next = [...events, record];
  assertInstitutionalAuditAppendOnly(events, next);
  return next;
}
