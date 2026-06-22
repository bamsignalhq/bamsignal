/**
 * Finance Operations Center™ — immutable financial record integrity (server-side).
 */

const IMMUTABLE_FINANCE_FIELDS = [
  "id",
  "transactionRef",
  "areaId",
  "amountNgn",
  "memberRef",
  "consultantRef",
  "journeyRef",
  "paystackReference",
  "auditRef",
  "description",
  "createdAt"
];

export function assertFinanceTimelineAppendOnly(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Finance integrity violation: timeline entries cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.actor !== current.actor ||
      prior.action !== current.action
    ) {
      throw new Error("Finance integrity violation: timeline cannot be modified");
    }
  }
}

export function assertFinanceRecordImmutable(previous, next) {
  if (previous.id !== next.id) {
    throw new Error("Finance integrity violation: record identity cannot change");
  }

  for (const field of IMMUTABLE_FINANCE_FIELDS) {
    if (previous[field] !== next[field]) {
      throw new Error(`Finance integrity violation: ${field} is immutable`);
    }
  }

  assertFinanceTimelineAppendOnly(previous.timeline ?? [], next.timeline ?? []);
}

export function appendFinanceTimelineEntry(record, input) {
  const entry = {
    ...input,
    id: `finance_tl_${String((record.timeline?.length ?? 0) + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextTimeline = [...(record.timeline ?? []), entry];
  assertFinanceTimelineAppendOnly(record.timeline ?? [], nextTimeline);
  return {
    ...record,
    timeline: nextTimeline,
    status: input.status ?? record.status
  };
}
