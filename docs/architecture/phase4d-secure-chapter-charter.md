# Phase 4D — Secure Chapter Charter

**Status:** Next (after 4C silent walkthrough)  
**Baseline:** [Experience Blueprint](./phase4b-experience-blueprint.md) (frozen) · [4C Charter](./phase4c-implementation-charter.md)  
**Scope:** J7 Account · J8–J9 Verification · Login polish · PIN recovery polish

---

## Mission

The Secure Chapter must feel like **completing something already started** — not beginning bureaucracy.

Account creation is earned after J6. Verification is protective. Login is returning. Recovery is reassuring.

---

## Four outcomes (only these)

| Outcome | User should feel |
|---------|------------------|
| **Account creation feels earned** | Completing a journey they already invested in — not starting registration |
| **Verification feels protective** | Every screen answers *why* before asking them to verify |
| **Login feels familiar** | Returning to BamSignal — not authenticating into software |
| **Recovery feels reassuring** | Anxiety reduced; next step always clear |

If a proposed change does not directly support one of these four goals → **defer** to a later phase.

---

## Interaction filter (Phases 4C–4F)

Every interaction must do at least one of:

- **Increase trust**
- **Reduce effort**
- **Increase delight**

If it does none of those three → **remove it**.

---

## Pre-start gate: silent walkthrough

Before writing 4D code, complete a **silent walkthrough** of J1–J6 on phone and desktop.

Start a timer. Do not think like the developer.

After every screen, ask only:

1. Did I instantly know what to do?
2. Did this screen make me trust BamSignal more?
3. Did I enjoy moving to the next screen?
4. Did anything interrupt the emotional flow?
5. Did this feel different from ordinary signup flows?

Any hesitation → polish **that screen only**. Do not reopen the whole flow.

Pair with the [60-second experience test](./phase4c-implementation-charter.md#60-second-experience-test-every-build).

---

## In scope (4D)

- **J7** — Secure your journey (username + PIN + contact; progressive moments, not a cold wall)
- **J8–J9** — Email / phone verification with protective copy
- **A1** — Login shell polish (username + PIN only; welcome-back tone)
- **A2–A3** — Forgot PIN / reset PIN — calm, clear next steps
- Journey handoff from J6 → J7 (same `JourneyShell` primitives)
- Delight: account ready · verified (per blueprint)
- Success metrics per stage (account created, OTP completion, login success, recovery completion)

---

## Out of scope (4D)

- Photos, about, interests, Ready → **4E**
- First Discover intro / first Signal → **4F**
- Discreet checkout / invisibility enforcement → **3B** (after 4F)
- AI coaching, chatbot onboarding, conversational assistants
- New features unrelated to secure entry / return / recovery
- Member shell redesign

---

## Architecture rules (unchanged)

Build **journey primitives** — compose J7–J9 and login from existing `JourneyShell`, `JourneyQuestion`, `JourneyInput`, `JourneyTrustHint`, `JourneyCelebration`, etc.

Honor Experience Quality Gate, Journey Score ≥ 9/10, motion rule, typography rule, white space rule.

---

## PR review question

> Does this feel like securing a relationship journey the user already started — or like generic signup software?

If generic — do not merge.

**4D lens (every PR):**

```text
If a change makes the Secure Chapter feel more like authentication
than a relationship journey,

don't merge it.
```

---

## J6 → Secure Chapter (highest-risk handoff)

Evaluate the **micro-pause** immediately before account creation — not just the Secure screen.

The transition should feel like *“I’m ready.”* — not *“Oh… now I have to register.”*

| Question | Pass |
|----------|------|
| Does the transition feel inevitable rather than surprising? | |
| Does the account screen clearly explain *why now*? | |
| Does it feel like the final step of the journey — not the first step of registration? | |
| Would I willingly complete this if I were genuinely interested in meeting someone? | |

All yes → emotional arc protected. Any no → polish handoff or J7 copy before merging 4D.

---

## UX continuity (4D → 4F)

Engineering ships in phases (4D · 4E · 4F · separate PRs). Users experience **one uninterrupted journey**:

```text
Secure → Profile → Ready → First Discover
```

Design and copy should preserve emotional continuity across that arc — not reset tone at phase boundaries.

---

## Sequencing

```
✅ 4C — J1–J6 (craftsmanship pass complete; uncommitted until founder walkthrough)
➡ 4D — Secure Chapter (this charter)
➡ 4E — Profile Chapter
➡ 4F — First Discover
➡ 3B — Discreet enforcement (after 4F)
```

Governance: no new features during 4C–4F unless they directly improve auth/onboarding journey.
