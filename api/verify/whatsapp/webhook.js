import {
  handleWhatsappVerificationWebhook
} from "../../../server/services/whatsappVerification.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false });
  }

  const body = req.body && typeof req.body === "object" ? req.body : null;
  if (!body) {
    return res.status(400).json({ success: false });
  }

  try {
    const result = await handleWhatsappVerificationWebhook(body);
    if (result.invalid) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[bamsignal] whatsapp webhook error:", error);
    return res.status(200).json({ success: true });
  }
}
