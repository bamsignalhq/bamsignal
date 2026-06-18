import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_EMAIL_BRANDING,
  buildContactAcknowledgementEmailBody,
  buildContactSupportEmailBody,
  emailButton,
  escapeHtml,
  wrapEmailLayout
} from "../server/services/emailBranding.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/email-preview");

/** Use same-origin assets when previewing via Vite (`npm run dev`). */
function localize(html) {
  return html.replaceAll("https://bamsignal.com", "");
}

const bannerBranding = {
  bannerEnabled: true,
  bannerImageUrl: "/email-preview/sample-banner.webp",
  bannerLinkUrl: "https://bamsignal.com",
  bannerAltText: "Signal Pass — unlock unlimited signals"
};

const samples = {
  "support-request": {
    title: "Support request (to team)",
    subject: "BamSignal support: Account help",
    body: buildContactSupportEmailBody({
      topic: "Account help",
      name: "Ada O.",
      email: "ada@example.com",
      message: "Hi — I can't see new profiles in Discover after updating my city. Can you help?"
    })
  },
  "support-acknowledgement": {
    title: "Support acknowledgement (to user)",
    subject: "We received your BamSignal message",
    body: buildContactAcknowledgementEmailBody({
      name: "Ada",
      topic: "Account help"
    })
  },
  "welcome": {
    title: "Welcome (mock — Supabase today)",
    subject: "Welcome to BamSignal",
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">You're in</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Welcome to BamSignal, Ada.</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Your profile is live. Send your first signal when someone feels right.</p>
      ${emailButton("Open BamSignal", "https://bamsignal.com")}
    `
  },
  "verification": {
    title: "Verification OTP (mock — Supabase today)",
    subject: "Your BamSignal verification code",
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Verify your email</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Your code is 482913</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Enter this code in BamSignal to finish signing up. It expires in 10 minutes.</p>
      <div style="background:#18243b;border:1px solid #253553;border-radius:14px;padding:18px;margin:16px 0;text-align:center;letter-spacing:0.35em;font-size:28px;font-weight:700;color:#f8fafc">482913</div>
      <p style="margin:0;color:#9db0cf;line-height:1.7;font-size:13px">If you didn't request this, you can ignore this email.</p>
    `
  },
  "password-reset": {
    title: "Password reset (mock — Supabase today)",
    subject: "Reset your BamSignal password",
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Password reset</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Reset your password</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Tap the button below to choose a new password. This link expires in 1 hour.</p>
      ${emailButton("Reset password", "https://bamsignal.com/auth?reset=1")}
      <p style="margin:16px 0 0;color:#9db0cf;line-height:1.7;font-size:13px">If you didn't request a reset, ignore this email — your password won't change.</p>
    `
  },
  "premium": {
    title: "Premium activated (future transactional)",
    subject: "Signal Pass is active",
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Signal Pass</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">You're premium, Ada.</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Unlimited signals are unlocked. Your pass is active until <strong style="color:#f8fafc">14 Jul 2026</strong>.</p>
      ${emailButton("Send a Signal", "https://bamsignal.com/discover")}
    `
  },
  "referral": {
    title: "Referral invite (future transactional)",
    subject: "Ada invited you to BamSignal",
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">You're invited</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Ada sent you a Signal invite.</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Join BamSignal and meet people who match your vibe. Use code <strong style="color:#f8fafc">ADA2026</strong> when you sign up.</p>
      ${emailButton("Join BamSignal", "https://bamsignal.com/signup?ref=ADA2026")}
    `
  },
  "banner-variant": {
    title: "Promotional banner header (admin)",
    subject: "Campaign email with banner",
    branding: bannerBranding,
    body: `
      <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Limited launch</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Signal Pass is live in Lagos.</h1>
      <p style="margin:0 0 12px;color:#dbe5f4;line-height:1.7">Unlock unlimited signals for your first week at a founding-member rate.</p>
      ${emailButton("Get Signal Pass", "https://bamsignal.com/premium")}
    `
  }
};

await mkdir(outDir, { recursive: true });

const links = [];

for (const [slug, sample] of Object.entries(samples)) {
  const branding = sample.branding || DEFAULT_EMAIL_BRANDING;
  const html = localize(
    wrapEmailLayout({
      branding,
      preheader: sample.subject,
      bodyHtml: sample.body
    })
  );
  const filename = `${slug}.html`;
  await writeFile(path.join(outDir, filename), html, "utf8");
  links.push({ slug, filename, title: sample.title, subject: sample.subject });
}

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BamSignal email previews</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0b1220; color: #dbe5f4; }
    header { padding: 28px 24px; border-bottom: 1px solid #23314d; }
    h1 { margin: 0 0 8px; font-size: 1.5rem; }
    p { margin: 0; color: #9db0cf; line-height: 1.6; max-width: 60ch; }
    main { display: grid; gap: 20px; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .card { background: #131d31; border: 1px solid #23314d; border-radius: 16px; overflow: hidden; }
    .card-head { padding: 16px 18px; border-bottom: 1px solid #23314d; }
    .card-head h2 { margin: 0 0 4px; font-size: 1rem; }
    .card-head span { font-size: 0.85rem; color: #9db0cf; }
    iframe { width: 100%; height: 720px; border: 0; background: #0b1220; }
    a.open { display: inline-block; margin-top: 10px; color: #e879f9; font-size: 0.85rem; }
  </style>
</head>
<body>
  <header>
    <h1>BamSignal email previews</h1>
    <p>Review before deploy. Run <code>npm run dev</code> and open <code>/email-preview/</code>. Mocks marked Supabase are not in-repo yet.</p>
  </header>
  <main>
    ${links
      .map(
        (link) => `
      <section class="card">
        <div class="card-head">
          <h2>${escapeHtml(link.title)}</h2>
          <span>Subject: ${escapeHtml(link.subject)}</span>
          <a class="open" href="./${link.filename}" target="_blank" rel="noopener">Open full page →</a>
        </div>
        <iframe src="./${link.filename}" title="${escapeHtml(link.title)}"></iframe>
      </section>`
      )
      .join("")}
  </main>
</body>
</html>`;

await writeFile(path.join(outDir, "index.html"), indexHtml, "utf8");
console.log(`Wrote ${links.length} email previews to public/email-preview/`);
