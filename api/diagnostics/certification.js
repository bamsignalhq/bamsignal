import { requireDiagnosticsAccess } from "../../server/services/diagnosticsAccess.js";
import {
  approveCertificationVerification,
  cleanupCertificationMember,
  createCertificationConciergeJourney,
  peekCertificationOtp,
  runCertificationQuery,
  seedCertificationMemberProfile,
  seedCertificationSignupOtp,
  setCertificationPhoneVerified,
  simulateCertificationPremiumWebhook,
  certificationEmailDomain,
  isCertificationEmail
} from "../../server/services/certificationE2e.js";

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

function sendCertificationError(res, error) {
  const status = Number(error?.status) || 500;
  return res.status(status).json({
    ok: false,
    error: error?.message || "Certification request failed.",
    code: error?.code || null
  });
}

export default async function certificationDiagnosticsHandler(req, res) {
  const access = await requireDiagnosticsAccess(req);
  if (!access.ok) {
    return res.status(access.status || 401).json({ ok: false, error: "Not authorized." });
  }

  const body = parseBody(req);
  const action = String(req.query?.action || body.action || "").trim().toLowerCase();

  try {
    if (action === "status") {
      return res.status(200).json({
        ok: true,
        brand: "Production E2E Certification™",
        certificationEmailDomain: certificationEmailDomain()
      });
    }

    if (action === "peek-signup-otp") {
      const email = String(body.email || "").trim();
      const result = peekCertificationOtp(email);
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === "seed-signup-otp") {
      const email = String(body.email || "").trim();
      const code = body.code != null ? String(body.code) : "246810";
      const result = await seedCertificationSignupOtp(email, code);
      return res.status(200).json(result);
    }

    if (action === "query") {
      const name = String(body.name || body.query || "").trim();
      const params = Array.isArray(body.params) ? body.params : [];
      const result = await runCertificationQuery(name, params);
      return res.status(200).json(result);
    }

    if (action === "seed-member-profile") {
      const result = await seedCertificationMemberProfile({
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim(),
        profile: body.profile && typeof body.profile === "object" ? body.profile : {}
      });
      return res.status(200).json(result);
    }

    if (action === "set-phone-verified") {
      const result = await setCertificationPhoneVerified({
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "approve-verification") {
      const result = await approveCertificationVerification({
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "simulate-premium-webhook") {
      const result = await simulateCertificationPremiumWebhook({
        email: String(body.email || "").trim(),
        reference: body.reference,
        productId: body.productId,
        amountKobo: body.amountKobo
      });
      return res.status(result.ok ? 200 : 502).json(result);
    }

    if (action === "create-concierge-journey") {
      const result = await createCertificationConciergeJourney({
        memberId: String(body.memberId || "").trim(),
        consultantId: String(body.consultantId || "cert-consultant-01").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "cleanup-member") {
      const email = String(body.email || "").trim();
      if (!isCertificationEmail(email)) {
        return res.status(403).json({ ok: false, error: "Certification email required." });
      }
      const result = await cleanupCertificationMember(email);
      return res.status(200).json({ ok: true, ...result });
    }

    return res.status(400).json({ ok: false, error: "Invalid action." });
  } catch (error) {
    if (error?.name === "CertificationE2eError") {
      return sendCertificationError(res, error);
    }
    console.error("[bamsignal:certification-e2e]", error);
    return res.status(500).json({ ok: false, error: "Certification handler failed." });
  }
}
