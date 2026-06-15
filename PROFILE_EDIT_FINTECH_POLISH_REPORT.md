# Profile Edit — Fintech Polish Report

**Date:** June 15, 2026  
**Scope:** Keep current Edit Profile structure; polish hierarchy, spacing, grouping, and copy.

---

## Visual polish changes

| Area | Before | After |
|------|--------|-------|
| Page background | Flat card stack on default bg | Soft tinted background (`profile-page--hero` / `--editing`) |
| Overview sections | Heavy bordered cards | Divider-based `profile-overview-block` rows — no nested boxes |
| Edit accordions | Full card borders per section | Minimal dividers, light surfaces, subtle chevrons |
| Form fields | Stacked labels inside boxes | `profile-form-row` pattern — label above input, fintech focus rings |
| Photos | `2/6` counter | `2 of 6 added`; rounded thumbnails with light shadow |
| Accordion hints | Photos only | All sections show status (Added / Not added / N selected) |

**Reference alignment:** Kuda / Moniepoint / Apple Settings — calm hierarchy, breathing room, premium inputs.

---

## Settings placement

- **Removed** Settings link from main Profile overview (was beside Edit Profile).
- **Added** secondary Settings control inside Edit Profile — top-right gear + “Settings” text (`profile-settings-gear`).
- Settings back navigation returns to **Edit Profile**, not overview.

---

## Edit Profile button placement

- **Removed** from hero/header area on overview.
- **Placed** after Profile highlights as a full-width primary CTA (`profile-edit-cta`).
- Order: Hero → Identity strip → About → Interests → Interested in → Voice greeting → Profile highlights → **Edit Profile** → Log out.

---

## Section renames & copy (edit)

| Old | New |
|-----|-----|
| Basic info | **About** |
| Looking for (gender prefs) | **Open to** |
| Looking for (intents) | **Interested in** |
| Voice intro | **Voice greeting** |

**About** layout uses grouped rows: Name, Age, Gender, Location (state/city), Open to.

---

## Why / Profile Highlights fix

| Context | Title | Content |
|---------|-------|---------|
| Own profile | **Profile highlights** | Human copy (“5 interests added”, “Clear relationship intent”, “Based in Badagry”) |
| Other user | **Why this profile** | Unchanged (`WhyThisProfile` default title) |

Bottom compatibility line replaced with **chip row** (Relationship · City · Flexible matching) via `getOwnProfileChips()`.

---

## Mobile QA notes (320–414px)

- Identity strip wraps chips without horizontal overflow.
- City spotlight member row scrolls horizontally (landing) — no vertical grid stacking.
- Edit accordions use full-width rows; save bar fixed above bottom nav with safe-area padding.
- Settings gear remains tappable (44px+ touch target with padding).
- No completion percentages shown on profile UI.

---

## Files touched

- `src/pages/ProfilePage.tsx`
- `src/components/ProfileIdentityStrip.tsx` (new)
- `src/components/ProfileCoverHeader.tsx` (`coverOnly` hero)
- `src/utils/profileHighlights.ts`
- `src/utils/profileCompatSummary.ts`
- `src/styles/member-pages.css`

---

## Remaining recommendations

1. **StateCitySelect** — style selects inside `profile-form-row--location` to match row inputs (shared border-radius).
2. **Voice greeting** — optional waveform preview on overview when recorded.
3. **Profile strength** — keep admin-only; if surfacing completion, use “Almost complete” text only (no %).
4. **Dark mode pass** — verify chip contrast on OLED black backgrounds.
5. **Settings from overview** — if users miss gear, add one-line hint under Edit Profile CTA (“Settings inside Edit Profile”).

---

## Build

`npm run build` — **passed** (June 15, 2026).
