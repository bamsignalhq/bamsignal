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

  const from = process.env.SUPPORT_EMAIL_FROM || "BamSignal <support@bamsignal.com>";
  const supportSubject = `BamSignal support: ${topic || "Contact message"}`;
  const plainMessage = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic || "Contact message"}`,
    "",
    message
  ].join("\n");

  const supportHtml = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;padding:32px;color:#f8fafc">
      <div style="max-width:640px;margin:0 auto;background:#131d31;border:1px solid #23314d;border-radius:20px;overflow:hidden">
        <div style="padding:24px 24px 12px">
          <img src="https://bamsignal.com/brand/compact-logo-dark.jpg" alt="BamSignal" style="height:40px;width:auto;display:block" />
        </div>
        <div style="padding:12px 24px 24px">
          <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">New support request</p>
          <h1 style="margin:0 0 20px;font-size:26px;line-height:1.15">${topic || "Contact message"}</h1>
          <div style="display:grid;gap:12px">
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Name</strong>
              <span>${name}</span>
            </div>
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Email</strong>
              <span>${email}</span>
            </div>
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Message</strong>
              <div style="white-space:pre-wrap;line-height:1.6">${String(message)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const acknowledgementHtml = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;padding:32px;color:#f8fafc">
      <div style="max-width:640px;margin:0 auto;background:#131d31;border:1px solid #23314d;border-radius:20px;overflow:hidden">
        <div style="padding:24px 24px 12px">
          <img src="https://bamsignal.com/brand/compact-logo-dark.jpg" alt="BamSignal" style="height:40px;width:auto;display:block" />
        </div>
        <div style="padding:12px 24px 24px">
          <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Support request received</p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15">Thanks for reaching out, ${name}.</h1>
          <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">We’ve received your message and the BamSignal team will get back to you as soon as possible.</p>
          <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px;margin:16px 0">
            <strong style="display:block;margin-bottom:6px">Topic</strong>
            <span>${topic || "Contact message"}</span>
          </div>
          <p style="margin:0;color:#9db0cf;line-height:1.7">You do not need to send the message again unless you have more details to add.</p>
        </div>
      </div>
    </div>
  `;

  const sendEmail = (payload) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

  return sendEmail({
    from,
    to: "support@bamsignal.com",
    reply_to: email,
    subject: supportSubject,
    text: plainMessage,
    html: supportHtml
  }).then(async (supportResponse) => {
    if (!supportResponse.ok) {
      const detail = await supportResponse.text();
      return res.status(502).json({ ok: false, error: "Support email could not be sent", detail });
    }

    const acknowledgementResponse = await sendEmail({
      from,
      to: email,
      subject: "We received your BamSignal message",
      text: `Hi ${name},\n\nWe’ve received your BamSignal message about \"${topic || "Contact message"}\" and will get back to you as soon as possible.\n\nBamSignal Support`,
      html: acknowledgementHtml
    });

    if (!acknowledgementResponse.ok) {
      return res.status(200).json({
        ok: true,
        acknowledgement: false,
        message: "Support request received."
      });
    }

    return res.status(200).json({
      ok: true,
      acknowledgement: true,
      message: "Support request received."
    });
  }).catch((error) => {
    return res.status(500).json({ ok: false, error: error.message || "Support email failed" });
  });
}
