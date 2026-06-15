# Signal Pass Fintech Cleanup Report

**Date:** June 2026  
**Goal:** Premium subscriptions page that feels calm, intelligent, modern, and trustworthy — aligned with Moniepoint, Kuda, Revolut, and Apple subscriptions.

---

## Summary

Signal Pass upgrade surfaces were simplified from a marketing-heavy, multi-card layout into a single-screen fintech flow: title → plan picker → four included benefits → one CTA.

---

## Removed

| Item | Reason |
|------|--------|
| “Premium that feels intentional” headline | Marketing copy; replaced with **Signal Pass** |
| “Unlock visibility, intelligence, and control…” | Unnecessary explanation |
| “Upgrade your signal” hero card | Duplicate CTA and filler |
| “Like the best fintech apps…” subcopy | Meta marketing language |
| 7-item benefit wall (emoji cards) | Too noisy; merged into 4 bullets |
| Priority Placement / Priority Signals / Better Discover Ranking | Same value → **Priority Visibility** |
| Read Receipts (standalone bullet) | Cut to stay at 4 items max |
| `PREMIUM_FEATURES` fineprint list | Duplicated plan benefits |
| Per-plan instant purchase buttons | Replaced with select-then-upgrade pattern |
| Sparkles / Crown / Zap decorative icons on upgrade | Reduced visual noise |

---

## New page structure

```
Signal Pass
Choose a plan
    ↓
[ Weekly      ₦1,499   7 days    ]
[ Monthly     ₦3,999   30 days   Recommended ]
[ 3 Months    ₦10,999  90 days   Best Value ]
    ↓
Included with Signal Pass
✓ Unlimited Signals
✓ See Profile Visitors
✓ Advanced Filters
✓ Priority Visibility
    ↓
[ Upgrade Now ]
```

Active subscribers see a minimal **Active** status strip only.

---

## Plan presentation

| Plan | Price | Duration | Badge |
|------|-------|----------|-------|
| Weekly | ₦1,499 | 7 days | — |
| Monthly | ₦3,999 | 30 days | Recommended |
| 3 Months | ₦10,999 | 90 days | Best Value |

- Horizontal row cards (label + duration left, price + badge right)
- Selected state: subtle border highlight, no heavy shadows
- Default selection: **Monthly**

---

## Files changed

| File | Change |
|------|--------|
| `src/pages/PremiumPage.tsx` | Full fintech layout rewrite |
| `src/components/PaywallModal.tsx` | Matched Premium page pattern |
| `src/components/PricingModal.tsx` | Matched Signal Pass section (boosts remain below) |
| `src/constants/plans.ts` | `SIGNAL_PASS_INCLUDES`, plan badges, `planShortLabel()` |
| `src/styles/member-pages.css` | Fintech plan strip + includes styles |

---

## UX principles applied

1. **Pricing in under 3 seconds** — plans visible without scrolling on typical phones  
2. **One primary action** — single **Upgrade Now** after plan selection  
3. **No overselling** — product name only; benefits as short checklist  
4. **Consistent surfaces** — Premium page, paywall modal, and pricing modal share the same components/classes  

---

## Active subscriber state

Users with Signal Pass see:

- **Active** label  
- “Signal Pass is on your account.”  

No plan picker or upgrade CTA shown.

---

## Follow-ups (optional)

- Persist selected plan in URL/query for return-from-checkout  
- Server-driven badge copy via admin pricing (already supported via `highlight` field)  
- A/B test “Continue” vs “Upgrade Now” on CTA label  
