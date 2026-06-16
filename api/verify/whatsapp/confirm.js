import {
  confirmWhatsappVerification,
  WhatsappVerificationError
} from "../../../server/services/whatsappVerification.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (!phone) {
    return res.status(400).json({ ok: false, error: "Phone number is required." });
  }

  try {
    const result = await confirmWhatsappVerification(phone, code, { email: email || undefined });
    return res.status(200).json({
      ok: true,
      message: result.message || "Phone verified successfully.",
      phone: result.phone,
      phoneVerified: true,
      verifiedPhone: result.verifiedPhone || result.phone
    });
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    console.error("[bamsignal] whatsapp confirm error:", error);
    return res.status(500).json({
      ok: false,
      error: "We couldn't verify that code. Check it and try again."
    });
  }
}
