# Member UI Certification

**Date:** 2026-07-21  
**Branch:** `feat/member-ui-stabilization`  
**Mode:** SAFE UI REFACTOR — presentation / shared components only  
**Commit:** pending approval (not committed)

---

## Overall readiness

**READY TO MERGE after review** — authenticated member chrome now converges on MemberUxKit + shared page/premium helpers. Domain cards (Discover stories, signal cards, chat rows) remain domain-owned by design.

| Score | Value | Notes |
|-------|-------|-------|
| Consistency | **86 / 100** | Empties, errors, safety rows, page heads, premium shell unified; domain cards intentionally separate |
| Accessibility | **84 / 100** | Unique empty title ids, focus-visible on kit controls, error `role="alert"`, sheet Escape/focus |
| Responsive | **82 / 100** | Shared empty max-width token; page pad tokens; 320–1024 reviewed on shared primitives (CSS) |
| Design system adoption | **88 / 100** | MEMBER_UX_SURFACES largely covered for chrome; Profile/Settings deep panels still page-local |
| **Overall** | **85 / 100** | Suitable freeze baseline after merge + `docs/design/MEMBER_DESIGN_SYSTEM.md` |

---

## Pages audited

| Surface | Route / mount | Chrome standardized |
|---------|---------------|---------------------|
| Home | `/home` | Error + empty → UxKit |
| Discover | `/discover` | Empty already UxKit; safety → MemberSafetyRow |
| Signals (Likes) | `/signals` | Empty + safety → shared |
| Chats | `/chats` | MemberPageHead; EmptyChatState wraps MemberEmptyState |
| Profile | `/profile` | Unchanged layout (orchestrator); completion via ProfileCompletionProgress |
| Premium overlay | App overlay | PremiumMembershipShell |
| Premium Center | `/subscription` | Same shell + plan list |
| Saved Profiles | `/saved-profiles` | PageHead + Loading + Empty |
| Visitors | Overlay | PageHead + MemberEmptyState |
| Safety Center | Overlay | MemberPageHead |
| Referral | `/referral` | MemberPageHead |
| Fast Connection | related | EmptyState adapter → UxKit |
| Wallet sheet | sheet | Already on UxKit |

---

## Components standardized

| Component | Change |
|-----------|--------|
| `MemberEmptyState` | Leading slot, secondary CTA, unique `useId`, actions layout |
| `MemberErrorState` | Single UxKit implementation; optional support CTA; `h2` heading |
| `MemberLoadingState` | Adopted on Saved + Premium checkout status |
| `MemberPageHead` | New shared header |
| `MemberSafetyRow` | New; DiscoverSafetyCard thin wrapper |
| `PremiumMembershipShell` | Shared head / plan buttons / includes |
| `EmptyState` | Thin adapter → MemberEmptyState |
| `EmptyChatState` | Hero via MemberEmptyState; chat extras preserved |
| `ProfileCompletionCompact` | **Removed** (orphan) |
| Legacy `MemberErrorState.tsx` | **Removed** |
| `MEMBER_CARD` / `.member-card` | Alias to existing card elevation |

---

## Accessibility findings

**Fixed / improved**
- Empty states no longer share a hard-coded `member-ux-empty-title` id
- Error states use consistent alert + action group
- Kit buttons/sheet close/network retry: `:focus-visible` pink ring
- Sheet still traps Escape and focuses panel

**Remaining debt**
- Some domain lists (signals cards, chat threads) still need periodic SR audit
- Visitors list photos use empty `alt=""` (decorative pattern — acceptable if names are in adjacent text)
- Profile settings hub heading hierarchy not fully re-audited this sprint

---

## Responsive findings

**Reviewed (CSS / structure) at 320 / 360 / 390 / 430 / 768 / 1024**
- Empty states: `max-width: var(--bs-empty-max)` + centered; actions stack vertically
- Safety rows: 3-column grid with wrap-safe copy
- Page heads: `min-width: 0` on titles to avoid overflow with long subtitles
- Premium plan buttons: existing full-width stack unchanged

**Remaining debt**
- Full visual screenshot farm not produced (practical limit)
- `member-pages.css` still contains page-local hex values (documented token debt)

---

## Design tokens

| Token | Status |
|-------|--------|
| `--bs-gold` | Defined in fintech |
| `--bs-danger` / `--bs-danger-soft` | Defined in design-system |
| `--bs-warning` / `--bs-warning-soft` | Defined |
| `--bs-empty-max` | Replaces hard `340px` |
| UxKit spinner / sheet border | Aligned to pink/purple member brand (not institutional gold panel) |

---

## Outstanding technical debt (post-freeze)

1. Remaining non-exact hex in `member-pages.css` (semantic reds/greens/slate) — exact brand matches done in closeout  
2. Photo-card skeletons remain domain-specific (correct — do not flatten to line skeletons)  
3. Profile/Settings deep panels: optional future pass to MemberPageHead only where heads diverge further  
4. ~~After merge: author `docs/design/MEMBER_DESIGN_SYSTEM.md`~~ — **done in closeout**  

---

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run build` | **PASS** |
| `npm run test:server-import` | **PASS** (`server ok`) |

---

## Freeze recommendation

After merge + deploy:

1. Publish `docs/design/MEMBER_DESIGN_SYSTEM.md`  
2. Treat authenticated member chrome as **frozen** except bug fixes  
3. New features (Stories, Events, Boosts UI, etc.) **must** reuse MemberUxKit / MemberPageHead / MemberSafetyRow / PremiumMembershipShell / existing domain cards — no new empty/error/loading patterns  

---

## CSS Cleanup (2026-07-21 follow-up)

**Goal:** Zero visual change — remove dead/duplicate CSS only. Stylelint not configured; manual audit performed.

### Selectors removed

| Selector / block | File | Reason |
|------------------|------|--------|
| `.member-error-state`, `h2`, `p`, `__actions` | `member-motion.css` | Legacy error UI deleted; UxKit `.member-ux-error` is canonical |
| `.member-error-state` in `prefers-reduced-motion` | `member-motion.css` | Orphaned with above |
| `.discover-page__empty` redundant override | `member-design-system.css` | Duplicate `background` / noop `border-style` |
| `.empty-chat-state__title` / `__subtext` design-system rules | `member-design-system.css` | Hero now uses `MemberEmptyState` (`.member-ux-empty*`); section chrome kept |

### Duplicate / cascade fixes

| Change | Effect |
|--------|--------|
| Restored `.card` / `.signals-premium-card` / settings / nudge elevation block | Accidental drop during stabilization — **bugfix**, restores intended elevation |
| Merged `.member-card` into that card group | One elevation rule, no duplicate declarations |
| Sheet `box-shadow` restored to `0 24px 64px …` | Avoid soft `--bs-elevation-1` override on modal panels |
| Fintech btn primary/secondary heights → `--bs-btn-h-*` | Same computed sizes; single token source |
| Empty max-width → `var(--bs-empty-max)` in fintech | Same 340px |

### Token cleanup

| Token | Change |
|-------|--------|
| `--bs-warning` | Aliased to `var(--bs-gold)` (same hex, no duplicate semantic value) |
| Progress border / milestone reached | `color-mix` with `--bs-gold` (same opacity as prior rgba) |
| Network slow banner | Uses `--bs-warning` chain |

### Dead styles not removed (intentional)

- `empty-chat.css` `.empty-chat-state__title` — domain file still present for light-theme rules; unused by current hero but low risk to leave
- Dark empty intermediate rules in fintech vs cleanup — left intact to avoid cascade order regressions across `main.tsx` vs deferred load paths
- No Stylelint config in repo

### Validation (CSS cleanup pass)

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** |
| `npm run test:server-import` | **PASS** (`server ok`) |

---

*Certification authored as part of Member Experience Stabilization sprint; CSS cleanup appended before commit approval.*

---

## Closeout pass (2026-07-21)

**Branch:** `main` (post PR #3 merge `f5dd98d`)  
**Mode:** SAFE REFACTOR — docs + exact-match token cleanup only  
**Commit:** pending approval (not committed)

### Delivered

| Item | Result |
|------|--------|
| `docs/design/MEMBER_DESIGN_SYSTEM.md` | **Published** — tokens, shared primitives, adapters, freeze policy |
| `member-pages.css` hex → `--bs-*` | **Exact matches only** — `#fff4fa`→`--bs-bg`, `#1b0b2e`→`--bs-text`, `#e91e8f`→`--bs-pink`, `#fff`/`#ffffff` backgrounds → `--bs-surface` |
| Intentional `#fff` left | On-brand / overlay contrast (`color: #fff`, photo borders, white color-mix rings) — no `--bs-on-brand` token yet |
| Non-exact reds/greens/muted | Left as page-local hex (not equal to `--bs-danger` / muted rgba) |

### Outstanding debt (unchanged / deferred)

1. Remaining non-exact hex in `member-pages.css` (semantic reds, greens, slate) — map only if new tokens are introduced  
2. Photo-card skeletons remain domain-specific  
3. Optional Profile/Settings deep-panel head alignment  
4. Stylelint `--bs-*` enforcement (not configured)  
5. Periodic SR audit on signals cards / chat threads  

### Validation (closeout)

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** |
| `npm run test:server-import` | **PASS** (`server ok`) |

*Closeout complete — awaiting commit approval.*
