# Discover Grid Redesign Report

**Date:** June 15, 2026  
**Goal:** Match the supplied Discover reference (3-column grid, compact cards, sponsored rows) while keeping BamSignal signal flow, verification, API, and matching logic unchanged.

---

## Summary

Discover was rebuilt from a **single-card swipe deck** (ProfileCard + Radar + Trending tabs) into a **dense 3-column grid feed** aligned with the reference: Instagram Explore density, Bumble card clarity, Marketplace ad rhythm.

Presentation changed. **Signal action, verification badge, discover/search APIs, and matching/ranking logic were preserved.**

---

## Before vs After

| Area | Before | After |
|------|--------|-------|
| Layout | 1 card at a time, swipe deck | 3-column portrait grid |
| Modes | Signals / Radar / Trending tabs | Single grid feed |
| Card content | Match %, reasons, trust chips, large action bar | Photo, name, age, city, verify badge, Signal |
| Ads | None on Discover | Sponsored banner every 5 rows (15 profiles) |
| Filters | Quick filter chips + separate advanced sheet | Search + Age / Location / Advanced toolbar |
| Pagination | Pass-to-advance (`passedIds`) | 60-profile batches + View More + scroll sentinel |
| Performance | Single card render | Lazy images, batched render, IntersectionObserver load-more |

---

## Grid Structure

- **Columns:** 3 (`discover-feed-grid`)
- **Batch size:** 60 profiles (`HOME_FEED_PROFILE_COUNT`)
- **Ad rhythm:** After every 5 rows = 15 profiles (`HOME_FEED_PROFILES_PER_BLOCK`)
- **Max ad slots:** 3 per batch (rows 5, 10, 15)
- **Spacing:** 8px gap, 12px card radius
- **Theme:** Dark cards on app background; brand gradient on section title

### Row pattern (per 60 profiles)

```
Rows 1–5   → 15 profiles
Ad slot 1
Rows 6–10  → 15 profiles
Ad slot 2
Rows 11–15 → 15 profiles
Ad slot 3
Rows 16–20 → 15 profiles
```

---

## Profile Card

**Component:** `src/components/discover/DiscoverFeedCard.tsx`  
**Shared with Home:** `HomeFeedCard` re-exports the same card.

### Visible content only

- Profile photo (~80% visual height via `aspect-ratio: 3 / 3.75`)
- Name + age (bottom gradient overlay)
- City with pin icon
- Verification badge (top-right on photo)
- Signal button (compact, Send icon)

### Removed from grid cards

- Match %
- Reason / trust / compatibility chips
- Activity dots, photo count badges
- Biography, interests
- Large multi-action bars
- Ignore / priority on card face (still available in profile detail sheet)

### Interaction

- Tap photo → `ProfileDetailSheet`
- Tap Signal → `sendSignalRemote` + daily limit gate
- Hover: `scale(1.02)` + soft shadow (`prefers-reduced-motion` respected)

---

## Top Area

**Page:** `src/pages/DiscoverPage.tsx`

1. Greeting — `{greetingForHour()}, {firstName} 👋`
2. **Toolbar** — `DiscoverFeedToolbar`
   - Full-width search: “Find people”
   - Filter chips: Age range, Location, Advanced Filters
3. **Section header** — inside `DiscoverGridFeed`
   - “Signals Near You” (brand gradient title)
   - “People around you looking for something real.”
   - “View all” link

Age and Location open bottom sheets; Advanced opens `HomeAdvancedFiltersSheet`.

---

## View More / Infinite Scroll

- Initial render: **60 profiles**
- **View More Signals Near You →** loads +60
- **IntersectionObserver** sentinel auto-loads next batch when scrolling near bottom
- Footer copy: “Showing N of many amazing people near you”

No full list virtualization library added; batching limits DOM nodes (typically ≤60–120 visible per session).

---

## Ads & Monetization

**Component:** Reuses `HomeSponsoredBanner` inside grid (full-width row).

- Label: **Sponsored**
- Admin-configured slots via `fetchHomeFeedAds()` / `AdminHomeFeedAdsPanel`
- Renders only when slot enabled + image URL set
- CSS: `.discover-feed-grid .home-feed-ad { grid-column: 1 / -1 }`

**Prepared for future:**

- Google AdSense (empty slot hook / full-width row pattern)
- Direct sponsors (admin image + link)
- City Spotlight / boosted profiles (existing boost backend; grid insertion point documented)

---

## API & Matching (unchanged)

Discover still loads via:

1. `searchMemberProfiles` (primary, limit 96, advanced filters)
2. `fetchDiscoverProfiles` (fallback if &lt; 60 results)

Client pipeline:

```
filterDiscoverDeck → buildDensityAwareDeck → applyDiscoverPreferences → rankProfiles → name filter
```

Signal limits use `evaluateSignalGate` (same as Home). Session is not cleared on cancel/failure.

---

## Files Changed / Added

### New

| File | Purpose |
|------|---------|
| `src/components/discover/DiscoverFeedCard.tsx` | Minimal grid card |
| `src/components/discover/DiscoverGridFeed.tsx` | Grid, ads, signals, detail sheet |
| `src/components/discover/DiscoverFeedToolbar.tsx` | Search + filter chips |
| `src/styles/discover-grid.css` | Grid, card, toolbar, sheets |
| `DISCOVER_GRID_REDESIGN_REPORT.md` | This report |

### Modified

| File | Change |
|------|--------|
| `src/pages/DiscoverPage.tsx` | Full grid orchestration |
| `src/components/home/HomeFeedCard.tsx` | Re-exports `DiscoverFeedCard` |
| `src/components/home/HomeSignalsFeed.tsx` | Uses shared grid CSS classes |
| `src/main.tsx` | Imports `discover-grid.css` |

### Retained but unused on Discover tab

Swipe deck components remain in repo for reference (`ProfileCard`, `SignalRadar`, `DiscoverTrending`, etc.) but are no longer mounted on Discover.

---

## Performance Notes

| Technique | Implementation |
|-----------|------------------|
| Lazy images | `loading="lazy"` on `ShowcaseImage` |
| Batched DOM | `displayLimit` slices profile array |
| Auto load-more | `IntersectionObserver` on sentinel |
| Skeleton | 9-card shimmer while fetching |

---

## Visual Reference Alignment

| Reference element | Implementation |
|-------------------|----------------|
| 3-column grid | ✓ `grid-template-columns: repeat(3, 1fr)` |
| Portrait cards | ✓ `aspect-ratio: 3 / 3.75` |
| Bottom name/age/city overlay | ✓ Gradient overlay on photo |
| Verify badge top-right | ✓ Absolute positioned |
| Signal CTA on card | ✓ Full-width button under photo |
| Sponsored every 5 rows | ✓ `buildHomeFeedGridItems` |
| Search + Age/Location/Advanced | ✓ Toolbar chips |
| Signals Near You header | ✓ Section header + View all |
| View More after batch | ✓ Button + infinite sentinel |
| Dark premium feel | ✓ Dark theme tokens + subtle borders |

---

## QA Checklist

- [ ] Discover tab loads 3-column grid
- [ ] Cards show only photo, name, age, city, badge, Signal
- [ ] Signal sends and respects daily limit
- [ ] Tap card opens profile sheet (detail can show more info)
- [ ] Search filters by name client-side
- [ ] Age / Location / Advanced filters refresh feed
- [ ] Sponsored row appears after every 15 profiles when admin ad enabled
- [ ] View More loads next 60
- [ ] Scroll near bottom auto-loads batch
- [ ] Home tab grid still renders with same card styling

---

## Build

```bash
npm run build
```

Verified: TypeScript + Vite production build passes after redesign.
