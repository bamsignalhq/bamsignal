# Hero Image Replacement Report

**Date:** 2026-06-15  
**Sprint:** BamSignal homepage hero optimization + replacement  
**Status:** Complete — production build passes

---

## Summary

The two new Lagos young-professionals hero photographs were converted from PNG to high-quality WebP, placed first in the homepage carousel, and wired for performance (preload, eager LCP image, lazy subsequent slides, intrinsic dimensions for CLS). PNG originals were removed from `public/showcase/`; no production code references PNG paths.

---

## 1. Image optimization

### Conversion pipeline

| Setting | Value |
|--------|--------|
| Tool | `sharp` via `scripts/convert-showcase-images.mjs` |
| Format | WebP |
| Quality | 85 |
| Max width | 1920px (no upscale) |
| Options | `effort: 6`, `smartSubsample: true` |

### File sizes

| Asset | Original (PNG) | WebP | Dimensions | Compression |
|-------|----------------|------|------------|-------------|
| `hero-lagos-young-professionals-01` | ~1.92 MB | **91.4 KB** (93,620 B) | 1086×1448 | **~95.1% smaller** |
| `hero-lagos-young-professionals-02` | ~2.16 MB | **141.7 KB** (145,074 B) | 1086×1448 | **~93.3% smaller** |

Both outputs are **under the 300 KB target** and well under the 500 KB maximum.

### Quality notes

- Portrait aspect ratio preserved; faces remain in frame with `object-fit: cover` and `object-position: center 22%` (desktop: `center 18%`).
- WebP quality 85 retains skin tones, lighting, and facial detail at these dimensions.
- PNG sources deleted after successful conversion (script default).

### Output paths

```
public/showcase/hero-lagos-young-professionals-01.webp
public/showcase/hero-lagos-young-professionals-02.webp
public/showcase/hero-lagos-young-professionals-03.webp  (existing, unchanged)
```

---

## 2. Homepage hero replacement

### Carousel order (`HERO_SLIDES`)

| Position | Image | Role |
|----------|-------|------|
| 1 | `hero-lagos-young-professionals-01.webp` | Primary hero (LCP) |
| 2 | `hero-lagos-young-professionals-02.webp` | Second slide |
| 3 | `hero-lagos-young-professionals-03.webp` | Third slide |

Other showcase moment sets (`suyaChill`, `beachDay`, `lagosRooftop`, etc.) remain in city/profile sections and are **not** in the hero carousel.

---

## 3. Components & files updated

| File | Change |
|------|--------|
| `src/constants/showcase.ts` | `HERO_IMAGES.main` → hero-01; `panels[0]` → hero-02, `panels[1]` → hero-03 |
| `src/data/visualLanding.ts` | `HERO_STACK.accents` now use `HERO_IMAGES.panels` (hero-02, hero-03) instead of moment-set photos |
| `src/components/visual/VisualHero.tsx` | Slide 0: `loading="eager"`, `fetchPriority="high"`, `width`/`height` 1086×1448; slides 1+: lazy |
| `src/components/ShowcaseImage.tsx` | Added optional `fetchPriority`, `width`, `height` props |
| `index.html` | Preloads `hero-lagos-young-professionals-01.webp` (`as="image"`, `type="image/webp"`) |
| `src/styles/visual-home.css` | Existing hero layout: fixed slide `min-height`, `object-fit: cover`, `object-position` (no change required) |

### Related references (unchanged, already WebP)

- `src/constants/demoAccounts.ts` — demo photo uses hero-01.webp
- `scripts/verify-database.mjs` — seed photo uses hero-01.webp

---

## 4. PNG reference audit

Full-repo search for `hero-lagos-young-professionals-01.png` and `hero-lagos-young-professionals-02.png`: **zero matches**.

No PNG hero files remain in `public/showcase/`.

---

## 5. Loading strategy

| Slide | `loading` | `fetchPriority` | Preload |
|-------|-----------|-----------------|---------|
| Hero 01 | `eager` | `high` | Yes (`index.html`) |
| Hero 02+ | `lazy` | default | No |

**CLS mitigation:**

- Hero slides use `min-height: min(92dvh, 820px)` (responsive breakpoints adjust).
- First hero `<img>` includes intrinsic `width={1086}` `height={1448}` so the browser reserves aspect ratio before decode.

---

## 6. Responsive display verification

### CSS behavior

```css
.visual-hero__slide img {
  object-fit: cover;
  object-position: center 22%;  /* mobile/tablet */
}
@media (min-width: 1024px) {
  object-position: center 18%;  /* desktop — slightly higher crop for faces */
}
```

### Expected results

| Viewport | Behavior |
|----------|----------|
| **Mobile** | Full-bleed cover; faces centered slightly above middle; no stretch (uniform scale via `cover`) |
| **Tablet** | Same as mobile; dots/copy overlay unchanged |
| **Desktop** | Slightly higher focal point (`18%`); copy max-width constrained |

**Manual QA recommended after deploy:** confirm no face clipping on smallest target device (e.g. iPhone SE width) and largest desktop hero height.

---

## 7. Performance check

### Production build (`npm run build`)

```
✓ built in ~3.6s
dist/index.html          2.02 kB │ gzip:  0.80 kB
dist/assets/index-*.css  182.00 kB │ gzip: 31.88 kB
dist/assets/index-*.js   310.79 kB │ gzip: 88.18 kB
```

- No broken image references in build output.
- Hero assets are static files under `public/showcase/` — **no JS bundle size increase**.
- Sitemap generation: 33 URLs, no errors.
- TypeScript compile: clean.

### Asset delivery

| File | Size on disk |
|------|----------------|
| hero-01.webp | 91.4 KB |
| hero-02.webp | 141.7 KB |
| hero-03.webp | 200.7 KB |

**Total hero carousel payload (all three):** ~434 KB if all slides load; only slide 1 loads on first paint (eager + preload).

---

## 8. Remaining recommendations

1. **Deploy** — Push to `main` so Coolify rebuilds and serves the new WebP files on https://bamsignal.com.
2. **Visual QA on production** — Spot-check carousel on real mobile/tablet/desktop after deploy; tweak `object-position` per slide if a specific photo needs a different focal point (e.g. `center 28%` for hero-02 only).
3. **Optional: per-slide `object-position`** — If one portrait crops awkwardly, add a `focalY` field to `HERO_SLIDES` and apply inline `style={{ objectPosition: ... }}` instead of a single global CSS rule.
4. **Optional: re-encode hero-03** — At 200.7 KB it is larger than hero-01/02; re-run the convert script if a higher-quality source PNG is available.
5. **Optional: `srcset`** — Not required at 1086px width for current layout; reconsider if full-width 4K hero backgrounds are added later.

---

## Goal status

The first thing users see on the BamSignal homepage is now the new Lagos young-professionals imagery — **optimized (~95% smaller than PNG)**, **fast (preload + eager LCP)**, and **visually unified** with the existing hero carousel and design system.
