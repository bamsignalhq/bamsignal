# Mobile Audit

**Audit date:** 14 June 2026  
**Viewports reviewed:** 320px, 375px, 390px, 414px, 768px (CSS + layout structure review; visual QA recommended in browser)

---

## Layout system

- **Shell:** `platform-shell` max-width ~1400px; member content scrolls inside `app-main`
- **Bottom nav:** Fixed, `safe-area-inset-bottom`, full width — works on notched devices
- **Top nav:** Member nav collapses to icon row on small screens (see `TopNav.tsx` + `styles.css`)

---

## By viewport

### 320px (iPhone SE)

| Area | Status | Notes |
|------|--------|-------|
| Landing hero | OK | `home-landing.css` stacks CTAs; headline wraps |
| Home pulse stats | Watch | Three stat columns may feel tight; values now text not long numbers |
| Bottom nav labels | OK | 0.68rem font; 5 tabs fit with flex |
| Discover card | OK | Swipe stack full width; action buttons in `discover-v2.css` |
| Pricing modal | Risk | Full-screen sheet on mobile; long boost list scrolls inside modal |
| Admin tabs | **Overflow** | Horizontal scroll on `admin-tabs` — usable but cramped |
| Legal pages | OK | `legal-pages.css` `@media (max-width: 480px)` adjusts gallery |

### 375px / 390px / 414px (standard phones)

| Area | Status | Notes |
|------|--------|-------|
| Discover filters drawer | OK | Full-width sheet |
| Chat thread | OK | Bubbles + input; `member-pages.css` ellipsis on names |
| Profile edit | OK | Long form scrolls; photo grid responsive |
| Premium page overlay | OK | Scrollable feature list |
| Visitors blur gate | OK | Premium upsell card centered |

### 768px (tablet / small landscape)

| Area | Status | Notes |
|------|--------|-------|
| Landing sections | OK | Breakpoints at 640/768/1024 expand grids |
| Member shell | OK | `@media (min-width: 768px)` centers modals with radius |
| Discover | OK | Card max-width increases; not desktop-only |
| Admin hub | OK | Stats grid multi-column |

---

## Modals on mobile

| Modal | Issue |
|-------|-------|
| PricingModal | Backdrop full viewport; ensure iOS keyboard doesn't cover CTA when email missing (error is in nav toast area) |
| PaywallModal | Same pattern as pricing |
| ReportBlockModal | `safety.css` `overflow-y: auto` — scrollable |
| NotificationCenter | Sheet from top; verify z-index above bottom nav (z-index 30 nav vs modal backdrop) |
| Onboarding | Full page; no modal trap issues |

**Broken modals:** None identified in code; z-index stack appears consistent.

---

## Overflow / crop risks

1. **Admin tab bar** — many tabs; horizontal scroll only; labels like `Reports (N)` can clip on 320px
2. **Swipe deck action row** — `@media` in `styles.css` shrinks glass buttons at narrow widths — OK
3. **Home city carousel** — `overflow-x: auto` intentional; scrollbar hidden
4. **Chat header long names** — `text-overflow: ellipsis` applied
5. **Discover rotator text** — small 0.75rem; long strings wrap

---

## Touch targets

- Bottom nav items: adequate padding (6px 4px + icon)
- Swipe pass/signal buttons: 64px at narrow breakpoint
- Filter chips: check 44px min on discover — some chips ~36px (minor)

---

## Safe areas

- Bottom nav uses `env(safe-area-inset-bottom)` ✓
- Top nav / status bar: theme-color meta updated in `App.tsx` ✓

---

## Launch blockers (mobile)

1. **Admin on phone** — operational but tab overflow may block moderators on 320px devices without scroll discovery
2. **Paystack redirect** — leaves PWA/fullscreen; return depends on browser session (see Payment audit)

---

## Non-blockers

- Horizontal scroll on marketing carousels (by design)
- `LiveActivityPill` unused (no mobile impact)

---

*Recommend 30-minute device pass on real iOS Safari + Android Chrome before launch.*
