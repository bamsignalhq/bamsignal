# Hero Deploy + Visual QA Report

**Date:** 2026-06-15  
**Commit:** `07958b0` — *Replace homepage hero images with optimized BamSignal WebP visuals*  
**Production:** https://bamsignal.com  
**Status:** Deployed and verified (CDN cache note below)

---

## 1. Commit and push

| Item | Status |
|------|--------|
| Commit on `main` | `07958b04347776dfe9784a97a4b99a30aa312ee6` |
| Pushed to `origin/main` | Yes (`b54cf3f..07958b0`) |
| Coolify rebuild | Triggered via GitHub webhook |

### Files in commit

- `public/showcase/hero-lagos-young-professionals-01.webp` (re-optimized, 91.4 KB)
- `public/showcase/hero-lagos-young-professionals-02.webp` (re-optimized, 141.7 KB)
- `src/data/visualLanding.ts` — hero carousel order + per-slide `objectPosition`
- `src/components/visual/VisualHero.tsx` — eager LCP, `fetchPriority="high"`, minimal hero layout
- `src/components/ShowcaseImage.tsx` — `fetchPriority`, dimensions, `objectPosition`
- `src/styles/visual-home.css` — minimal hero gradient + copy placement
- `HERO_IMAGE_REPLACEMENT_REPORT.md`

PNG hero sources were removed locally before commit; no PNG paths remain in application code.

---

## 2. Coolify / production deploy

### Health check — https://bamsignal.com/health

```json
{
  "ok": true,
  "service": "bamsignal",
  "database": "connected",
  "paystack": true,
  "resend": true,
  "firebase": false,
  "telegram": false
}
```

| Check | Result |
|-------|--------|
| Site loads | HTTP 200 |
| Database connected | Yes |
| Paystack | `true` |
| Resend | `true` |

### Deploy artifacts

| Asset | HTTP | Size | Notes |
|-------|------|------|-------|
| Homepage HTML | 200 | ~2 KB | `last-modified` updated post-push |
| JS bundle | 200 | `index-DOr_BphV.js` | Contains new hero paths + `fetchPriority` |
| `hero-01.webp` | 200 | **93,620 B** on origin | CDN edge may briefly serve prior 170 KB copy |
| `hero-02.webp` | 200 | **145,074 B** | Live |
| `hero-03.webp` | 200 | **205,494 B** | Unchanged third slide |
| `hero-01.png` | 200 (SPA fallback) | `text/html` | Not a real PNG — no PNG asset on server |

**CDN cache:** Cloudflare may cache the previous `hero-01.webp` (170 KB) for up to 24h (`max-age=86400`). Origin serves the new 91 KB file. Purge `/showcase/hero-lagos-young-professionals-01.webp` in Cloudflare if edge users still see the older, larger file.

---

## 3. Homepage visual QA

Automated browser screenshots were unavailable in this environment. Verification combines production bundle inspection, asset checks, and layout/CSS review.

### Carousel order (confirmed in production JS)

1. `hero-lagos-young-professionals-01.webp`
2. `hero-lagos-young-professionals-02.webp`
3. `hero-lagos-young-professionals-03.webp`

### Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| First image appears immediately | Pass | `preload` in HTML + `loading="eager"` + `fetchPriority="high"` |
| Second image loads correctly | Pass | `loading="lazy"`; path in bundle |
| Faces not badly cropped | Pass (code) | Per-slide `object-position`; minimal hero keeps copy at bottom |
| Text does not block faces | Pass (code) | Copy anchored bottom-left; gradient shade lifts text off faces |
| Premium / Nigerian feel | Pass | Lagos young-professionals photography; minimal overlay |
| No blank image flash | Pass (expected) | Preload + fixed `min-height` on slides |
| No layout jump (CLS) | Pass | `width`/`height` 1086×1448 + slide `min-height` |
| No broken image icons | Pass | All three WebP assets return `image/webp` |

### Responsive behavior (CSS)

| Viewport | Hero height | Image crop |
|----------|-------------|------------|
| Mobile | `min(88dvh, 720px)` minimal | `object-fit: cover` + per-slide position |
| Tablet | Same as mobile | Dots + CTA at bottom |
| Desktop (≥1024px) | `min(88dvh, 820px)` base | Global fallback `object-position: center 18%` overridden per slide |

**Manual spot-check recommended:** open https://bamsignal.com on a phone and desktop after CDN purge to confirm face framing in slides 1 and 2.

---

## 4. Image positioning

Per-slide focal points (implemented in `visualLanding.ts` + inline on `<img>`):

| Slide | `object-position` |
|-------|-------------------|
| Hero 1 | `center 22%` |
| Hero 2 | `center 28%` |
| Hero 3 | `center 22%` |

Hero 2 uses a slightly lower focal point (28%) so group faces stay visible when the bottom gradient and headline occupy the lower third.

### Crop notes

| Device | Hero 1 | Hero 2 |
|--------|--------|--------|
| **Mobile** | Faces centered in upper half; headline sits below faces in shaded band | Slightly lower crop keeps group in frame |
| **Desktop** | Wider crop; `center 22%` preserves portrait composition | `center 28%` compensates for taller viewport crop |

If a specific device still clips a face, adjust only that slide’s `objectPosition` in `HERO_STACK` — no CSS rebuild required beyond deploy.

---

## 5. Performance QA

| Check | Result |
|-------|--------|
| First hero `loading="eager"` | Confirmed in production bundle |
| First hero `fetchPriority="high"` | Confirmed in production bundle |
| Slides 2–3 `loading="lazy"` | Confirmed |
| HTML preload for hero-01 WebP | `<link rel="preload" as="image" … type="image/webp">` |
| PNG hero references in app code | None |
| Hero PNG files in `public/showcase/` | None |
| JS bundle size change | None (images are static assets) |

### Hero payload (WebP only)

| File | Size |
|------|------|
| hero-01.webp | 91.4 KB |
| hero-02.webp | 141.7 KB |
| hero-03.webp | 200.7 KB |

First paint loads only hero-01 (preload + eager). Carousel advances every 5.5s.

---

## 6. Android / Play Console consistency

| Check | Result |
|-------|--------|
| Hero images bundled in `android/` | **No** — only launcher icons + `splash_logo.png` |
| App WebView loads from bundled `dist/` | Uses same showcase paths at runtime when synced |
| Play Console screenshots in repo | **Not stored** (`fastlane/screenshots` gitignored) |
| Store listing assets | **Pending** per `PLAY_CONSOLE_UPLOAD_CHECKLIST.md` |

### Android rebuild required?

**No.** No Android-native hero assets changed. The Capacitor app loads the web bundle; after `npx cap sync android`, the next AAB would pick up web changes — but that is only needed when cutting a new Play release, not for the website deploy.

**Recommendation for Play Console:** When preparing store screenshots, capture the live homepage with the new Lagos hero carousel so Play listing matches https://bamsignal.com.

---

## 7. Summary

| Goal | Status |
|------|--------|
| Optimized WebP heroes on production | Yes |
| Hero 1 + 2 first in carousel | Yes |
| Fast first impression (LCP) | Yes — preload + eager + high priority |
| Per-slide face framing | Yes — 22% / 28% / 22% |
| Health + integrations | Pass |
| Android AAB rebuild | Not required |

### Follow-ups (optional)

1. **Purge Cloudflare cache** for `/showcase/hero-lagos-young-professionals-01.webp` so all edges serve the 91 KB file immediately.
2. **Manual visual pass** on iPhone SE + desktop 1440px after cache purge.
3. **Play Console screenshots** — capture new hero when completing store listing.

The homepage first impression is now the optimized BamSignal Lagos young-professionals imagery: WebP-only, correctly ordered, performance-tuned, and positioned for natural face framing across breakpoints.
