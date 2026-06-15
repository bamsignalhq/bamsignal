# BamSignal Final Pre-Launch UX Review

**Date:** June 2026  
**Standard:** Ship only **A-level** consumer experiences (Hinge / Bumble / Moniepoint / Kuda bar).

---

## Grade key

| Grade | Meaning |
|-------|---------|
| **A** | Premium consumer quality — ship as-is |
| **B** | Usable but still feels “product” not “app” — polish before marketing push |
| **C** | Admin / engine-room energy — hide, cut, or redesign |

---

## Area rankings

### Home — **A**

| Before | After |
|--------|-------|
| Greeting + discover + activity + verify banner + premium card | **4 sections max:** Greeting → Activity summary → Discover CTA → Signal Pass |

- Removed verification banner (trust moved to Account)
- Removed marketing subcopy on discover tile
- Activity always visible as compact fintech row

---

### Profile overview — **A**

| Section | Status |
|---------|--------|
| About | Kept |
| Interests | Kept |
| Looking for | Kept (renamed from “Interested in”) |
| Voice intro | Kept |

- Removed “Why this profile” / highlights / compatibility chips
- Removed admirers block from overview (reduces self-analysis noise)
- Identity strip simplified to name, age, city, verification only

---

### Profile edit — **B**

- Accordion edit flow is clean but still dense for first-time editors
- **Ship:** yes for launch; iterate post-launch with progressive disclosure

---

### Settings — **A**

Hub reduced to four items:

1. Preferences  
2. Privacy (visibility + **Safety controls** collapsed under “advanced”)  
3. Notifications  
4. Account (verification, Signal Pass, theme, logout)

- Removed standalone Safety and Payments rows from hub
- Advanced safety tools remain available, not promoted

---

### Discover — **A**

| Change | Impact |
|--------|--------|
| Taller photo (up to ~72vh) | Swipe confidence |
| Removed match %, reason chips, trust strip on card | Less reading |
| Verification badge only | Cleaner badges |
| Pass / Signal use `btn-secondary` / `btn-primary` | Consistent buttons |

- Discover remains the hero product surface

---

### Signal Pass (Premium) — **A**

Structure locked:

```
Signal Pass → Plan selector → Included (4 bullets) → Upgrade Now
```

No marketing paragraphs. No duplicate benefit lists.

---

### Messages / Likes empty states — **A**

| Screen | Copy |
|--------|------|
| Likes | “No signals yet” → “Discover people nearby” |
| Messages | “No conversations yet” → “Start your first conversation.” |
| Discover | Short titles, one action |

---

### Trust & safety — **B → A-**

| Removed from daily path | Kept in tools |
|-------------------------|---------------|
| Chat safety banners | Report / block in overflow |
| Home verify nudge | Account → Verify |
| Match coaching in chat | Privacy → Safety controls |

- Trust is quieter; tools still exist

---

### Onboarding — **B**

- DOB, photos, preferences flow is strong
- Preference step still long — acceptable for launch, monitor drop-off

---

### Admin / blog / legal — **C** (intentionally)

- Not member-facing core loop
- No changes required for consumer launch

---

## Marketing copy purge

Removed or avoided in member app:

- “Premium that feels intentional”
- “Built for real connections”
- “Upgrade your signal” (home hero)
- Profile self-scoring / “Why this profile”
- Chat coaching blocks

---

## Button system

| Type | Usage |
|------|--------|
| `btn-primary` | Send Signal, Upgrade Now, Open Discover, main CTAs |
| `btn-secondary` | Pass, Verify, View plans (secondary paths) |
| `btn-danger` / report | Report, block (menus) |

Discover card actions now use the shared button classes.

---

## Launch recommendation

| Ship | Area |
|------|------|
| Yes | Home, Profile overview, Settings hub, Discover cards, Signal Pass, Empty states |
| Monitor | Onboarding length, edit-profile density |
| Defer | Admin surfaces, blog tone, deep preference analytics |

**Target met:** A first-time user can understand BamSignal in **~10 seconds** — greet, see activity, open Discover, optional upgrade.

---

## Files touched (this sprint)

- `src/pages/HomePage.tsx`
- `src/components/dashboard/*`
- `src/pages/ProfilePage.tsx`
- `src/components/ProfileIdentityStrip.tsx`
- `src/components/ProfileCard.tsx`
- `src/components/EmptyState.tsx`
- `src/pages/ChatsPage.tsx`, `LikesPage.tsx`, `DiscoverPage.tsx`
- `src/styles/dashboard.css`, `discover-v2.css`, `launch.css`, `member-pages.css`
