export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, email, topic, message, to = "support@bamsignal.com" } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Name, email, and message are required" });
  }

  console.log("BamSignal support message", {
    to,
    name,
    email,
    topic: topic || "Contact message",
    message,
    receivedAt: new Date().toISOString()
  });

  return res.status(200).json({ ok: true, to });
}
