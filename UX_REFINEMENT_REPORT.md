# UX Refinement Report

**Sprint goal:** Polish BamSignal into a premium, calm, fintech-quality Nigerian social platform.

**Reference quality:** Moniepoint, Kuda, PalmPay, Hinge, Bumble.

---

## Issues fixed

### 1. State / city system
- **Bug:** Changing state left city stuck (e.g. Lagos/Badagry) due to stale React closures in split `onStateChange` / `onCityChange` handlers.
- **Fix:** Atomic `onLocationChange(state, city)` API on `StateCitySelect`; state change clears city until user picks a new one.
- **Search:** City field is now a searchable combobox with autocomplete suggestions filtered per state.
- **Data:** Expanded `nigeriaLocations.ts` (36 states + FCT) with major cities/LGAs including Lagos, Abuja (FCT), Rivers examples from spec.
- **Discovery:** `metroForCity()` maps LGAs (e.g. Badagry) to parent metros for proximity scoring.

### 2. Onboarding compressed (8 → 4 steps)
| Step | Content |
|------|---------|
| 1 | Name, age, gender, state, city |
| 2 | Bio, intent (max 2), interests |
| 3 | Photos (required + optional extras) |
| 4 | Looking for, religion, lifestyle, age preference |

Removed: Welcome step, Profile Strength step, Ready to Discover step, founding member auto-grant.

### 3. Repetitive copy removed
- Removed “Starting in {city} — the right connection starts with a signal.”
- Removed “We match you locally first.”
- CMS welcome body → **“Meet people who match your vibe.”**
- Onboarding opens with **“Welcome to BamSignal”** + single tagline.

### 4. Photo experience
- Stronger client-side portrait checks: resolution, aspect ratio, center-face heuristic, group-photo spread detection.
- Rejection copy: **“Choose a photo that clearly shows only you.”**
- Cover/hero photos use `object-fit: cover` with `object-position: center 22%` for face-forward presentation.

### 5. Intent selection
- Maximum **2 intents** enforced in onboarding and profile edit.
- **Quickie removed** entirely (intent, discover pool, chat paywall, admin pricing, payment flow).

### 6. Profile strength
- Removed dedicated onboarding step.
- Strength still calculated internally; shown on **dashboard** via `DashboardProfileStrengthCard` only.

### 7. Founding Member removed
- Badge removed from onboarding, profile header, home greeting, and nav.
- No longer auto-granted on signup completion.

### 8. Profile page redesign
- **Overview:** Bio + interest chips only.
- **Edit profile:** Full editable fields behind one tab.
- **Settings:** Match preferences, privacy, safety, account grouped under Settings.
- Header: photo cover, name, age, city, verification, Edit / Settings actions.

### 9. Payment UX
- Recovery banner: **“Payment incomplete”** + calm copy + Try again / Close.
- Success toast: **“Payment successful”** + Continue (premium and boosts).
- Dismiss clears pending reference as well as pending flag.

### 10. Boosts via Paystack
- All boost products (`signal-boost`, `priority-signal-once`, `profile-boost`, `city-boost`) route through Paystack checkout.
- Server verifies payment; city boost activates DB placement; others activate locally after verify.

---

## Components changed

| Area | Files |
|------|-------|
| Location | `StateCitySelect.tsx`, `nigeriaLocations.ts`, `profileOptions.ts`, `launchSeed.ts` |
| Onboarding | `OnboardingPage.tsx` |
| Profile | `ProfilePage.tsx`, `ProfileCoverHeader.tsx` |
| Payments | `PaymentRecoveryBanner.tsx`, `App.tsx`, `api/paystack/verify.js` |
| Moderation | `mediaModeration.ts` |
| Intents | `intents.ts`, `types/index.ts` |
| Chats | `ChatsPage.tsx`, `contactGuard.ts` |
| CMS | `cms.ts` |
| Admin | `AdminPricingPage.tsx`, `AdminHubPage.tsx` |
| Styles | `auth.css` |

**Deleted:** `QuickiePaywallModal.tsx`, `constants/quickie.ts`, `utils/quickie.ts`

---

## Pages redesigned

- **Onboarding** — 4-step fintech flow
- **Profile (Me)** — Overview / Edit / Settings
- **Verify email** (prior sprint) — OTP boxes, resend cooldown
- **Payment surfaces** — Recovery + success banners in app shell

---

## UX improvements

- Calmer, shorter system copy throughout onboarding and payments
- State/city behaves predictably with search
- Less visual noise on profile (preferences/safety/account tucked away)
- Paid boosts actually checkout instead of silent local activation
- Portrait upload guidance aligned with dating app expectations
- Quickie removed to reduce confusion and unfinished payment paths

---

## Remaining recommendations

1. **Server-side photo moderation** — Client heuristics are a baseline; add ML or human review for production scale.
2. **Dedicated `/payment/success` screen** — Currently handled via redirect + in-app toast; a full-screen confirmation would match Kuda/Moniepoint patterns.
3. **Boost purchase modal** — Add explicit price/description confirmation step before Paystack redirect (BoostShop → confirm sheet).
4. **Discover card polish** — Further reduce copy on Discover deck; tune animation timing in `discover-v2.css`.
5. **Settings sub-navigation** — Split Settings into Profile / Privacy / Safety / Account anchor links as user base grows.
6. **Persist location on profile save** — Call `syncMemberProfileRemote` from ProfilePage save for cross-device city home consistency.
7. **Remove legacy CMS fields** — `quickiePrice`, `foundingMemberLabel` can be cleaned from admin CMS when convenient.

---

## Verification

- `npm run build` — passes
- Manual QA checklist:
  - [ ] Change state in onboarding → city clears and repopulates
  - [ ] Search city name in combobox
  - [ ] Complete 4-step onboarding
  - [ ] Select 3 intents → third disabled
  - [ ] Upload group photo → rejected with clear message
  - [ ] Purchase boost → Paystack → success toast
  - [ ] Profile Overview vs Edit vs Settings tabs

**Target:** Mature product feel for Nigerian users — calm, trustworthy, premium.
