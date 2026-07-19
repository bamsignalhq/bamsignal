# Phase 4C — Implementation Charter

**Status:** Active  
**Baseline:** [Experience Blueprint](./phase4b-experience-blueprint.md) (frozen, approved)  
**Scope:** Journey Shell + J1–J6 (Welcome → Intent → You chapter)

---

## Mission

This is not an authentication project. This is the construction of BamSignal's **Relationship Journey**.

Every pixel reinforces that idea. Quality of this work determines whether users trust BamSignal within the first 60 seconds.

**Do not optimize for speed of implementation. Optimize for excellence.**

Every component should be built as if it remains in production for five years. Prefer fewer, better components. No shortcuts, temporary UI, or duplicated logic.

This foundation extends to Discover Membership, Discreet Membership, and Signal Concierge™.

---

## Governance (Phases 4C–4F)

> No new features unless they directly improve the authentication or onboarding journey.

Phase 3A frozen. Phase 3B after 4F.

### Interaction filter

Every interaction must do at least one of:

- **Increase trust**
- **Reduce effort**
- **Increase delight**

If it does none of those three → **remove it**.

---

## Pre-4D gate: silent walkthrough

Before Phase 4D, walk J1–J6 on phone and desktop without developer context.

After each screen:

1. Did I instantly know what to do?
2. Did this screen make me trust BamSignal more?
3. Did I enjoy moving to the next screen?
4. Did anything interrupt the emotional flow?
5. Did this feel different from ordinary signup flows?

Hesitation on any screen → polish that screen only. See [Phase 4D charter](./phase4d-secure-chapter-charter.md).

---

## Architecture rule: build primitives, not screens

Never build one-off screens. Compose from:

- `JourneyShell`, `JourneyHeader`, `JourneyStrengthMeter`, `JourneyGuide`, `JourneyTrustHint`
- `JourneyQuestion`, `JourneyInput`, `JourneyChoiceCard`
- `JourneyFooter`, `JourneyPrimaryButton`, `JourneySecondaryButton`
- `JourneyTransition`, `JourneyCelebration`

---

## Experience Quality Gate (mandatory pre-merge)

| Question |
|----------|
| Can a first-time user understand this screen in under 3 seconds? |
| Does this screen increase trust? |
| Does this screen reduce anxiety? |
| Does this screen move the user forward? |
| Does this screen feel unmistakably BamSignal? |
| Would someone remember this experience tomorrow? |

Any NO → redesign before merge.

---

## Journey Score (mandatory pre-merge)

Score 1–10 on each dimension; **minimum 9/10**:

Trust · Emotion · Clarity · Momentum · Beauty · Accessibility · Performance

Document scores in PR with screen ID (J1, J2, …).

---

## One job per screen

Each screen defines: Purpose · Emotion · Information · Why now · Trust · Primary CTA · Expected time · Success metric.

One screen. One purpose. ≤45 seconds typical.

---

## Explicitly out of scope for 4C

- AI coaching, AI assistants, conversational onboarding
- J7+ Secure chapter (4D)
- Photo / Ready / First Discover (4E–4F)

Guide whispers are static copy only — not LLM.

---

## Motion rule

Every animation has purpose: fade (chapter enter), slide (forward), scale (confirmation), glow (celebration). Never animate because something can animate. Honor `prefers-reduced-motion`.

---

## Typography rule (locked tokens in `journey.css`)

Headline · Journey title · Question · Body · Helper · Trust line · Caption · CTA — no arbitrary sizes.

---

## White space rule

If crowded or five competing elements — wrong. Eye must know where to go first.

---

## Component quality rule

Before complete: beautiful, accessible, responsive, animated (with purpose), dark/light, keyboard + screen reader + touch friendly, reusable.

---

## Journey rule

No screen asks more than the user has emotionally earned. Account (4D) only after J6.

---

## 4C success definition

A brand-new user reaches **J6 (Location)** and feels **"I'm enjoying this"** before creating an account.

---

## PR review question

> Does this feel like the beginning of someone's relationship journey, or does it still feel like software?

If software — do not merge.

---

## 60-second experience test (every build)

Before merge, walk `/love/sign` J1–J6 on desktop and mobile. Answer honestly:

| Question | Pass |
|----------|------|
| Would I trust this app after one minute? | Yes |
| Would I continue? | Yes |
| Did anything confuse me? | No |
| Did I ever wonder what to do next? | No |
| Did anything feel generic? | No |
| Would I recommend this app after this first minute? | Yes |

Any **No** on pass columns → fix polish before merge. Pair with the Experience Quality Gate and Journey Score (minimum 9/10).
