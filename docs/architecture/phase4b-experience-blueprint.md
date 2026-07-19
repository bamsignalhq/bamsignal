# Phase 4B — Experience Blueprint

**Status:** **Frozen — approved baseline** (2026-07-19). Amendments incorporated. **4C active.**  
**Charter:** [phase4c-implementation-charter.md](./phase4c-implementation-charter.md)  
**Role:** Single source of truth for authentication + onboarding as a guided relationship journey  
**Companion:** [Relationship Journey Architecture](./phase4b-relationship-journey.md) · [Phase 4 Audit](../audits/phase4-auth-onboarding/REPORT.md)

---

## Non-negotiable design principle

```
The user must never feel they are filling out forms.

The entire journey should feel like a guided relationship experience.

Every screen should contain:
  • One primary decision
  • One clear action
  • One emotional objective
  • One beautiful transition

If any screen feels like paperwork, redesign it.
If any screen feels generic, redesign it.
If any screen could belong to another app, redesign it.

Every screen should immediately feel like BamSignal.
```

**Feel test (every screen):** “How should this person feel right now?” — not “What information do we still need?”

**Benchmark principles (not visual clones):** Apple · Revolut · Airbnb — unmistakable BamSignal (Nigerian-first, calm premium, relationship hope).

---

## Golden rule / Experience Quality Gate (pre-merge)

Every screen must answer **YES** to all before merge:

| Question |
|----------|
| Can a first-time user understand this screen in **under 3 seconds**? |
| Does this screen increase trust? |
| Does this screen reduce anxiety? |
| Does this screen move the user forward? |
| Does this screen feel unmistakably BamSignal? |
| Would someone remember this experience tomorrow? |

**Any NO → redesign before merge.**

---

## Journey Score (objective quality bar — 4C+)

Score **1–10** on each dimension before merge:

| Dimension | What it measures |
|-----------|------------------|
| **Trust** | Safety, privacy, verification cues feel honest |
| **Emotion** | Correct feeling for this moment |
| **Clarity** | One obvious action |
| **Momentum** | User wants to continue |
| **Beauty** | Calm premium craft; unmistakably BamSignal |
| **Accessibility** | WCAG AA+, keyboard, screen reader, contrast |
| **Performance** | Instant feel; no layout shift; ≤45s screen time |

**Minimum: 9/10 on every dimension. Nothing ships below 9.**

Record scores in PR with screen ID (J1, J2, …).

---

## Governance (Phases 4C–4F)

> **No new features during 4C–4F unless they directly improve the authentication or onboarding journey.**

Phase 3A frozen. Phase 3B after 4F. **No AI coaching / chatbot onboarding in 4C** — Guide is static copy only.

---

## One job per screen (hard rule)

No screen may exceed **30–45 seconds** of focused effort for a typical user.

Every screen spec must include exactly these fields:

| Field | Definition |
|-------|------------|
| **Purpose** | The single job this screen does |
| **Emotion** | How the user should feel |
| **Information collected** | Data only (or “none”) |
| **Why now?** | Why we ask at this moment |
| **Trust signal** | One woven line max |
| **Primary CTA** | Context-aware label |
| **Expected completion time** | Target seconds (≤45) |
| **Success metric** | Measurable outcome for this stage |

**No screen may combine two primary jobs.**

---

## Relationship Strength Meter (replaces “Step X of Y”)

Never show fragile numeric steps (e.g. “Step 4 of 3”). Show **journey strength** — human, not bureaucratic.

| Chapter | Meter label | Supporting copy (examples) |
|---------|-------------|----------------------------|
| Welcome | Starting your journey | Meaningful relationships begin here. |
| Intent | Building your journey | You chose how you want to meet. |
| You | Your profile is taking shape | ██████░░░░ |
| Secure | Securing your account | Almost there — we protect what matters. |
| Profile | Almost ready | Your future matches will thank you. |
| Ready | Ready to connect | Welcome to BamSignal. |

Visual: soft bar fill (not step numbers). Copy rotates with chapter; meter animates forward on chapter complete (`progress-fill` token).

---

## Moments of delight (celebration beats)

Information architecture alone is not enough. Lock these **affirmation moments** (brief, restrained — never noisy):

| After | Delight copy (direction) |
|-------|----------------------------|
| J2 — Discover or Discreet chosen | “Great choice.” |
| J7 — account created (4D) | “Your BamSignal account is ready.” |
| J9 — verification complete (4D) | “You're verified.” |
| J10 — first photo (4E) | “Looking good.” |
| J13 — onboarding complete (4E) | “Welcome to BamSignal.” |
| D1 — first Signal (4F) | “Your first Signal is on its way. Let's see where your story begins.” |

Earned, not excessive. One line + optional micro-animation.

---

## Guide (subtle companion — not a chatbot)

A **Guide** layer — tiny human messages, never a chat UI. One line at a time; dismisses automatically; never blocks input.

Example bank (rotate; do not stack):

- Nice choice. Let’s continue.
- Almost there.
- You’re doing great.
- Looking good.
- Ready?

**Rules:** ≤8 words typical; no avatar gimmick; no typing indicator; max one Guide line per screen transition; honor reduced motion; never annoying or repetitive within a session.

Implementation: `GuideWhisper` primitive in Journey Shell footer or below headline — optional per screen in blueprint table.

---

## Cinematic transitions

The experience should feel **cinematic**: intentional, calm, forward-moving — not “the next page loaded.”

| Principle | Spec |
|-----------|------|
| Intent | User thinks “I’m moving forward,” not “URL changed” |
| Motion | Shared `journey-enter` / `journey-exit`; chapter handoffs slightly longer (300–400ms) |
| Continuity | Shell atmosphere morphs with chapter (see below) |
| Restraint | No animation for animation’s sake; reduced motion = fade only |
| Sound | Silent (no UI sounds unless explicitly added later) |

Every transition in §3 must pass the cinematic test in review.

---

## Evolving Journey Shell (alive, not static)

The shell **evolves** with chapter so users subconsciously feel progress:

| Chapter | Atmosphere shift (direction) |
|---------|------------------------------|
| Welcome | Soft warm gradient — entry, hope |
| Intent | Slightly brighter — agency |
| You | Personal warmth — belonging |
| Secure | Secure blue accent — trust, protection |
| Profile | Building energy — pride |
| Ready | Celebration glow — restrained crest |
| Discovery handoff | Member atmosphere — warm, not abrupt feed dump |

Same shell components; **CSS chapter tokens** on `.journey-shell--welcome`, `--intent`, `--you`, `--secure`, `--profile`, `--ready`. Never a hard cut to generic dark SaaS card.

---

## Roadmap freeze (locked order)

| Status | Phase |
|--------|-------|
| Done | Phase 1 — Three-product architecture |
| Done | Phase 2 — Product positioning |
| Done (frozen) | Phase 3A — Membership & billing foundation — **do not start 3B yet** |
| Done | Phase 4A — Auth/onboarding audit |
| **Now** | **4B — Approved blueprint** |
| **Next** | **4C — Journey Shell + J1–J6** (Journey Score 9/10 required per screen) |
| Next | Phase 4D — Secure chapter (late Account + verify) |
| Next | Phase 4E — Photo + about + interests + Ready |
| Next | Phase 4F — First Discover guided session |
| Later | Phase 3B — Discreet checkout + invisibility enforcement |

**Do not commit 3A/4B docs until you explicitly ask.** No UI code until this blueprint is reviewed.

---

## Blueprint checklist (required contents)

| # | Requirement | Where in this doc |
|---|-------------|-------------------|
| 1 | Every screen in order | §1 Screen index |
| 2 | Every user decision | §2 Decision matrix |
| 3 | Every transition | §3 Transitions |
| 4 | Every animation | §4 Motion language |
| 5 | Every emotion | §1 + §5 per screen |
| 6 | Every trust signal | §6 Trust rotation |
| 7 | Every piece of information collected | §1 + §7 Data timing |
| 8 | Why collected at that moment | §7 Why-now |
| 9 | Mobile-first wireframes | §8 Wireframes |
| 10 | Desktop adaptations | §9 Desktop |
| 11 | Accessibility | §10 A11y |
| 12 | Success metrics per step | §11 Metrics |
| 13 | Journey Score + Golden Rule | Top of doc |
| 14 | Moments of delight + Guide | Dedicated sections |
| 15 | Relationship Strength Meter | Dedicated section |
| 16 | First Discover intro (D0a–D1) | §8 wireframes + §1b |

---

## Product locks (unchanged)

- Login: **username + PIN** only (never email/password UI)
- Signup may collect email/phone for verification
- Incomplete → `/onboarding`; complete → `/home`
- Onboarding UI only at `/onboarding`
- Public Join never triggers member restore
- OTP / PIN / rate limits / CSRF / bot protection remain; soft-degrade math gate (never infinite Continue lock)
- Discover / Discreet / Concierge are independent; **no payment** on journey choice
- Concierge intent → `/signal-concierge` (never Discover onboarding)

---

## 1. Every screen in order

### Primary path (Discover / Discreet)

| ID | Screen | Chapter | Emotion | Primary decision | Data collected |
|----|--------|---------|---------|------------------|----------------|
| L0 | Landing | Public | Curiosity + hope | Join or Login | — |
| J1 | Welcome | Welcome | Belonging + excitement | Begin | — |
| J2 | Choose journey | Intent | Agency + anticipation | Pick experience | `experienceIntent` |
| J3 | Your name | You | Belonging | Confirm name | Display name |
| J4 | Birthday | You | Dignity | Confirm DOB | DOB → age |
| J5 | Who to meet | You | Hope | Pick preference | Looking-for |
| J6 | Location | You | Clarity | Confirm city | State + city |
| J7 | Account | Secure | Safe commitment | Create account | Email, WhatsApp phone, username, PIN×2, legal |
| J8 | Email verify | Secure | Safety | Enter code | Email OTP |
| J9 | Phone verify | Secure | Safety + progress | Enter code | Phone OTP |
| J10 | Photo | Profile | Pride | Accept photo | Primary photo |
| J11 | About you | Profile | Connection | Share story | Bio / about fields |
| J12 | Interests | Profile | Playful momentum | Pick chips | Interests |
| J13 | Ready | Ready | Confidence + delight | Start Discovering | — |
| D0a | Discover intro | Discovery | Anticipation + welcome | Continue to first profile | — |
| D0b | First profile | Discovery | Delight + guidance | Send Signal / pass | Signal action |
| D1 | First Signal sent | Discovery | Pride + payoff | Continue browsing | — |

### Forks & returning

| ID | Screen | Emotion | Primary decision |
|----|--------|---------|------------------|
| C0 | Concierge divert | Focused care | Continue Concierge apply |
| A1 | Login | Welcome back | Sign in |
| A2 | Forgot PIN | Reassurance | Request code |
| A3 | Reset PIN | Control restored | Set new PIN |
| A4 | Existing account | Relief | Go to login / reset |
| A5 | Loading / restore | Calm patience | Wait (copy only) |

---

## 1b. One job per screen (full spec)

| ID | Purpose | Emotion | Information | Trust signal | Primary CTA | Time |
|----|---------|---------|-------------|--------------|-------------|------|
| J1 | Enter BamSignal emotionally | Hope | None | Privacy first | Begin | ~15s |
| J2 | Choose relationship path | Agency | `experienceIntent` | No payment here | Continue | ~20s |
| J3 | Capture display name | Belonging | Name | How people know you | Continue | ~15s |
| J4 | Confirm age eligibility | Dignity | DOB | Adult community | Continue | ~20s |
| J5 | Capture meet preference | Hope | Looking-for | Meaningful matches | Continue | ~20s |
| J6 | Confirm location | Clarity | State + city | Recommend near you | Continue | ~25s |
| J7 | Create secure account | Commitment | Email, phone, username, PIN, legal | Encrypted · PIN | Join securely | ~45s |
| J8 | Verify email | Safety | Email OTP | Account is yours | Verify | ~30s |
| J9 | Verify phone | Safety | Phone OTP | Protect community | Verify | ~30s |
| J10 | Primary photo | Pride | Photo | Real people | Use this photo | ~40s |
| J11 | About you | Connection | Bio fields | Honesty attracts | Continue | ~35s |
| J12 | Interests | Momentum | Interest chips | Optional | Continue / Skip | ~25s |
| J13 | Celebrate completion | Confidence | None | Ready to connect | Start Discovering | ~10s |
| D0a | Introduce Discover (not feed) | Welcome | None | Control every Signal | Meet someone | ~20s |
| D0b | First profile moment | Guidance | Signal action | Take your time | Send Signal | ~30s |
| D1 | First Signal payoff | Pride | None | Story begins | Keep exploring | ~5s |
| A1 | Return login | Welcome back | Username + PIN | PIN private | Login | ~20s |

**Delight + Guide** fire on rows marked in Moments of delight / Guide sections above.

## 2. Every user decision

| Screen | Decision type | Options | Required? | If skipped / back |
|--------|---------------|---------|-----------|-------------------|
| L0 | Entry | Join · Login · Explore public | — | Stay public |
| J1 | Proceed | Begin | Yes | Back → L0 |
| J2 | Experience | Discover · Discreet · Concierge | Yes | Back → J1; Concierge → C0 |
| J3 | Identity | Enter name | Yes | Back → J2 |
| J4 | Eligibility | Enter DOB | Yes | Under-18 blocked with dignity |
| J5 | Preference | Visual meet options | Yes | Back → J4 |
| J6 | Place | Auto-detect confirm · Manual | Yes | Geo deny → manual only |
| J7 | Commitment | Submit account | Yes | Existing → A4; soft bot degrade |
| J8 | Prove email | OTP · Resend | Yes | Cooldown explained |
| J9 | Prove phone | OTP · Resend | Yes | Channel clarity |
| J10 | Presence | Use photo · Retake · Tips | Yes (primary) | Quality tips, not shame |
| J11 | Expression | Continue (fields as product needs) | Soft | Prefer continue with minimum viable |
| J12 | Flavor | Select chips · Skip if allowed | Soft | Skip must not break Ready |
| J13 | Launch | Start Discovering | Yes | Secondary “keep building” only if needed |
| D0a | Intro | Meet someone | Yes | Never skip to feed |
| D0b | First profile | Send Signal · pass | Guided | Warm empty OK after intro |
| D1 | Celebrate | Keep exploring | Auto | After first Signal |
| A1 | Return | Login · Forgot PIN · Join | — | — |

---

## 3. Every transition

| From → To | Trigger | Transition feel | Duration intent |
|-----------|---------|-----------------|-----------------|
| L0 → J1 | Join BamSignal | Shared atmosphere continues (no hard cut to dark form) | 250–400ms crossfade |
| J1 → J2 | Begin | Forward slide / fade | 280ms |
| J2 → J3 or C0 | Continue | Forward; Concierge uses brand handoff to Concierge shell | 280ms |
| J3…J6 | Continue / Back | Horizontal chapter motion within You | 240–280ms |
| J6 → J7 | Continue | Subtle “securing” beat (trust rises) | 300ms |
| J7 → J8 | Account created | Success micro-ack then verify | 200ms + navigate |
| J8 → J9 | Email verified | Progress chapter fill | 280ms |
| J9 → J10 | Phone verified | Profile chapter opens | 300ms |
| J10 → J11 → J12 | Continue | Soft forward | 240ms |
| J12 → J13 | Continue | Celebratory lift (restrained) | 350ms |
| J13 → D0a | Start Discovering | Cinematic handoff to intro — not feed | 400ms |
| D0a → D0b | Meet someone | Forward; first profile reveal | 320ms |
| D0b → D1 | First Signal sent | Micro-celebration overlay | 280ms |
| Any → A1 | Already have account | Shell stays; mode swap | 200ms |
| Error states | Inline | No full-page panic; field + helper | Instant |

**Rule:** Back always reverses the same transition. Reduced motion → opacity only / instant.

---

## 4. Every animation (motion language)

| Token | Use | Spec |
|-------|-----|------|
| `journey-enter` | Screen enter | Fade + 8–12px rise; 280ms ease-out |
| `journey-exit` | Screen leave | Fade; 200ms |
| `cta-press` | Primary button | 0.98 scale; 100ms |
| `cta-success` | Account / verify / photo OK | Brief check draw or glow; 300ms |
| `progress-fill` | Chapter bar | Width ease 300ms |
| `chip-select` | Interests / meet options | Border + fill; 150ms |
| `otp-slot` | Code entry | Focus ring; digit pop 80ms |
| `photo-coach` | Face guide | Soft pulse ring; stop on capture |
| `ready-celebrate` | J13 | One restrained crest (not confetti storm) |
| `discover-welcome` | D0 tip | Slide-down chip; dismissible |

**Never:** bounce spam, emoji rain, parallax noise, autoplaying loud video on Join.

---

## 5. Emotion map (quick reference)

```
L0 Curiosity  →  J1 Hope  →  J2 Anticipation  →  J3 Belonging
→ J4 Dignity  →  J5 Hope  →  J6 Clarity  →  J7 Commitment
→ J8–J9 Safety  →  J10 Pride  →  J11 Connection  →  J12 Momentum
→ J13 Confidence  →  D0 Delight
```

Anti-emotions banned: confused, overwhelmed, bored, blocked, lost, paperwork anxiety.

---

## 6. Trust signal rotation

Show **one** calm line per screen (shell footer or under CTA). Rotate from bank — never dump five badges.

| Screen | Trust line (direction) |
|--------|------------------------|
| J1 | Your privacy comes first. |
| J2 | No payment here — just how you want to meet. |
| J3 | This is how people will know you. |
| J4 | Keeps BamSignal adult and accurate. |
| J5 | Built for meaningful matches, not noise. |
| J6 | We use this to recommend people near you. |
| J7 | Encrypted · Username + PIN |
| J8 | This keeps your account yours. |
| J9 | Helps protect the community. |
| J10 | Real people. Clear photos help replies. |
| J11 | Be honest — it attracts the right people. |
| J12 | Optional — add what feels like you. |
| J13 | You’re ready for meaningful connections. |
| D0 | You’re in control of every Signal. |
| A1 | Your PIN stays private. |

---

## 7. Information collected — and why now

| Data | Screen | Why at this exact moment |
|------|--------|--------------------------|
| — | J1 | Pure emotion; no extraction before belonging |
| `experienceIntent` | J2 | Shapes path (Concierge divert / Discreet flag) before sunk cost; no paywall so choice is honest |
| Display name | J3 | Lowest-friction personal stake; starts “this is about me” |
| DOB | J4 | Age gate before deeper investment; dignity before account |
| Looking-for | J5 | Makes later Discover feel purposeful; still pre-account |
| State + city | J6 | Explained utility (“near you”); enables recommendations without scaring as tracking |
| Email | J7 | Needed for verify + recovery — asked after emotional investment ↑ completion |
| Phone (WhatsApp-aligned) | J7 | Nigeria-first reachability; label must match validation |
| Username + PIN | J7 | Login identity; only after user cares about finishing |
| Legal accept | J7 | Commitment moment — not Screen 1 checkbox theater |
| Email OTP | J8 | Security after account exists; feels protective not bureaucratic |
| Phone OTP | J9 | Same; progress animation keeps momentum |
| Photo | J10 | Pride moment once identity is secure; coaching not admin upload |
| About / interests | J11–J12 | Expression after face exists; Discover quality without early form wall |

**PIN never stored in local journey draft.**

---

## 8. Mobile-first wireframes (~390×844)

Layout grammar (all journey screens):

```
┌─────────────────────────────┐
│ [Back]     BamSignal     ···│  ← shell top
│ ░░ Building your journey ░░░│  ← Relationship Strength Meter (not Step X of Y)
│                             │
│  Headline (1 idea)          │
│  Short lede (1–2 lines)     │
│                             │
│  ┌───────────────────────┐  │
│  │ Primary content       │  │  ← one decision surface
│  │ (choice / one field / │  │
│  │  OTP / photo stage)   │  │
│  └───────────────────────┘  │
│                             │
│  Trust line (one)           │
│  ┌───────────────────────┐  │
│  │     Primary CTA       │  │
│  └───────────────────────┘  │
│  Secondary text link        │
└─────────────────────────────┘
```

### J1 Welcome

```
│ BamSignal                   │
│                             │
│ Welcome to BamSignal        │
│ Meaningful relationships    │
│ begin with one step.        │
│                             │
│ We’ll guide you.            │
│ A few minutes.              │
│                             │
│ [ Begin ]                   │
│ Already have an account?    │
```

### J2 Choose journey

```
│ How would you like to meet? │
│                             │
│ ┌ Discover ───────────────┐ │
│ │ Explore yourself        │ │
│ └─────────────────────────┘ │
│ ┌ Discreet Membership ────┐ │
│ │ Private · you initiate  │ │
│ └─────────────────────────┘ │
│ ┌ Signal Concierge™ ──────┐ │
│ │ Dedicated matchmaker    │ │
│ └─────────────────────────┘ │
│ No payment on this step.    │
│ [ Continue ]                │
```

### J3–J6 One-field / one-choice

```
│ What should people call you?│
│                             │
│ ┌ First name ─────────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│ This is how people know you │
│ [ Continue ]                │
```

(Same grammar for DOB picker, meet cards, location confirm.)

### J7 Account (still one shell — progressive within Secure if needed)

Prefer stacked **moments** (contact → username → PIN → legal) over one cold wall. If single scroll: clear section breathing, never six unlabeled fields jammed.

```
│ Secure your journey         │
│ Email / WhatsApp / Username │
│ PIN · Confirm PIN           │
│ □ Legal                     │
│ Encrypted · Username + PIN  │
│ [ Join securely ]           │
```

### J8 / J9 Verify

```
│ Check your email            │
│ Code sent to a***@…         │
│ ○ ○ ○ ○ ○ ○                 │
│ [ Verify ]  Resend in 0:24  │
│ This keeps your account yours│
```

### J10 Photo

```
│ Your first photo            │
│ [ guide frame / preview ]   │
│ Tips: face clear, light…    │
│ [ Use this photo ] [Retake] │
```

### J13 Ready

```
│ You’re all set.             │
│ Welcome to BamSignal.       │
│                             │
│ [ Start Discovering ]       │
```

### D0a Discover intro (before any card)

Do **not** drop users into a feed. Introduce them first.

```
│ Welcome, Alex.              │
│                             │
│ Today we'll introduce you   │
│ to a few amazing people.    │
│                             │
│ Take your time.             │
│ Every Signal starts a       │
│ story.                      │
│                             │
│ [ Meet someone ]            │
│ You're in control.          │
```

Guide whisper (optional): "Ready?"

### D0b First profile

Only after D0a — show **Profile #1** with one guided action.

```
│ [ Profile card #1 ]         │
│ Tip: a Signal is interest…  │
│ [ Send Signal ]             │
```

### D1 First Signal sent

```
│ Your first Signal is on     │
│ its way.                    │
│                             │
│ Now let's see who notices   │
│ you.                        │
│                             │
│ [ Keep exploring ]          │
```

Delight + Journey Score gate applies to D0a–D1 in Phase 4F.

### A1 Login

```
│ Welcome back                │
│ Continue your journey       │
│ Username                    │
│ PIN                         │
│ [ Login ]                   │
│ Forgot PIN? · Join          │
│ Your PIN stays private.     │
```

---

## 9. Desktop adaptations (~1280+)

| Rule | Spec |
|------|------|
| Composition | Journey stays **one focused column** (max ~420–480px content), centered over atmospheric brand field — not a dashboard |
| Do not | Wide multi-column forms, side marketing cards that scream “SaaS signup” |
| Atmosphere | Desktop may show richer landing-adjacent photography behind/beside the column — same story as mobile |
| Touch → pointer | Keep large hit targets; hover states quiet |
| J2 cards | Still stacked or soft 3-up **inside** the column — selection remains one decision |
| Photo | Larger preview stage; same coaching copy |
| Discover D0 | Member chrome appears; day-0 tip overlays without redesigning frozen member nav |

**Brand test:** Removing chrome, the first viewport must still feel like BamSignal, not a generic auth modal.

---

## 10. Accessibility considerations

| Area | Requirement |
|------|-------------|
| Contrast | WCAG AA+ text/UI; input borders never low-contrast navy-on-navy |
| Labels | Visible or properly associated floating labels; `htmlFor` / `id` solid |
| Focus | Visible focus rings on all controls; logical tab order |
| Targets | ≥44×44px primary controls |
| Keyboard | Full journey operable; Escape/Back consistent |
| Screen readers | Live regions for OTP errors, upload progress, success |
| Motion | `prefers-reduced-motion`: no slide; instant/fade only |
| Errors | `aria-invalid` + describedby; never color-only |
| Age gate | Clear text alternative to picker quirks |
| Language | Human, blame-free; PIN not password |

---

## 11. Success metrics per step

Instrumentation targets for post-ship measurement (names directional).

| Screen | Primary success | Abandonment risk | Guardrail |
|--------|-----------------|------------------|-----------|
| L0→J1 | Join click → Welcome view | Medium (hesitation) | Drop if Join still opens old form wall |
| J1 | Begin rate > 90% of Welcome views | Low | — |
| J2 | Selection + Continue > 85% | Medium (indecision) | Concierge share tracked separately |
| J3–J6 | Step complete > 80% each | Medium (rising) | Time-on-step; back loops |
| J6→J7 | Account start rate | **High** historically | Must beat old signup wall conversion |
| J7 | Account create success | High (validation/bot) | Soft-degrade bot; existing-account recover |
| J8 | Email verify < 10 min median | Medium (spam) | Resend + hint CTR |
| J9 | Phone verify success | Medium | Channel mismatch alerts |
| J10 | Photo accepted | Medium (shame/quality) | Retake vs quit ratio |
| J11–J12 | Continue / skip | Lower | Skip must not spike churn at Ready |
| J13 | Start Discovering > 90% | Low | — |
| D0a | Intro complete → D0b > 85% | Medium | Never skip straight to feed |
| D0b | First Signal or pass < 3 min | Medium | No “Adjust preferences” only |
| D1 | Dismiss celebration → continue browse | Low | First-Signal completion tracked |

**North-star:** Landing → first Signal completion rate. **Quality gate:** Journey Score 9/10 all dimensions per screen before merge (4C+).

---

## 12. Journey Shell (implementation contract)

Shared chrome for J* and A* — **evolves by chapter** (see Evolving Journey Shell above):

- BamSignal mark
- **Relationship Strength Meter** (not step numbers)
- Optional **Guide** whisper (one line max)
- One trust line
- One primary CTA
- Back / secondary link
- Chapter atmosphere tokens (welcome → secure → ready)
- No member restore on public Join

Reusable primitives (4C+): `JourneyShell`, `RelationshipStrengthMeter`, `GuideWhisper`, `TrustLine`, `JourneyChoiceCards`, `OneFieldStep`, `OtpStep`, `PhotoCoach`, `ReadyHero`, `DelightAck`, `DiscoverIntro`, `FirstSignalCelebration`.

**4C merge checklist per PR:** Golden Rule YES ×6 · Journey Score ≥9 ×5 · One job · ≤45s · cinematic transition.

---

## 13. Concierge & Discreet forks

| Intent | Behavior |
|--------|----------|
| Discover | Full J1→D0 path |
| Discreet | Same path; persist `experienceIntent=discreet`; membership/pay later (3B) |
| Concierge | After J2 → C0 existing Concierge apply/consultation — **no** Discover onboarding |

---

## 14. Mapping to today’s code (for 4C+)

| Blueprint | Current |
|-----------|---------|
| Join → J1 | `/love/sign` today opens multi-field signup — **must change** |
| A1 | `/love/login` · `AuthPage` login |
| J7–J9, A2–A4 | `AuthPage` signup/verify/reset/existing |
| J3–J6, J10–J13 | `OnboardingPage` (wrong order + progress bug today) |
| Intent | Product landings / `productRoutes` language |
| C0 | `/signal-concierge` |
| D0a–D1 | `DiscoverPage` + day-0 overlay | Intro before cards; first Signal celebration |

---

## 15. Approval status

**Phase 4B frozen** (2026-07-19). **Phase 4C active** — see [Implementation Charter](./phase4c-implementation-charter.md).

Implementation order: 4C → 4D → 4E → 4F → 3B → 3C–3E.

**PR gate:** Experience Quality Gate + Journey Score ≥9 + “relationship journey, not software.”

**Still frozen:** No git commit until explicitly requested.
