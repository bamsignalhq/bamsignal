import { getPlatformSetting } from "../db.js";

export const BAMSIGNAL_SITE = "https://bamsignal.com";
export const BAMSIGNAL_LOGO = `${BAMSIGNAL_SITE}/brand/logo.webp`;
export const BAMSIGNAL_LOGO_2X = `${BAMSIGNAL_SITE}/brand/logo.png`;
export const SUPPORT_EMAIL = "support@bamsignal.com";

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
            <td style="border-top:1px solid #2a3a57;padding-top:24px;text-align:center">
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#7f93b5">Follow BamSignal</p>
              ${buildSocialIconsRow()}

              <p style="margin:18px 0 0;font-size:11px;line-height:1.5;color:#8b9bb8">
                You can reply to this email — we&rsquo;ll see it.
              </p>

              <p style="margin:20px 0 0;font-size:11px;line-height:1.6;color:#6f84a8">
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
        <p style="margin:0 0 12px;max-width:420px;font-size:10px;line-height:1.55;color:#5c6f8f">
          BamSignal is provided as is. We do not guarantee matches or outcomes. Meet safely and use your judgment.
        </p>
        <p style="margin:0;font-size:10px;line-height:1.5;color:#5c6f8f">
          <a href="${privacyUrl}" style="color:#7f93b5;text-decoration:underline">Privacy</a>
          &nbsp;&middot;&nbsp;
          <a href="${termsUrl}" style="color:#7f93b5;text-decoration:underline">Terms</a>
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
        <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#e91e8c 0%,#8b5cf6 100%)">
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
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <title>BamSignal</title>
      </head>
      <body style="margin:0;padding:0;background:#0b1220;color:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
        ${hiddenPreheader}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1220">
          <tr>
            <td align="center" style="padding:24px 12px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#131d31;border:1px solid #23314d;border-radius:20px;overflow:hidden">
                ${header}
                <tr>
                  <td style="padding:12px 28px 8px;font-size:15px;line-height:1.65;color:#dbe5f4">
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
