import { getPlatformSetting } from "../db.js";

export const BAMSIGNAL_SITE = "https://bamsignal.com";
export const BAMSIGNAL_LOGO = `${BAMSIGNAL_SITE}/brand/logo.webp`;
export const BAMSIGNAL_LOGO_2X = `${BAMSIGNAL_SITE}/brand/logo.png`;

/** Light brand theme — matches app tokens (--bg, --brand-purple, etc.) */
export const EMAIL_THEME = {
  pageBg: "#fdf2f8",
  cardBg: "#ffffff",
  cardBorder: "rgba(123, 31, 162, 0.12)",
  text: "#1a0a2e",
  textMuted: "#6b5b7b",
  kicker: "#7b1fa2",
  otpBg: "#faf5ff",
  otpBorder: "rgba(123, 31, 162, 0.18)",
  divider: "rgba(123, 31, 162, 0.1)",
  link: "#7b1fa2",
  fieldBg: "#faf5ff",
  fieldBorder: "rgba(123, 31, 162, 0.14)",
  legal: "#8a7a9a"
};

export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/realbamsignal/",
    icon: `${BAMSIGNAL_SITE}/email/social/instagram.png`
  },
  {
    id: "x",
    label: "X",
    url: "https://x.com/realbamsignal",
    icon: `${BAMSIGNAL_SITE}/email/social/x.png`
  },
  {
    id: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/realbamsignal/",
    icon: `${BAMSIGNAL_SITE}/email/social/facebook.png`
  },
  {
    id: "tiktok",
    label: "TikTok",
    url: "https://www.tiktok.com/@realbamsignal",
    icon: `${BAMSIGNAL_SITE}/email/social/tiktok.png`
  }
];

export const DEFAULT_EMAIL_BRANDING = {
  bannerEnabled: false,
  bannerImageUrl: "",
  bannerLinkUrl: "",
  bannerAltText: ""
};

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeEmailBranding(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    bannerEnabled: Boolean(source.bannerEnabled),
    bannerImageUrl: String(source.bannerImageUrl || "").trim(),
    bannerLinkUrl: String(source.bannerLinkUrl || "").trim(),
    bannerAltText: String(source.bannerAltText || "").trim()
  };
}

export async function loadEmailBranding() {
  const stored = await getPlatformSetting("email_branding", null);
  return normalizeEmailBranding(stored || DEFAULT_EMAIL_BRANDING);
}

function buildLogoHeader() {
  return `
    <tr>
      <td align="center" style="padding:32px 28px 12px">
        <a href="${BAMSIGNAL_SITE}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
          <img
            src="${BAMSIGNAL_LOGO}"
            srcset="${BAMSIGNAL_LOGO} 1x, ${BAMSIGNAL_LOGO_2X} 2x"
            alt="BamSignal"
            width="148"
            height="42"
            style="display:block;height:42px;width:auto;max-width:148px;margin:0 auto;border:0"
          />
        </a>
      </td>
    </tr>
  `;
}

function buildBannerHeader(branding) {
  const imageUrl = branding.bannerImageUrl.trim();
  const alt = escapeHtml(branding.bannerAltText || "BamSignal");
  const image = `
    <img
      src="${escapeHtml(imageUrl)}"
      alt="${alt}"
      width="600"
      style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto;border:0"
    />
  `;
  const link = branding.bannerLinkUrl.trim();
  const inner = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${image}</a>`
    : image;

  return `
    <tr>
      <td align="center" style="padding:0;line-height:0;font-size:0">
        ${inner}
      </td>
    </tr>
  `;
}

export function buildEmailHeader(branding = DEFAULT_EMAIL_BRANDING) {
  const normalized = normalizeEmailBranding(branding);
  const useBanner = normalized.bannerEnabled && normalized.bannerImageUrl;
  return useBanner ? buildBannerHeader(normalized) : buildLogoHeader();
}

export async function resolveEmailHeader(branding = DEFAULT_EMAIL_BRANDING) {
  const normalized = normalizeEmailBranding(branding);
  if (!normalized.bannerEnabled || !normalized.bannerImageUrl) {
    return buildLogoHeader();
  }

  try {
    const response = await fetch(normalized.bannerImageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) return buildLogoHeader();
    const contentType = String(response.headers.get("content-type") || "");
    if (contentType && !contentType.startsWith("image/")) return buildLogoHeader();
  } catch {
    return buildLogoHeader();
  }

  return buildBannerHeader(normalized);
}

function buildSocialIconsRow() {
  const cells = SOCIAL_LINKS.map(
    (social) => `
      <td align="center" style="padding:0 8px">
        <a
          href="${social.url}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${escapeHtml(social.label)}"
          style="text-decoration:none;display:inline-block"
        >
          <img
            src="${social.icon}"
            alt="${escapeHtml(social.label)}"
            width="22"
            height="22"
            style="display:block;width:22px;height:22px;border:0"
          />
        </a>
      </td>
    `
  ).join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto">
      <tr>${cells}</tr>
    </table>
  `;
}

export function buildEmailFooter({ year = new Date().getFullYear() } = {}) {
  return `
    <tr>
      <td style="padding:28px 28px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid ${EMAIL_THEME.divider};padding-top:24px;text-align:center">
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${EMAIL_THEME.text}">BamSignal</p>
              <p style="margin:0 0 4px;font-size:12px;color:${EMAIL_THEME.textMuted}">Send a Signal.</p>
              <p style="margin:0 0 18px;font-size:12px;color:${EMAIL_THEME.textMuted}">Meet people who match your vibe.</p>
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_THEME.textMuted}">Follow BamSignal</p>
              ${buildSocialIconsRow()}

              <p style="margin:18px 0 0;font-size:11px;line-height:1.5;color:${EMAIL_THEME.textMuted}">
                You can reply to this email — we&rsquo;ll see it.
              </p>

              <p style="margin:20px 0 0;font-size:11px;line-height:1.6;color:${EMAIL_THEME.legal}">
                &copy; ${year} BamSignal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function buildEmailLegalStrip() {
  const privacyUrl = `${BAMSIGNAL_SITE}/privacy`;
  const termsUrl = `${BAMSIGNAL_SITE}/terms`;
  return `
    <tr>
      <td align="center" style="padding:20px 24px 28px">
        <p style="margin:0 0 12px;max-width:420px;font-size:10px;line-height:1.55;color:${EMAIL_THEME.legal}">
          BamSignal is provided as is. We do not guarantee matches or outcomes. Meet safely and use your judgment.
        </p>
        <p style="margin:0;font-size:10px;line-height:1.5;color:${EMAIL_THEME.legal}">
          <a href="${privacyUrl}" style="color:${EMAIL_THEME.link};text-decoration:underline">Privacy</a>
          &nbsp;&middot;&nbsp;
          <a href="${termsUrl}" style="color:${EMAIL_THEME.link};text-decoration:underline">Terms</a>
        </p>
      </td>
    </tr>
  `;
}

export function emailButton(label, href) {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 8px">
      <tr>
        <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#e91e8c 0%,#9c27b0 50%,#673ab7 100%)">
          <a
            href="${safeHref}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-block;padding:14px 28px;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none"
          >${safeLabel}</a>
        </td>
      </tr>
    </table>
  `;
}

export function emailCenterBlock(innerHtml) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="text-align:center">${innerHtml}</td>
      </tr>
    </table>
  `;
}

export function emailOtpCode(code) {
  const safe = escapeHtml(String(code));
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 4px">
      <tr>
        <td align="center">
          <div style="display:inline-block;padding:16px 32px;border-radius:16px;background:${EMAIL_THEME.otpBg};border:1px solid ${EMAIL_THEME.otpBorder};font-size:32px;font-weight:800;letter-spacing:0.35em;color:${EMAIL_THEME.text}">${safe}</div>
        </td>
      </tr>
    </table>
  `;
}

export function emailKicker(text, { center = false } = {}) {
  const align = center ? "center" : "left";
  return `<p style="margin:0 0 8px;color:${EMAIL_THEME.kicker};font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;text-align:${align}">${escapeHtml(text)}</p>`;
}

export function emailHeading(text, { marginBottom = 16, center = false } = {}) {
  const align = center ? "center" : "left";
  return `<h1 style="margin:0 0 ${marginBottom}px;font-size:26px;line-height:1.2;color:${EMAIL_THEME.text};font-weight:700;text-align:${align}">${escapeHtml(text)}</h1>`;
}

export function emailLead(text, { center = false } = {}) {
  const align = center ? "center" : "left";
  return `<p style="margin:0 0 12px;color:${EMAIL_THEME.textMuted};line-height:1.7;text-align:${align}">${escapeHtml(text)}</p>`;
}

export function emailMuted(text, { center = false, marginTop = 0 } = {}) {
  const align = center ? "center" : "left";
  return `<p style="margin:${marginTop}px 0 0;color:${EMAIL_THEME.textMuted};line-height:1.7;font-size:14px;text-align:${align}">${escapeHtml(text)}</p>`;
}

export function buildSignupVerificationEmailBody({ name, code }) {
  const displayName = String(name || "there").trim() || "there";
  return emailCenterBlock(`
    ${emailKicker("Verify your email", { center: true })}
    ${emailHeading("Your verification code", { center: true })}
    ${emailLead(`Hi ${displayName}, enter this code in the app to finish signing up. It expires in 10 minutes.`, { center: true })}
    ${emailOtpCode(code)}
    ${emailMuted("If you didn't request this, you can ignore this email.", { center: true, marginTop: 16 })}
  `);
}

export function buildLoginVerificationEmailBody({ name, code }) {
  const displayName = String(name || "there").trim() || "there";
  return emailCenterBlock(`
    ${emailKicker("Verify it's you", { center: true })}
    ${emailHeading("Your login code", { center: true })}
    ${emailLead(`Hi ${displayName}, enter this code to finish signing in on a new device. It expires in 10 minutes.`, { center: true })}
    ${emailOtpCode(code)}
    ${emailMuted("If you didn't try to sign in, change your PIN and contact support.", { center: true, marginTop: 16 })}
  `);
}

export function buildPinResetEmailBody({ name, code }) {
  const displayName = String(name || "there").trim() || "there";
  return emailCenterBlock(`
    ${emailKicker("Reset your PIN", { center: true })}
    ${emailHeading("Your reset code", { center: true })}
    ${emailLead(`Hi ${displayName}, enter this code in the app to choose a new 6-digit PIN. It expires in 10 minutes.`, { center: true })}
    ${emailOtpCode(code)}
    ${emailMuted("If you didn't request a PIN reset, you can ignore this email.", { center: true, marginTop: 16 })}
  `);
}

export function emailFieldCard(label, value, { prewrap = false } = {}) {
  const valueStyle = prewrap
    ? `margin:0;white-space:pre-wrap;line-height:1.65;color:${EMAIL_THEME.text};font-size:15px`
    : `margin:0;color:${EMAIL_THEME.text};font-size:15px;line-height:1.6`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px">
      <tr>
        <td style="background:${EMAIL_THEME.fieldBg};border:1px solid ${EMAIL_THEME.fieldBorder};border-radius:14px;padding:14px 16px">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:${EMAIL_THEME.kicker}">${escapeHtml(label)}</p>
          <p style="${valueStyle}">${escapeHtml(value)}</p>
        </td>
      </tr>
    </table>
  `;
}

export function emailFieldCards(cards) {
  return cards.map((card) => emailFieldCard(card.label, card.value, { prewrap: card.prewrap })).join("");
}

export function buildContactSupportEmailBody({ topic, name, email, message }) {
  return `
    ${emailKicker("New support request")}
    ${emailHeading(topic, { marginBottom: 20 })}
    ${emailFieldCards([
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Message", value: message, prewrap: true }
    ])}
    ${emailMuted("Reply directly to this email to reach the member.")}
  `;
}

export function buildContactAcknowledgementEmailBody({ name, topic }) {
  return `
    ${emailKicker("Support request received")}
    ${emailHeading(`Thanks for reaching out, ${name}.`)}
    ${emailLead("We've received your message and the BamSignal team will get back to you as soon as possible.")}
    ${emailFieldCard("Topic", topic)}
    ${emailMuted("You do not need to send the message again unless you have more details to add.")}
    ${emailMuted("We typically respond within a few hours, 9am–6pm WAT.")}
    ${emailButton("Open BamSignal", BAMSIGNAL_SITE)}
  `;
}

export function buildContactSupportPlainText({ topic, name, email, message }) {
  return [
    "New BamSignal support request",
    "",
    `Topic: ${topic}`,
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
    "",
    "Reply directly to this email to reach the member.",
    buildPlainEmailFooter()
  ].join("\n");
}

export function buildContactAcknowledgementPlainText({ name, topic }) {
  return [
    `Hi ${name},`,
    "",
    `We've received your BamSignal message about "${topic}" and will get back to you as soon as possible.`,
    "",
    "You do not need to send the message again unless you have more details to add.",
    "",
    "We typically respond within a few hours, 9am–6pm WAT.",
    "",
    `Open BamSignal: ${BAMSIGNAL_SITE}`,
    buildPlainEmailFooter()
  ].join("\n");
}

export function buildPurchaseConfirmationEmailBody({
  firstName,
  productName,
  amountLabel,
  reference,
  purchasedAt,
  nextSteps,
  supportEmail = "support@bamsignal.com"
}) {
  return `
    ${emailKicker("Purchase confirmed")}
    ${emailHeading(`Thanks, ${firstName}.`)}
    ${emailLead(`Your ${productName} purchase was successful.`)}
    ${emailFieldCards([
      { label: "Amount", value: amountLabel },
      { label: "Reference", value: reference },
      { label: "Date", value: purchasedAt },
      { label: "Status", value: "Successful" }
    ])}
    ${emailLead(nextSteps)}
    ${emailMuted(`If you need help, contact ${supportEmail}.`)}
    ${emailButton("Open BamSignal", BAMSIGNAL_SITE)}
  `;
}

export function buildPurchaseConfirmationPlainText({
  firstName,
  productName,
  amountLabel,
  reference,
  purchasedAt,
  nextSteps,
  supportEmail = "support@bamsignal.com"
}) {
  return [
    `Hi ${firstName},`,
    "",
    `Your ${productName} purchase was successful.`,
    "",
    `Amount: ${amountLabel}`,
    `Reference: ${reference}`,
    `Date: ${purchasedAt}`,
    "Status: Successful",
    "",
    nextSteps,
    "",
    `If you need help, contact ${supportEmail}.`,
    "",
    "Thank you,",
    "BamSignal Team",
    buildPlainEmailFooter()
  ].join("\n");
}

export function wrapEmailLayout({ bodyHtml, branding, preheader = "", headerHtml }) {
  const header = headerHtml || buildEmailHeader(branding);
  const footer = buildEmailFooter();
  const legalStrip = buildEmailLegalStrip();
  const hiddenPreheader = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>BamSignal</title>
      </head>
      <body style="margin:0;padding:0;background:${EMAIL_THEME.pageBg};color:${EMAIL_THEME.text};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
        ${hiddenPreheader}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_THEME.pageBg}">
          <tr>
            <td align="center" style="padding:24px 12px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${EMAIL_THEME.cardBg};border:1px solid ${EMAIL_THEME.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(123,31,162,0.08)">
                ${header}
                <tr>
                  <td style="padding:12px 28px 8px;font-size:15px;line-height:1.65;color:${EMAIL_THEME.text}">
                    ${bodyHtml}
                  </td>
                </tr>
                ${footer}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
                ${legalStrip}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function wrapEmailLayoutAsync(options) {
  const headerHtml = await resolveEmailHeader(options.branding);
  return wrapEmailLayout({ ...options, headerHtml });
}

export function buildPlainEmailFooter({ year = new Date().getFullYear() } = {}) {
  const social = SOCIAL_LINKS.map((item) => `${item.label}: ${item.url}`).join("\n");
  return [
    "",
    "—",
    "Follow BamSignal",
    social,
    "",
    "You can reply to this email — we'll see it.",
    "",
    `© ${year} BamSignal. All rights reserved.`,
    "",
    "BamSignal is provided as is. We do not guarantee matches or outcomes. Meet safely and use your judgment.",
    `${BAMSIGNAL_SITE}/privacy · ${BAMSIGNAL_SITE}/terms`
  ].join("\n");
}
