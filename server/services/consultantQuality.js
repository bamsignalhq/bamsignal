/**
 * Consultant Quality, Standards & Certification™ — server-side logic.
 */

export const CONSULTANT_QUALITY_DB_TABLES = [
  "consultant_reviews",
  "consultant_certifications",
  "quality_assessments",
  "consultation_reviews",
  "coaching_sessions",
  "improvement_plans"
];

export function getConsultantQualityDatabaseTableManifest() {
  return CONSULTANT_QUALITY_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "qa"
  }));
}

export function canAccessConsultantQuality(permissions = []) {
  return permissions.includes("ManageConsultants") || permissions.includes("ViewArchives");
}

const VALID_REVIEW_TYPES = ["self-review", "peer-review", "manager-review", "executive-review"];

const VALID_CERTIFICATION_LEVELS = [
  "certified",
  "senior-certified",
  "master-consultant",
  "legacy-consultant",
  "expired",
  "suspended"
];

export function normalizeQualityReview(review) {
  return {
    ...review,
    reviewType: VALID_REVIEW_TYPES.includes(review?.reviewType) ? review.reviewType : "manager-review",
    appendLog: Array.isArray(review?.appendLog) ? review.appendLog : []
  };
}

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
    "reviewType",
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

export function issueCertification(certifications, input) {
  if (!VALID_CERTIFICATION_LEVELS.includes(input.certificationLevel)) {
    throw new Error("Quality certification violation: invalid level");
  }
  if (["expired", "suspended"].includes(input.certificationLevel)) {
    throw new Error("Quality certification violation: cannot issue expired or suspended level");
  }

  const record = {
    id: input.id ?? `cert_${Date.now()}`,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    certificationLevel: input.certificationLevel,
    status: "active",
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    expiresAt: input.expiresAt ?? null,
    issuedBy: input.issuedBy,
    notes: input.notes ?? ""
  };

  return [...certifications, record];
}

export function suspendCertification(certifications, certificationId, actor, reason = "") {
  const index = certifications.findIndex((item) => item.id === certificationId);
  if (index < 0) {
    throw new Error("Quality certification violation: certification not found");
  }

  const current = certifications[index];
  if (current.status === "suspended") {
    throw new Error("Quality certification violation: already suspended");
  }

  const next = [...certifications];
  next[index] = {
    ...current,
    status: "suspended",
    certificationLevel: "suspended",
    notes: reason ? `${current.notes ?? ""} Suspended by ${actor}: ${reason}`.trim() : current.notes
  };
  return next;
}

export function assignImprovementPlan(plans, input) {
  if (!input.actions?.length) {
    throw new Error("Quality improvement violation: plan requires actions");
  }

  const record = {
    id: input.id ?? `plan_${Date.now()}`,
    planRef: input.planRef ?? `IP-${Date.now()}`,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    reviewRef: input.reviewRef ?? null,
    status: "active",
    actions: input.actions.map((action, index) => ({
      id: action.id ?? `action_${index + 1}`,
      standardId: action.standardId,
      action: action.action,
      deadline: action.deadline,
      status: action.status ?? "pending",
      followUpReviewAt: action.followUpReviewAt ?? null,
      trainingModule: action.trainingModule ?? null
    })),
    followUpReviewAt: input.followUpReviewAt ?? null,
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  return [...plans, record];
}

export function completeImprovementAction(plans, planId, actionId) {
  const planIndex = plans.findIndex((item) => item.id === planId);
  if (planIndex < 0) {
    throw new Error("Quality improvement violation: plan not found");
  }

  const plan = plans[planIndex];
  const actionIndex = plan.actions.findIndex((item) => item.id === actionId);
  if (actionIndex < 0) {
    throw new Error("Quality improvement violation: action not found");
  }

  const actions = plan.actions.map((item, index) =>
    index === actionIndex ? { ...item, status: "completed" } : item
  );
  const allComplete = actions.every((item) => item.status === "completed");

  const nextPlan = {
    ...plan,
    actions,
    status: allComplete ? "completed" : plan.status,
    completedAt: allComplete ? new Date().toISOString() : plan.completedAt
  };

  const next = [...plans];
  next[planIndex] = nextPlan;
  return next;
}

export function scheduleCoachingSession(sessions, input) {
  const record = {
    id: input.id ?? `coach_${Date.now()}`,
    sessionRef: input.sessionRef ?? `CS-${Date.now()}`,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    coachEmail: input.coachEmail,
    topic: input.topic,
    status: "scheduled",
    scheduledAt: input.scheduledAt,
    notes: input.notes ?? ""
  };
  return [...sessions, record];
}

export function completeCoachingSession(sessions, sessionId, notes = "") {
  const index = sessions.findIndex((item) => item.id === sessionId);
  if (index < 0) {
    throw new Error("Quality coaching violation: session not found");
  }

  const current = sessions[index];
  if (current.status === "completed") {
    throw new Error("Quality coaching violation: session already completed");
  }

  const next = [...sessions];
  next[index] = {
    ...current,
    status: "completed",
    completedAt: new Date().toISOString(),
    notes: notes || current.notes
  };
  return next;
}

export function buildQualityTrendFromReviews(reviews) {
  const buckets = new Map();

  for (const review of reviews) {
    const month = String(review.reviewedAt ?? "").slice(0, 7);
    if (!month) continue;
    const bucket = buckets.get(month) ?? { total: 0, count: 0 };
    bucket.total += Number(review.overallScore) || 0;
    bucket.count += 1;
    buckets.set(month, bucket);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, bucket]) => ({
      month,
      averageScore: Math.round(bucket.total / bucket.count),
      reviewCount: bucket.count
    }));
}
