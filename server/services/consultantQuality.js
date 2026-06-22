/**
 * Consultant Quality Assurance™ — append-only review integrity (server-side).
 */

export function assertQualityReviewAppendOnly(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Quality integrity violation: append log entries cannot be deleted");
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
      throw new Error("Quality integrity violation: append log cannot be modified");
    }
  }
}

export function assertQualityReviewImmutable(previous, next) {
  if (previous.id !== next.id) {
    throw new Error("Quality integrity violation: review identity cannot change");
  }

  const immutableFields = [
    "reviewRef",
    "consultantRef",
    "consultantName",
    "reviewer",
    "reviewedAt",
    "journeyRef",
    "overallScore",
    "summary",
    "areaRatings"
  ];

  for (const field of immutableFields) {
    if (JSON.stringify(previous[field]) !== JSON.stringify(next[field])) {
      throw new Error(`Quality integrity violation: ${field} is immutable`);
    }
  }

  assertQualityReviewAppendOnly(previous.appendLog ?? [], next.appendLog ?? []);
}

export function appendQualityReviewEntry(review, input) {
  const entry = {
    ...input,
    id: `quality_append_${String((review.appendLog?.length ?? 0) + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextLog = [...(review.appendLog ?? []), entry];
  assertQualityReviewAppendOnly(review.appendLog ?? [], nextLog);
  return { ...review, appendLog: nextLog };
}
