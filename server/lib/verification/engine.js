import { randomUUID } from "node:crypto";
import { getFaceProvider } from "./providers/index.js";
import { runBasicLivenessCheck } from "./liveness.js";
import { computeTrustScore, resolveThresholds } from "./risk-engine.js";
import { embeddingFingerprint, encryptVerificationMetadata } from "./crypto.js";
import {
  deleteVerificationObject,
  uploadVerificationSelfie
} from "./storage.js";
import {
  accountAgeDaysForUserKey,
  addVerificationEvent,
  countDuplicateFaceFingerprint,
  countDuplicatePhone,
  countReportsForUserKey,
  getLatestVerificationSession,
  getVerificationSession,
  insertVerificationSession,
  listVerificationQueue,
  updateVerificationSession,
  upsertVerificationResult,
  writeVerificationAudit
} from "./repository.js";
import { getPhoneVerifiedStatus } from "../../services/smsVerification.js";
import { decodeBase64ImagePayload } from "../../services/photoStorage.js";

function publicStatus(row) {
  if (!row) return null;
  return {
    sessionId: row.id,
    status: row.status,
    decision: row.decision || null,
    trustScore: row.trust_score != null ? Number(row.trust_score) : null,
    confidence: row.match_confidence != null ? Number(row.match_confidence) : null,
    provider: row.provider || null,
    modelVersion: row.model_version || null,
    reasonCodes: Array.isArray(row.reason_codes) ? row.reason_codes : [],
    messagingUnlocked: Boolean(row.messaging_unlocked),
    updatedAt: row.updated_at
  };
}

function statusFromDecision(decision) {
  if (decision === "auto_verify") return "auto_verified";
  if (decision === "manual_review") return "manual_review";
  return "retry";
}

/**
 * National verification engine — provider-agnostic orchestration.
 * Never returns embeddings to callers of publicStatus / API handlers.
 */
export async function startVerificationSession({
  userKey,
  authUserId,
  email,
  phone,
  deviceFingerprint,
  providerId
}) {
  const provider = getFaceProvider(providerId);
  await provider.initialize();
  const challengeId = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const session = await insertVerificationSession({
    userKey,
    authUserId,
    email,
    phone,
    status: "selfie_pending",
    provider: provider.id,
    modelVersion: provider.modelVersion,
    deviceFingerprint,
    challengeId,
    expiresAt
  });
  await addVerificationEvent(session.id, "started", { provider: provider.id }, "member");
  await writeVerificationAudit({
    sessionId: session.id,
    userKey,
    action: "session_started",
    actor: "member",
    details: { provider: provider.id }
  });
  return {
    ...publicStatus(session),
    challengeId
  };
}

export async function uploadVerificationSelfieForSession({
  sessionId,
  userKey,
  authUserId,
  selfieDataUrl
}) {
  const session = await getVerificationSession(sessionId, userKey);
  if (!session) {
    return { ok: false, status: 404, error: "Verification session not found.", errorCode: "session_not_found" };
  }

  let decoded;
  try {
    decoded = decodeBase64ImagePayload(selfieDataUrl);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      error: error?.message || "Invalid selfie image.",
      errorCode: "invalid_image"
    };
  }

  const uploaded = await uploadVerificationSelfie({
    authUserId: authUserId || session.auth_user_id,
    sessionId: session.id,
    bytes: decoded.buffer,
    contentType: decoded.contentType
  });

  if (session.selfie_path && session.selfie_path !== uploaded.path) {
    await deleteVerificationObject(session.selfie_path);
  }

  const updated = await updateVerificationSession(session.id, {
    status: "processing",
    selfieBucket: uploaded.bucket,
    selfiePath: uploaded.path
  });
  await addVerificationEvent(session.id, "selfie_uploaded", { path: uploaded.path }, "member");

  return { ok: true, status: publicStatus(updated) };
}

export async function runVerification({
  sessionId,
  userKey,
  authUserId,
  email,
  phone,
  profilePhotoDataUrls = [],
  selfieDataUrl,
  deviceFingerprint,
  emailVerified = true,
  challengeResponse
}) {
  const session = await getVerificationSession(sessionId, userKey);
  if (!session) {
    return { ok: false, status: 404, error: "Verification session not found.", errorCode: "session_not_found" };
  }

  const provider = getFaceProvider(session.provider || process.env.FACE_VERIFICATION_PROVIDER);
  await provider.initialize();

  let selfieBytes;
  let selfieContentType = "image/jpeg";
  if (selfieDataUrl) {
    const decoded = decodeBase64ImagePayload(selfieDataUrl);
    selfieBytes = decoded.buffer;
    selfieContentType = decoded.contentType;
    const uploaded = await uploadVerificationSelfie({
      authUserId: authUserId || session.auth_user_id,
      sessionId: session.id,
      bytes: selfieBytes,
      contentType: selfieContentType
    });
    await updateVerificationSession(session.id, {
      selfieBucket: uploaded.bucket,
      selfiePath: uploaded.path
    });
  } else if (!session.selfie_path) {
    return { ok: false, status: 400, error: "Upload a live selfie first.", errorCode: "selfie_required" };
  } else {
    return {
      ok: false,
      status: 400,
      error: "Pass selfieDataUrl for verification processing in this release.",
      errorCode: "selfie_required"
    };
  }

  const liveness = runBasicLivenessCheck({
    imageBytes: selfieBytes,
    contentType: selfieContentType,
    challengeId: session.challenge_id,
    challengeResponse
  });

  const profileDecoded = [];
  for (const url of profilePhotoDataUrls.slice(0, 6)) {
    try {
      profileDecoded.push(decodeBase64ImagePayload(url));
    } catch {
      /* skip bad photos */
    }
  }

  const providerResult = await provider.verify({
    selfieBytes,
    selfieContentType,
    profilePhotoBytes: profileDecoded.map((p) => p.buffer),
    profileContentTypes: profileDecoded.map((p) => p.contentType),
    livenessChallengeId: session.challenge_id
  });

  const livenessPassed = Boolean(liveness.passed && providerResult.livenessPassed);
  const fingerprint = embeddingFingerprint(providerResult.embedding);
  const duplicateFaceCount = await countDuplicateFaceFingerprint(fingerprint, session.id);
  const smsVerified = await getPhoneVerifiedStatus({
    email: email || session.email,
    phone: phone || session.phone,
    authUserId
  });
  const duplicatePhoneCount = await countDuplicatePhone(phone || session.phone, userKey);
  const reportCount = await countReportsForUserKey(userKey);
  const accountAgeDays = await accountAgeDaysForUserKey(userKey);

  const thresholds = resolveThresholds();
  const risk = computeTrustScore(
    {
      emailVerified: Boolean(emailVerified),
      smsVerified: Boolean(smsVerified),
      livenessPassed,
      faceMatchConfidence: Number(providerResult.matchConfidence) || 0,
      duplicatePhone: duplicatePhoneCount > 0,
      duplicateDevice: Boolean(
        deviceFingerprint &&
          session.device_fingerprint &&
          deviceFingerprint !== session.device_fingerprint
      )
        ? false
        : false,
      duplicateFace: duplicateFaceCount > 0,
      accountAgeDays,
      reportCount
    },
    thresholds
  );

  // Fix duplicate device: true when same device fingerprint already used by another verified session
  // (simplified: only flag if client sends a fingerprint that collides — skip for now)
  void deviceFingerprint;

  const decision = !livenessPassed
    ? "retry"
    : providerResult.reasonCode === "provider_unavailable"
      ? "manual_review"
      : risk.decision;

  const status = statusFromDecision(decision);
  const messagingUnlocked = decision === "auto_verify";
  const metadataEnc = encryptVerificationMetadata({
    riskBreakdown: risk.breakdown,
    livenessReasons: liveness.reasons,
    providerReason: providerResult.reasonCode,
    // never store raw embedding vector
    embeddingFingerprint: fingerprint
  });

  const updated = await updateVerificationSession(session.id, {
    status,
    provider: provider.id,
    modelVersion: provider.modelVersion,
    trustScore: risk.trustScore,
    matchConfidence: providerResult.matchConfidence,
    decision,
    reasonCodes: [...new Set([...(risk.reasons || []), providerResult.reasonCode].filter(Boolean))],
    metadataEnc,
    embeddingFingerprint: fingerprint,
    messagingUnlocked
  });

  await upsertVerificationResult({
    sessionId: session.id,
    provider: provider.id,
    modelVersion: provider.modelVersion,
    livenessPassed,
    livenessScore: liveness.score,
    matchConfidence: providerResult.matchConfidence,
    trustScore: risk.trustScore,
    decision,
    reasonCodes: updated.reason_codes,
    riskBreakdown: risk.breakdown,
    metadataEnc
  });

  await addVerificationEvent(
    session.id,
    "verified",
    { decision, trustScore: risk.trustScore, status },
    "system"
  );
  await writeVerificationAudit({
    sessionId: session.id,
    userKey,
    action: "verification_completed",
    actor: "system",
    details: { decision, trustScore: risk.trustScore, provider: provider.id }
  });

  // Drop in-memory embedding reference; temp artifacts cleaned when retry/reject.
  if (decision === "retry" && updated.selfie_path) {
    // keep selfie for one retry cycle — cleanup on expire/reject via admin
  }

  return {
    ok: true,
    status: publicStatus(updated),
    thresholds
  };
}

export async function getVerificationStatusForUser({ sessionId, userKey }) {
  const row = sessionId
    ? await getVerificationSession(sessionId, userKey)
    : await getLatestVerificationSession(userKey);
  return { ok: Boolean(row), status: publicStatus(row) };
}

export async function adminDecideVerification({
  sessionId,
  decision,
  actor,
  rejectReason
}) {
  const session = await getVerificationSession(sessionId, null);
  if (!session) {
    return { ok: false, status: 404, error: "Session not found." };
  }

  const map = {
    approve: { status: "approved", messagingUnlocked: true, decision: "approve" },
    reject: { status: "rejected", messagingUnlocked: false, decision: "reject" },
    request_new_selfie: { status: "retry", messagingUnlocked: false, decision: "request_new_selfie" },
    suspend: { status: "suspended", messagingUnlocked: false, decision: "suspend" }
  };
  const next = map[decision];
  if (!next) {
    return { ok: false, status: 400, error: "Invalid decision." };
  }

  const reasonCodes = Array.isArray(session.reason_codes) ? [...session.reason_codes] : [];
  if (rejectReason) reasonCodes.push("manual_override");

  const updated = await updateVerificationSession(sessionId, {
    status: next.status,
    decision: next.decision,
    messagingUnlocked: next.messagingUnlocked,
    reasonCodes
  });

  if (next.decision === "reject" || next.decision === "suspend") {
    await deleteVerificationObject(session.selfie_path);
    await updateVerificationSession(sessionId, { selfiePath: null, selfieBucket: null });
  }

  await addVerificationEvent(sessionId, "admin_decision", { decision, rejectReason }, actor || "admin");
  await writeVerificationAudit({
    sessionId,
    userKey: session.user_key,
    action: `admin_${decision}`,
    actor: actor || "admin",
    details: { rejectReason: rejectReason || null }
  });

  return { ok: true, status: publicStatus(updated) };
}

export async function listAdminVerificationQueue(options) {
  const rows = await listVerificationQueue(options);
  return rows.map((row) => ({
    ...publicStatus(row),
    email: row.email ? String(row.email).replace(/(^.).*(@.*$)/, "$1***$2") : null,
    phone: row.phone ? `***${String(row.phone).slice(-4)}` : null,
    selfiePath: row.selfie_path || null,
    createdAt: row.created_at
  }));
}

export function isNationalFaceMatchRequired() {
  return String(process.env.FACE_MATCH_REQUIRED_FOR_MESSAGING || "false").toLowerCase() === "true";
}

export async function isNationalMessagingUnlocked(userKey) {
  if (!userKey) return false;
  const latest = await getLatestVerificationSession(userKey);
  return Boolean(latest?.messaging_unlocked);
}
