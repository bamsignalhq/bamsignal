import { getDatabaseStatus } from "../../server/db.js";
import {
  listVerificationSubmissions,
  reviewVerificationSubmission,
  submitVerificationSelfie,
  verificationQueueStats
} from "../../server/services/verificationQueue.js";
import { getPhoneVerifiedStatus } from "../../server/services/whatsappVerification.js";
import { verifySupabaseAdmin } from "../../server/adminAuth.js";

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
      return res.status(503).json({ ok: false, error: "Database is not connected." });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    const verificationSelfie = String(body.verificationSelfie || "").trim();

    if (!verificationSelfie) {
      return res.status(400).json({ ok: false, error: "Selfie is required." });
    }

    const phoneVerified = await getPhoneVerifiedStatus({ email, phone });
    if (!phoneVerified) {
      return res.status(400).json({
        ok: false,
        error: "Verify your WhatsApp number first."
      });
    }

    const row = await submitVerificationSelfie({
      email,
      phone,
      name: String(body.name || "").trim(),
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
    return res.status(401).json({ ok: false, error: "Admin access required." });
  }

  if (getDatabaseStatus() !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected." });
  }

  if (action === "stats") {
    const stats = await verificationQueueStats();
    return res.status(200).json({ ok: true, stats });
  }

  if (action === "approve" || action === "reject") {
    const id = String(body.id || "").trim();
    if (!id) {
      return res.status(400).json({ ok: false, error: "Submission id is required." });
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
