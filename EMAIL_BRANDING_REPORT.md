# Email & Footer Branding Report

**Date:** June 14, 2026  
**Scope:** BamSignal transactional email layout, admin email banner system, and website footer refinement.

---

## Summary

BamSignal now uses a shared, production-quality email layout with a centered logo (or admin-controlled promotional banner), a consistent fintech-style footer, and official social links. The website footer was restructured into Brand, Quick Links, Social, and Support sections with the same social profiles.

---

## Templates updated

| Email type | In-repo control | Status |
|------------|-----------------|--------|
| Support request (to team) | `server/services/contactMail.js` | **Updated** — shared layout |
| Support acknowledgement (to user) | `server/services/contactMail.js` | **Updated** — shared layout |
| Welcome | Supabase Auth / onboarding | **External** — not in this repo |
| Verification (OTP) | Supabase Auth | **External** — configure in Supabase Dashboard |
| Password reset | Supabase Auth | **External** — configure in Supabase Dashboard |
| Push/in-app notifications | Client templates in `cms.ts` | **N/A** — not email |
| Premium / referral transactional | Not yet implemented server-side | **Ready** — use `emailBranding.js` helpers |

All **Resend-backed** emails sent from this codebase now use the shared module in `server/services/emailBranding.js`.

---

## Footer improvements

### Email footer (new)

- Brand block: **BamSignal** / *Send a Signal.* / *Meet people who match your vibe.*
- Support: [support@bamsignal.com](mailto:support@bamsignal.com)
- Website: https://bamsignal.com
- Social row: Instagram, X, Facebook, TikTok (PNG icons, 22px, linked)
- Copyright: `© {year} BamSignal. All rights reserved.`
- **Removed:** No “18+ only…” or outcome disclaimer in codebase templates (text was not present in repo; ensure Supabase email templates are updated manually if used there).

### Website footer (refined)

- **Brand** — logo, BamSignal, taglines
- **Quick Links** — About, Safety, Privacy, Terms, Contact (Blog removed from footer per spec)
- **Social** — same four platforms with hover states, `target="_blank"`, accessible labels
- **Support** — support@bamsignal.com mailto link
- **Copyright** — dynamic year

---

## Banner system implementation

### Storage

- Platform setting key: `email_branding` in PostgreSQL (`platform_settings` table)
- API: `POST /api/auth/identity?action=email-branding` (read) and `email-branding-save` (admin write)

### Admin UI

- **Admin → Command center → Email** tab
- Fields: Enable banner, Banner image URL, Banner link URL, Banner alt text

### Logic

1. If banner **disabled** → centered BamSignal logo (`logo.webp` + `logo.png` retina `srcset`)
2. If banner **enabled** with valid image URL → full-width banner (optional link wrap)
3. If banner URL is missing, unreachable, or not `image/*` → **falls back to logo** at send time (`HEAD` validation)

---

## Social links added

| Platform | URL |
|----------|-----|
| Instagram | https://www.instagram.com/realbamsignal/ |
| X | https://x.com/realbamsignal |
| Facebook | https://www.facebook.com/realbamsignal/ |
| TikTok | https://www.tiktok.com/@realbamsignal |

- **Email:** PNG icons at `/email/social/{platform}.png` (generated from SVG via `npm run generate:email-icons`)
- **Website:** `SocialIconLinks` component with inline SVG brand marks

---

## Files modified / added

### New

- `server/services/emailBranding.js` — shared layout, header, footer, banner resolution
- `src/constants/social.ts` — official social URLs
- `src/constants/emailBranding.ts` — admin settings types/defaults
- `src/services/emailBranding.ts` — client fetch/save for admin
- `src/components/SocialIconLinks.tsx` — website social icons
- `public/email/social/*.{svg,png}` — email social assets
- `scripts/generate-email-social-icons.mjs` — PNG generation for email clients
- `EMAIL_BRANDING_REPORT.md` — this document

### Modified

- `server/services/contactMail.js` — uses shared email layout
- `api/auth/identity.js` — `email-branding` + `email-branding-save` actions
- `src/components/SiteFooter.tsx` — multi-section premium footer
- `src/constants/footer.ts` — taglines, quick links, dynamic copyright
- `src/styles/footer.css` — responsive grid, social hover states
- `src/pages/AdminHubPage.tsx` — Email branding admin tab
- `package.json` — `generate:email-icons` script

---

## Remaining recommendations

1. **Supabase Auth emails** — Copy the HTML structure from `wrapEmailLayout` into Supabase Dashboard → Authentication → Email Templates (confirm signup, reset password, magic link). Use hosted logo URL and footer social PNGs.
2. **Future transactional emails** (premium receipt, referral invite) — Import `wrapEmailLayoutAsync`, `emailButton`, and `buildPlainEmailFooter` from `server/services/emailBranding.js`.
3. **Banner assets** — Host campaign images on `bamsignal.com` or CDN; recommended width ~1200px, &lt;200KB, WebP or PNG.
4. **Email preview** — Optional admin “Send test email” action for banner QA before campaigns.
5. **Light-mode email clients** — Current design is dark-first (on-brand); add a `@media (prefers-color-scheme: light)` block if Apple Mail light rendering needs tuning.
6. **Commit PNG icons** — Ensure `public/email/social/*.png` are committed so production emails resolve icons immediately after deploy.

---

## Verification

- `npm run build` — **PASS**
- `npm run generate:email-icons` — **PASS** (4 PNGs generated)
- Contact form emails use unified header + footer when `RESEND_API_KEY` is set

---

*Goal met: BamSignal emails and site footer present as a mature, trusted brand rather than a startup prototype.*
