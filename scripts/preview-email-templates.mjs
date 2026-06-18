import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_EMAIL_BRANDING,
  buildContactAcknowledgementEmailBody,
  buildContactSupportEmailBody,
  buildLoginVerificationEmailBody,
  buildSignupVerificationEmailBody,
  emailButton,
  emailHeading,
  emailKicker,
  emailLead,
  emailMuted,
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
  welcome: {
    title: "Welcome (mock — Supabase today)",
    subject: "Welcome to BamSignal",
    body: `
      ${emailKicker("You're in")}
      ${emailHeading("Welcome, Ada.")}
      ${emailLead("Your profile is live. Send your first signal when someone feels right.")}
      ${emailButton("Open BamSignal", "https://bamsignal.com")}
    `
  },
  verification: {
    title: "Signup verification OTP",
    subject: "482913 is your BamSignal verification code",
    body: buildSignupVerificationEmailBody({ name: "Ada", code: "482913" })
  },
  "login-2fa": {
    title: "Login verification OTP",
    subject: "482913 is your BamSignal login code",
    body: buildLoginVerificationEmailBody({ name: "Ada", code: "482913" })
  },
  "password-reset": {
    title: "Password reset (mock — Supabase today)",
    subject: "Reset your BamSignal password",
    body: `
      ${emailKicker("Password reset")}
      ${emailHeading("Reset your password")}
      ${emailLead("Tap the button below to choose a new password. This link expires in 1 hour.")}
      ${emailButton("Reset password", "https://bamsignal.com/auth?reset=1")}
      ${emailMuted("If you didn't request a reset, ignore this email — your password won't change.", { marginTop: 16 })}
    `
  },
  premium: {
    title: "Premium activated (future transactional)",
    subject: "Signal Pass is active",
    body: `
      ${emailKicker("Signal Pass")}
      ${emailHeading("You're premium, Ada.")}
      ${emailLead("Unlimited signals are unlocked. Your pass is active until 14 Jul 2026.")}
      ${emailButton("Send a Signal", "https://bamsignal.com/discover")}
    `
  },
  referral: {
    title: "Referral invite (future transactional)",
    subject: "Ada invited you to BamSignal",
    body: `
      ${emailKicker("You're invited")}
      ${emailHeading("Ada sent you a Signal invite.")}
      ${emailLead("Join BamSignal and meet people who match your vibe. Use code ADA2026 when you sign up.")}
      ${emailButton("Join BamSignal", "https://bamsignal.com/signup?ref=ADA2026")}
    `
  },
  "banner-variant": {
    title: "Promotional banner header (admin)",
    subject: "Campaign email with banner",
    branding: bannerBranding,
    body: `
      ${emailKicker("Limited launch")}
      ${emailHeading("Signal Pass is live in Lagos.")}
      ${emailLead("Unlock unlimited signals for your first week at a founding-member rate.")}
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
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #fdf2f8; color: #1a0a2e; }
    header { padding: 28px 24px; border-bottom: 1px solid rgba(123,31,162,0.1); background: #fff; }
    h1 { margin: 0 0 8px; font-size: 1.5rem; }
    p { margin: 0; color: #6b5b7b; line-height: 1.6; max-width: 60ch; }
    main { display: grid; gap: 20px; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .card { background: #fff; border: 1px solid rgba(123,31,162,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(123,31,162,0.06); }
    .card-head { padding: 16px 18px; border-bottom: 1px solid rgba(123,31,162,0.1); }
    .card-head h2 { margin: 0 0 4px; font-size: 1rem; }
    .card-head span { font-size: 0.85rem; color: #6b5b7b; }
    iframe { width: 100%; height: 720px; border: 0; background: #fdf2f8; }
    a.open { display: inline-block; margin-top: 10px; color: #7b1fa2; font-size: 0.85rem; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <h1>BamSignal email previews</h1>
    <p>Light brand theme. Run <code>npm run dev</code> and open <code>/email-preview/</code>.</p>
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
