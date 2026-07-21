# BamSignal Member Design System

**Status:** FROZEN (authenticated chrome)  
**Effective:** 2026-07-21 (post PR #3 stabilization + closeout)  
**Scope:** Logged-in member experience only — not public SEO pages or admin/institutional UI

The member app uses a compact Nigerian fintech visual language (Moniepoint / Kuda / PalmPay / PiggyVest — not loud or amateur). Authenticated chrome is **frozen** except bug fixes, a11y/responsive fixes in the same language, and new features that **reuse** these primitives.

Related locks: `.cursor/rules/member-ui-freeze.mdc`, [PLATFORM_FREEZE.md](../engineering/PLATFORM_FREEZE.md), [audit/MEMBER_UI_CERTIFICATION.md](../../audit/MEMBER_UI_CERTIFICATION.md).

---

## Token source of truth

All member tokens live under `.platform-root--member` as `--bs-*` variables.

| Layer | File | Role |
|-------|------|------|
| Core brand + page shell | `src/styles/member-fintech.css` | `--bs-bg`, `--bs-surface`, `--bs-text`, `--bs-muted`, `--bs-border`, `--bs-pink`, `--bs-purple`, `--bs-gold`, radii, page pad, shadows |
| Unification / chrome | `src/styles/member-design-system.css` | Button heights, type scale, `--bs-empty-max`, `--bs-danger` / `--bs-warning`, elevation, shared page heads |
| UxKit surfaces | `src/styles/member-ux-kit.css` | Empty / error / loading / sheet / network banners |
| Page-local | `src/styles/member-pages.css` | Domain layout only — prefer `--bs-*`; do not invent parallel palettes |

**Do not** introduce a second spacing or color system. New UI must inherit existing tokens.

### Canonical color tokens

| Token | Meaning |
|-------|---------|
| `--bs-bg` | Page background |
| `--bs-surface` | Cards / elevated surfaces |
| `--bs-text` | Primary copy |
| `--bs-muted` | Secondary copy |
| `--bs-border` | Dividers / hairlines |
| `--bs-pink` / `--bs-purple` | Brand accents |
| `--bs-gold` | Premium / warning accent (warning aliases gold) |
| `--bs-danger` / `--bs-danger-soft` | Error chrome |
| `--bs-empty-max` | Empty-state max width (340px) |

Button class constants: `MEMBER_BUTTON_*` and `MEMBER_CARD` in `src/constants/uxDesignSystem.ts`.

---

## Shared primitives (required for chrome)

Import from `src/components/member` (and premium shell from `src/components/premium`).

| Primitive | Use when |
|-----------|----------|
| `MemberEmptyState` | Any empty list / feed / overlay with title + body + optional CTA |
| `MemberErrorState` | Load/action failures with retry (optional support CTA) |
| `MemberLoadingState` | Full-block status loading (not photo-card skeletons) |
| `MemberSkeleton` | Line/block placeholders inside UxKit patterns |
| `MemberSheet` | Member bottom sheets / modal panels |
| `MemberOfflineBanner` / `MemberSlowConnectionBanner` | Network awareness |
| `MemberPageHead` | Authenticated page headers (title, subtitle, back, trailing) |
| `MemberSafetyRow` | Compact privacy/safety row (Discover + Signals variants) |
| `ProfileCompletionProgress` | Profile completion meter (not a second compact orphan) |
| `PremiumMembershipHead` / `PremiumPlanButtonList` / includes helpers | Discover Membership overlay + `/subscription` |

Surfaces listed in `MEMBER_UX_SURFACES` (`uxDesignSystem.ts`) must not invent new empty/error/loading patterns.

### Adapters (thin wrappers only)

| Adapter | Rule |
|---------|------|
| `EmptyState` (`src/components/EmptyState.tsx`) | Delegates to `MemberEmptyState` — keep for call-site convenience |
| `EmptyChatState` | Hero via `MemberEmptyState`; chat-only extras (suggested profiles, toast) stay domain-owned |
| `DiscoverSafetyCard` | Thin wrapper around `MemberSafetyRow` `variant="discover"` |

Do **not** add a third empty or error component. Prefer adapters or direct UxKit imports.

---

## Domain-owned (intentionally not flattened)

These stay page/domain-specific — do not force them into line skeletons or generic cards:

- Discover story / profile photo cards and photo-card skeletons
- Incoming signal cards and chat thread rows
- Home feed card chrome beyond empty/error
- Profile settings deep panels (optional future `MemberPageHead` only if heads diverge)

`.member-card` aliases existing `.card` elevation — use `MEMBER_CARD` / `.member-card` rather than new elevation recipes.

---

## Freeze policy for new work

**Allowed without redesign approval**

- Bug fixes, performance, security, stability
- Accessibility and responsive fixes that preserve the same visual language
- Backend / API work that does not change member chrome

**Requires explicit product approval**

- Larger cards, buttons, or typography
- Loud banners, giant blocks, or new spacing systems
- Parallel empty/error/loading/header patterns
- Redesign of Home, Discover, Chats, Signals, Profile, Settings, bottom nav

**New features** (Stories, Events, Boosts UI, etc.) **must**:

1. Reuse MemberUxKit / `MemberPageHead` / `MemberSafetyRow` / premium shell / existing domain cards  
2. Use `--bs-*` tokens from `member-fintech.css` / `member-design-system.css`  
3. Avoid visual changes unless explicitly requested  

---

## Validation before member UI PRs

```bash
npm run lint
npm run typecheck
npm run build
npm run test:server-import
```

Do not commit generated `dist/`, APK/AAB, or unrelated `sw.js` / `buildInfo.ts` churn unless requested.

---

**Member chrome is frozen.** Extend via shared primitives — do not reinvent them.
