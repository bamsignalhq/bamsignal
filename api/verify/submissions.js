import { getDatabaseStatus } from "../../server/db.js";
import {
  listVerificationSubmissions,
  reviewVerificationSubmission,
  submitVerificationSelfie,
  verificationQueueStats
} from "../../server/services/verificationQueue.js";
import { getPhoneVerifiedStatus } from "../../server/services/smsVerification.js";
import { verifySupabaseAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";
import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { validateVerificationImagePayload } from "../../server/services/verificationImage.js";
import { PhotoStorageError } from "../../server/services/photoStorage.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

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

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

export default async function handler(req, res) {
  const body = parseBody(req);
  const action = String(req.query.action || body.action || "list");

  if (action === "submit-selfie") {
    if (getDatabaseStatus() !== "connected") {
      return sendLoggedApiError({
        req,
        res,
        status: 503,
        message: "Database is not connected.",
        errorCode: "database_unavailable",
        event: "verification_submit_db_unavailable"
      });
    }

    const auth = await requireMemberAuth(req, body);
    if (!auth.ok) {
      return sendLoggedApiError({
        req,
        res,
        status: auth.status || 401,
        message: "Sign in to submit verification.",
        errorCode: auth.error || "not_authorized",
        event: "verification_submit_unauthorized"
      });
    }

    const phone = normalizePhone(body.phone || auth.phone);
    const verificationSelfie = String(body.verificationSelfie || "").trim();

    if (!verificationSelfie) {
      return sendLoggedApiError({
        req,
        res,
        status: 400,
        message: "Selfie is required.",
        errorCode: "selfie_required",
        event: "verification_submit_missing_selfie"
      });
    }

    try {
      validateVerificationImagePayload(verificationSelfie);
    } catch (error) {
      const message =
        error instanceof PhotoStorageError
          ? error.message
          : "Invalid verification image payload.";
      return sendLoggedApiError({
        req,
        res,
        status: 400,
        message,
        errorCode: "invalid_selfie",
        event: "verification_submit_invalid_image"
      });
    }

    const phoneVerified = await getPhoneVerifiedStatus({
      email: auth.email,
      phone,
      authUserId: auth.authUserId
    });
    if (!phoneVerified) {
      return sendLoggedApiError({
        req,
        res,
        status: 400,
        message: "Verify your phone number with SMS first.",
        errorCode: "phone_not_verified",
        event: "verification_submit_phone_unverified"
      });
    }

    const row = await submitVerificationSelfie({
      email: auth.email,
      phone,
      name: auth.name || String(body.name || "").trim(),
      profilePhoto: String(body.profilePhoto || "").trim() || null,
      verificationSelfie,
      phoneVerified: true
    });

    return res.status(row ? 200 : 503).json({
      ok: Boolean(row),
      status: "pending",
      submission: row
    });
  }

  const isAdmin = await verifySupabaseAdmin(req);
  if (!isAdmin) {
    return sendLoggedApiError({
      req,
      res,
      status: 401,
      message: "Admin access required.",
      errorCode: "not_authorized",
      event: "verification_admin_denied"
    });
  }

  if (getDatabaseStatus() !== "connected") {
    return sendLoggedApiError({
      req,
      res,
      status: 503,
      message: "Database is not connected.",
      errorCode: "database_unavailable",
      event: "verification_admin_db_unavailable"
    });
  }

  if (action === "stats") {
    const stats = await verificationQueueStats();
    return res.status(200).json({ ok: true, stats });
  }

  if (action === "approve" || action === "reject") {
    if (!(await requireAdminConsent(req, res))) return;
    const id = String(body.id || "").trim();
    if (!id) {
      return sendLoggedApiError({
        req,
        res,
        status: 400,
        message: "Submission id is required.",
        errorCode: "submission_id_required",
        event: "verification_review_missing_id"
      });
    }
    const row = await reviewVerificationSubmission(id, {
      status: action === "approve" ? "approved" : "rejected",
      rejectReason: String(body.rejectReason || "").trim() || undefined
    });
    return res.status(row ? 200 : 404).json({ ok: Boolean(row), submission: row });
  }

  const status = String(req.query.status || body.status || "").trim() || undefined;
  const submissions = await listVerificationSubmissions({ status });
  return res.status(200).json({ ok: true, submissions });
}
