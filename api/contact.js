export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, email, topic, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Name, email, and message are required" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ ok: false, error: "Support email is not configured yet. Add RESEND_API_KEY in Vercel." });
  }

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.SUPPORT_EMAIL_FROM || "BamSignal <support@bamsignal.com>",
      to: "support@bamsignal.com",
      reply_to: email,
      subject: `BamSignal support: ${topic || "Contact message"}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${topic || "Contact message"}`,
        "",
        message
      ].join("\n")
    })
  }).then(async (response) => {
    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ ok: false, error: "Support email could not be sent", detail });
    }
    return res.status(200).json({ ok: true, to: "support@bamsignal.com" });
  }).catch((error) => {
    return res.status(500).json({ ok: false, error: error.message || "Support email failed" });
  });
}
