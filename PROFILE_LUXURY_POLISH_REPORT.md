# Profile Luxury Polish Report

**Date:** June 15, 2026  
**Goal:** Move profile from “clean” to **premium social product** — language, hierarchy, emotional presentation. No new features.

---

## Copy improvements

| Old label | New label |
|-----------|-----------|
| Looking for | **Interested in** (intents) / **Open to** (gender preference in About) |
| Voice intro | **Voice greeting** |
| Basic info | **About** |
| Why this profile (own) | **Profile highlights** |

---

## Profile completion

- No visible **67% / 85% / 92%** on Me / Profile screens.
- Completion logic remains in `profileStrength.ts` for discover ranking only.
- If completion is surfaced later, prefer **“Profile complete”** or **“Almost complete”** — never raw percentages.

---

## Empty states (human prompts)

| Section | Empty copy |
|---------|------------|
| About | “Tell people a little about yourself.” |
| Interests | “Choose a few interests.” |
| Interested in | “Share what you’re open to.” |
| Voice greeting | “Add a short voice greeting.” |

Edit placeholders mirror the same tone (e.g. bio placeholder).

---

## Identity strip

New `ProfileIdentityStrip` directly below hero:

- Name (primary)
- Age · City (muted meta line)
- Verification badge when applicable
- Intent chips (up to 2)
- Lifestyle / interest chips (up to 3)

**No card, border, or box** — chips only on page background.

Hero (`ProfileCoverHeader` with `coverOnly`) shows cover + avatar only; identity lives in the strip.

---

## Profile order (overview)

1. Hero (cover + avatar)
2. Identity strip
3. About (bio)
4. Interests
5. Interested in
6. Voice greeting (always visible — player or empty prompt)
7. Profile highlights + chips
8. Edit Profile (primary CTA)
9. Log out (footer)

---

## Profile highlights content

Polished checklist language for own profile:

- “5 interests added” (not “5 interests listed”)
- “Clear relationship intent”
- “Thoughtful bio”
- “Based in {city}”
- “Voice greeting added” when applicable

Footer chips: intent label · city · Flexible/Strict matching.

---

## City spotlight (landing luxury)

**Featured Members Everywhere** section:

- Horizontal **right-to-left scroll** member carousel (no vertical grid).
- **Hot** eyebrow + promo CTA (“Get featured · ₦500 / 24h”).
- Hot badge on paid placements (`hot`, `spotlight`, `boost`).
- Ties to existing `city-spotlight` monetization product.

---

## Emotional / premium cues

- Softer page tint behind profile content.
- Section titles: small caps, muted — content carries weight.
- Edit Profile button: full-width primary, calm placement (not floating over hero).
- Settings: secondary gear — editing stays the hero action.

---

## Files touched

- `src/pages/ProfilePage.tsx`
- `src/components/ProfileIdentityStrip.tsx`
- `src/components/ProfileCoverHeader.tsx`
- `src/components/visual/CitySpotlightSection.tsx`
- `src/data/homeLanding.ts`
- `src/utils/profileHighlights.ts`
- `src/utils/profileCompatSummary.ts`
- `src/styles/member-pages.css`
- `src/styles/home-landing.css`

---

## Build

`npm run build` — **passed** (June 15, 2026).

---

## Next polish (optional)

- Animate accordion open/close (height + opacity).
- Subtle parallax on hero cover on scroll.
- “Preview as others see you” link from overview footer.
