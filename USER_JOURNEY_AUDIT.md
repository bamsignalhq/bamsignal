# User Journey Audit

**Audit date:** 14 June 2026

---

## 1. Landing (guest)

**Path:** `/` → `LandingPage`

| Step | Experience | Issues |
|------|------------|--------|
| Hero + CTA | Join / explore signals | ✓ Mature copy |
| Pulse bar | Stats + marquee | **Fixed:** no fake live city events; product truths |
| Social proof | Hidden until admin enables | ✓ Honest empty state when enabled |
| Premium teaser | Opens pricing modal | ✓ |
| Footer legal links | All resolve | ✓ |

**Blocker:** Pulse bar still implies "community activity" via rotating marquee — now product education, not fake signals.

---

## 2. Signup

**Path:** `/love/sign` → `AuthPage` → Supabase

| Step | Experience | Issues |
|------|------------|--------|
| Email / phone / username | Validation | ✓ |
| Referral `?ref=` | Analytics event only | **Blocker:** no reward credit |
| Post-signup | Onboarding gate | ✓ |
| Optional 24h trial | Admin toggle | ✓ |

---

## 3. Onboarding

**Path:** Full-screen `OnboardingPage`

| Step | Experience | Issues |
|------|------------|--------|
| Name, photo, city, bio | Required fields | ✓ |
| Voice intro | Optional | ✓ |
| Complete | → Discover tab | ✓ |
| First-day checklist | Home after onboarding | ✓ |

---

## 4. Discover

**Path:** Bottom nav → `DiscoverPage`

| Step | Experience | Issues |
|------|------------|--------|
| Deck | Swipe / signal | **Critical:** `MOCK_PROFILES` only |
| Filters | Premium gates advanced | ✓ |
| City density messaging | Low-density copy | ✓ |
| Boost CTAs | Paystack | ✓ (env required) |
| Why this profile | Compatibility UI | ✓ (mock data) |

**Blocker:** Real users cannot discover real members.

---

## 5. Signal (likes)

**Path:** Send signal → `LikesPage` incoming

| Step | Experience | Issues |
|------|------------|--------|
| Outbound signal | Stored locally | No server match notification to other user |
| Incoming likes | `likedBy` storage + mock seeds | Mixed mock/real |
| Accept → match | Creates match locally | ✓ for demo |
| Premium blur | Upsell | ✓ |

---

## 6. Chat

**Path:** `ChatsPage`

| Step | Experience | Issues |
|------|------------|--------|
| Thread list | From matches | ✓ |
| Messaging | Limits + paywall | ✓ |
| Contact blocking | Off-platform education | ✓ |
| Safety notice | Inline tip | **Fixed:** removed "coming soon" |
| Report / block | Modal | ✓ |

---

## 7. Premium

**Path:** Pricing modal, `PremiumPage`, profile upgrade

| Step | Experience | Issues |
|------|------------|--------|
| Plan selection | Weekly / monthly / quarterly | ✓ |
| Paystack | Redirect flow | See Payment audit |
| Feature unlock | localStorage + trial | Sync risk |
| Visitors page | Premium gate | ✓ |

---

## 8. Referral

**Path:** Home `ReferralCard`

| Step | Experience | Issues |
|------|------------|--------|
| Share link | `?ref=CODE` | ✓ |
| Progress UI | 3 referrals → reward | **Blocker:** success never recorded |
| Notification | `referral_reward` template exists | Never fires |

---

## 9. Return visit

**Path:** Authed → Home

| Step | Experience | Issues |
|------|------------|--------|
| Streak banner | Daily activity | ✓ |
| Activity feed | Local events | ✓ |
| Return triggers component | **Not mounted** | Missed re-engagement UI (dead code) |
| Notifications | Bell center | ✓ |
| Session restore | Supabase | ✓ |

---

## Journey scorecard

| Stage | Ready? | Notes |
|-------|--------|-------|
| Landing | Yes | Copy cleaned |
| Signup | Mostly | Referral broken |
| Onboarding | Yes | |
| Discover | **No** | Mock profiles |
| Signal / match | Partial | Local-only |
| Chat | Yes | |
| Premium | Mostly | Env + sync |
| Referral | **No** | Rewards never grant |
| Return | Mostly | ReturnTriggers unused |

---

## Top journey blockers

1. Mock discover deck
2. Referral reward pipeline disconnected
3. No server-side signal delivery between real users
4. Premium state desync on new device

---

*End-to-end real-user dating loop requires live member graph; current build is strong for demo / soft launch in seeded cities only.*
