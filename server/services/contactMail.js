import dotenv from "dotenv";

dotenv.config();

export class ContactError extends Error {
  status;
  detail;

  constructor(status, message, detail) {
    super(message);
    this.name = "ContactError";
    this.status = status;
    this.detail = detail;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response;
}

export async function handleContactPost(body) {
  const { name, email, topic, message } = body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ContactError(400, "Name, email, and message are required");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new ContactError(
      503,
      "Support email is not configured yet. Email support@bamsignal.com directly."
    );
  }

  const safeName = name.trim();
  const safeEmail = email.trim();
  const safeTopic = topic?.trim() || "Contact message";
  const safeMessage = message.trim();
  const from = process.env.SUPPORT_EMAIL_FROM || "BamSignal <support@bamsignal.com>";
  const to = process.env.SUPPORT_EMAIL_TO || process.env.VITE_SUPPORT_EMAIL || "support@bamsignal.com";
  const supportSubject = `BamSignal support: ${safeTopic}`;
  const plainMessage = [`Name: ${safeName}`, `Email: ${safeEmail}`, `Topic: ${safeTopic}`, "", safeMessage].join("\n");

  const supportHtml = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;padding:32px;color:#f8fafc">
      <div style="max-width:640px;margin:0 auto;background:#131d31;border:1px solid #23314d;border-radius:20px;overflow:hidden">
        <div style="padding:24px 24px 12px">
          <img src="https://bamsignal.com/brand/logo.webp" alt="BamSignal" style="height:40px;width:auto;display:block" />
        </div>
        <div style="padding:12px 24px 24px">
          <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">New support request</p>
          <h1 style="margin:0 0 20px;font-size:26px;line-height:1.15">${escapeHtml(safeTopic)}</h1>
          <div style="display:grid;gap:12px">
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Name</strong>
              <span>${escapeHtml(safeName)}</span>
            </div>
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Email</strong>
              <span>${escapeHtml(safeEmail)}</span>
            </div>
            <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px">
              <strong style="display:block;margin-bottom:6px">Message</strong>
              <div style="white-space:pre-wrap;line-height:1.6">${escapeHtml(safeMessage)}</div>
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
          <img src="https://bamsignal.com/brand/logo.webp" alt="BamSignal" style="height:40px;width:auto;display:block" />
        </div>
        <div style="padding:12px 24px 24px">
          <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Support request received</p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15">Thanks for reaching out, ${escapeHtml(safeName)}.</h1>
          <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">We’ve received your message and the BamSignal team will get back to you as soon as possible.</p>
          <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:14px;margin:16px 0">
            <strong style="display:block;margin-bottom:6px">Topic</strong>
            <span>${escapeHtml(safeTopic)}</span>
          </div>
          <p style="margin:0;color:#9db0cf;line-height:1.7">You do not need to send the message again unless you have more details to add.</p>
        </div>
      </div>
    </div>
  `;

  const supportResponse = await sendEmail({
    from,
    to,
    reply_to: safeEmail,
    subject: supportSubject,
    text: plainMessage,
    html: supportHtml
  });

  if (!supportResponse.ok) {
    const detail = await supportResponse.text();
    throw new ContactError(502, "Support email could not be sent", detail);
  }

  const acknowledgementResponse = await sendEmail({
    from,
    to: safeEmail,
    subject: "We received your BamSignal message",
    text: `Hi ${safeName},\n\nWe’ve received your BamSignal message about "${safeTopic}" and will get back to you as soon as possible.\n\nBamSignal Support`,
    html: acknowledgementHtml
  });

  if (!acknowledgementResponse.ok) {
    return {
      ok: true,
      acknowledgement: false,
      message: "Support request received."
    };
  }

  return {
    ok: true,
    acknowledgement: true,
    message: "Support request received."
  };
}

export function sendContactJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function handleContactNodeRequest(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendContactJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const result = await handleContactPost(req.body || {});
    return sendContactJson(res, 200, result);
  } catch (error) {
    if (error instanceof ContactError) {
      return sendContactJson(res, error.status, {
        ok: false,
        error: error.message,
        detail: error.detail
      });
    }

    return sendContactJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Support email failed"
    });
  }
}
