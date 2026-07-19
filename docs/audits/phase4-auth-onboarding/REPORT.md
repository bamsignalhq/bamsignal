# Phase 4 — Authentication & Onboarding Experience Audit

**Date:** 2026-07-19  
**Scope:** Landing → Sign up → Email verify → Login → Forgot PIN → Session restore → Onboarding → Photos → First Discover  
**Constraint:** Audit only — **no redesign implemented**  
**Evidence:** Local Vite (`localhost:5173`), browser screenshots in [`screenshots/`](./screenshots/), code cites below  

---

## Executive verdict

BamSignal’s **public homepage now feels premium**. Auth and onboarding do **not**. Crossing Join drops the user from a relationship brand into a **generic dark form shell** with weak trust messaging, a signup gate that can hard-block Continue (`Signup protection is unavailable` / `One moment…`), and onboarding that still reads like a **profile bureaucracy** rather than an emotional first date with the product.

The trust gap is real: marketing says “Find Love Your Way”; auth says “Create your account / Continue.”

---

## 1. Current user journey map

```
/  Landing (hero + three experiences + Join/Login)
        │
        ├─► /love/sign  (AuthMode: signup)
        │         ├─► verify (email OTP)
        │         ├─► existing (account already exists)
        │         └─► /onboarding (after verify + session)
        │
        └─► /love/login (AuthMode: login)
                  ├─► reset (Forgot PIN → email code → new PIN)
                  ├─► login 2FA (when enabled)
                  ├─► SessionRestoreOverlay (“Restoring your session…”)
                  └─► /onboarding OR /home → /discover
```

**Locked product rules (audit maps to these, not “password”):** Username + PIN; Forgot PIN / Reset PIN; signup may collect email/phone for verification.

| Screen | Path / mode | Captured? |
|--------|-------------|-----------|
| Landing mobile | `/` | Yes — `01-landing-mobile.png` |
| Landing desktop attempt | `/` @ 1280 | Partial — `01-landing-desktop.png` (layout/truncation issues under Emulation) |
| Signup | `/love/sign` | Structure via a11y snapshot; visual PNG flaky — `02-signup-mobile.png` |
| Login | `/love/login` | Yes — `05-login-mobile.png` |
| Login error | Invalid PIN | Yes — `05b-login-error-mobile.png` (“Invalid username or PIN.”) |
| Reset PIN | login → Forgot PIN | Yes — `06-reset-pin-mobile.png` |
| Email verify / existing / 2FA | needs live OTP / account | **Not captured** (blocked without real credentials) |
| Onboarding steps | `/onboarding` | **Not captured** — unauthenticated → redirect to login (`09-…`) |
| Session restore stall | member hydrate | **Not captured** (needs authed session) |
| Photo crop / quality | onboarding | **Not captured** (gated) |
| First Discover member | `/discover` | **Not captured** (gated); guest Discover code-reviewed |

---

## 2. Authentication audit

### What works
- Clear PIN model (not password) on login.
- Warm login lede: “Good to have you back ❤️”.
- Error copy for failed login is correct: **“Invalid username or PIN.”** (no email/password leak).
- Reset PIN flow exists with email code → new PIN.
- Existing-account path exists (code) to escape registration traps.

### What fails the “Wow” bar
| Issue | Severity | Evidence |
|-------|----------|----------|
| **Premium landing → generic auth cliff** | High | Landing hero photography + brand story; auth is centered logo + form card, no narrative continuity |
| **Signup trust vacuum** | High | No safety / verification / Nigeria / privacy reassurance on signup — only legal checkbox |
| **Signup gate can disable Continue indefinitely** | High | Snapshot: Continue `disabled`, legal checkbox `readonly`, message **“One moment…”** or **“Signup protection is unavailable.”** (`server/services/signupMathChallenge.js`, `AuthPage` math gate) |
| **Phone labeled “Phone”, validated as WhatsApp** | Medium | Copy mismatch confuses users |
| **Forgot PIN / Create account below fold on short viewports** | Medium | Login screenshot often crops them; links exist in DOM |
| **Centered inputs** | Medium | Unusual for forms; hurts scanability vs fintech norms |
| **Visual duplication glitch** | Medium | Login screenshots show branding repeating under a gradient rule (layout overflow / capture of stacked chrome) |
| **No progressive disclosure on signup** | High | Single wall: name, username, phone, email, PIN×2, legal, math — feels long vs “it only takes a minute” |

Key code: [`src/pages/AuthPage.tsx`](../../src/pages/AuthPage.tsx) modes `login|signup|verify|reset|existing`.

---

## 3. Onboarding audit

**Structure (code):**
- Required (2): Basic info (name, age, gender, state/city) → Photo + intent  
- Ready fork: “Start Discovering” vs “Continue Building Profile”  
- Optional (3): About you → More photos → Preferences  

**Brutal findings**
1. **Transactional, not exciting** — Age selects 17–75, gender, state/city first. Feels government-form before emotion.
2. **Progress math bug** — Eyebrow uses `STEP_TITLES` index (0–4) with `totalSteps` 2 or 3 → optional can show **“Step 4 of 3” / “Step 5 of 3”** ([`OnboardingPage.tsx`](../../src/pages/OnboardingPage.tsx) `stepTitleIndex` + `OnboardingStepHead`).
3. **Photo timing** — Required photo early is good for quality; more photos as optional is fine, but instructions + quality feedback are not premium-feeling in copy.
4. **“Meet people who match your vibe”** on step 0 conflicts with newer homepage “Find Love Your Way / three experiences.”
5. **Ready card** (“Better profiles receive more replies”) is instructional/cold vs celebratory.

---

## 4. Trust audit

| Trust signal | Landing | Auth | Onboarding |
|--------------|---------|------|------------|
| Safety / moderation | Present (Safety section) | **Absent** | Weak |
| Verification / real people | Weak on hero | **Absent** | Photo quality only |
| Privacy / data | Footer | Legal checkbox only | Absent |
| Security of PIN | — | Show PIN eye; no “why PIN” education | — |
| Community standards | Footer | Absent | Absent |

**Verdict:** Trust is marketed on the homepage and **abandoned at the exact moment users must commit identity**.

---

## 5. UI audit

- Auth uses fintech card + gradient CTA — brand-adjacent but **not** the same system as landing photography/hero.
- Input borders very low contrast on dark navy (a11y risk).
- Pill CTAs consistent with brand gradient.
- Signup stacks many fields without section breathing / storytelling.
- Homepage bottom nav (Home / Discover / Join) competes with header Login + Join CTA (redundant Join).

---

## 6. UX audit

Emotional arc today:

| Stage | Emotion delivered |
|-------|-------------------|
| Landing | Hope / premium curiosity |
| Signup | Friction / form anxiety |
| Math gate failure | Helplessness (Continue stuck) |
| Login | Mild warmth |
| Restore | Anxiety (“Still restoring…”) |
| Onboarding | Compliance |
| First Discover empty | Confusion (“Adjust preferences”) |

Missing: celebration, anticipation, “you’re joining something special.”

---

## 7. Accessibility audit

| Item | Status |
|------|--------|
| Labels via AuthField wrap | Partial — floating label pattern; id/`htmlFor` fragile |
| Keyboard | Likely workable; not fully exercised |
| Focus states | Not verified visually in capture |
| Contrast | Low on input borders / placeholder |
| Touch targets | Login CTA adequate; secondary links thin |
| Screen reader | Errors use `aria-invalid` / `aria-describedby` |
| Checkbox readonly until math loads | **Blocks** legal acceptance when protection fails |
| Centered PIN/username | Harder for some users / autofill UX |

---

## 8. Performance audit (qualitative)

- Landing hero carousel + large images: heavy first paint (acceptable if optimized; not measured LCP here).
- Signup math challenge latency → “One moment…” perceived hang.
- Session restore phases (&lt;250ms inline → stalled 5s) are thoughtful, but copy feels system-admin.
- Onboarding photo upload progress exists (“Uploading x/y…”) — good; failure paths use generic fail messages.

---

## 9. Conversion audit (abandonment hypotheses)

| Rank | Friction | Likelihood |
|------|----------|------------|
| 1 | Signup **Continue disabled** when math/protection unavailable | **High** |
| 2 | Long signup wall before any value | **High** |
| 3 | Trust cliff after premium landing | **High** |
| 4 | Phone/WhatsApp copy mismatch + Nigerian phone validation surprises | **Medium** |
| 5 | Email OTP / spam folder friction | **Medium** (not captured) |
| 6 | Onboarding age/gender/city bureaucracy before delight | **Medium** |
| 7 | Progress “Step 4 of 3” erodes polish | **Medium** |
| 8 | First Discover empty → “Adjust preferences” | **Medium** |
| 9 | Session restore stall anxiety | **Low–Medium** |
| 10 | Forgot PIN below fold | **Low–Medium** |

---

## 10. Design system audit

| Token / pattern | Landing | Auth | Member |
|-----------------|---------|------|--------|
| Photography / atmosphere | Strong | None | Strong (Discover) |
| Gradient CTA | Yes | Yes | Yes |
| Compact fintech forms | — | Partial | Strong (`member-fintech`) |
| Spacing language | Generous | Uneven (large void then dense fields) | Compact |
| Motion | Hero carousel | Minimal | Feed |

Auth is a **parallel mini-system**, not a continuation of the landing design language.

---

## 11. Copywriting audit (candidates only — not applied)

| Current | Warmer / clearer candidate |
|---------|----------------------------|
| “Create your account” | “Join BamSignal” / “Start your story” |
| “Let’s get you started — it only takes a minute.” | “A few details. Then you can explore.” (honest length) |
| “One moment…” | “Securing signup — hang tight.” |
| “Please answer correctly.” | “That doesn’t match — try again.” |
| “Put your correct WhatsApp number.” | Align label: “WhatsApp number” |
| “Fix the highlighted fields.” | “Check the fields marked below.” |
| “Restoring your session…” | “Getting you back in…” |
| “Discovery tutorial” | “Quick tip” / “How Discover works” |
| “Better profiles receive more replies.” | “A clear photo helps people reply.” |

---

## 12. Competitive benchmark review

Principles (not visual clones): Airbnb trust + progressive disclosure; Spotify/Duolingo momentum; Monzo/Revolut calm clarity; Apple/Notion/Linear restraint.

| Stage | Score /10 | vs benchmark |
|-------|-----------|--------------|
| Landing | **8** | Strong brand; redundant Join; city empty state weak |
| Authentication | **4** | Generic form; gate risk; trust cliff |
| Trust | **3** | Abandoned after homepage |
| Onboarding | **4** | Correct data, wrong emotional order; progress bug |
| Verification (email OTP) | **5** | Structure ok (code); not visually audited |
| Photo upload | **5** | Functional; not premium storytelling |
| First impression (auth) | **3** | Not memorable as BamSignal |
| Visual design (auth) | **5** | Dark gradient OK; not cohesive with landing |
| Animations | **4** | Landing yes; auth sparse |
| Accessibility | **5** | Basics present; contrast/gate issues |
| Performance feel | **5** | Gate/restore lag hurts |
| Conversion | **3** | Hard blockers + form length |

**Average (~):** 4.5 / 10 for first-session excellence. Landing alone is ~8; post-Join collapses the score.

---

## 13. Prioritized improvements (Highest → Lowest impact)

1. **Never hard-block signup** when math/protection fails — soft degrade + clear recovery (High).  
2. **Carry landing brand into auth** (photography/atmosphere strip + continuous headline language) (High).  
3. **Progressive signup** (identity → contact → PIN → legal) with honest step count (High).  
4. **Trust strip on signup/login** (safety, verification, PIN privacy) (High).  
5. **Fix onboarding progress “Step X of Y” bug** (High / quick win).  
6. **Reorder onboarding for emotion** (intent/photo earlier; demographics lighter) (High).  
7. **Align WhatsApp label/copy** (Medium).  
8. **First Discover welcome path** for empty decks (not only “Adjust preferences”) (Medium).  
9. **Left-align auth fields**; raise input contrast (Medium).  
10. **Warm restore/error microcopy** (Medium).  
11. **Audit/fix auth layout overflow** (duplicate chrome) (Medium).  
12. **Photo quality coaching** as premium feedback, not generic fail (Lower).  

---

## 14. Recommended rebuild strategy

| Phase | Name | Outcome |
|-------|------|---------|
| **4B** | Experience Blueprint | **Approved** — [blueprint](../../architecture/phase4b-experience-blueprint.md): Journey Score 9/10, Golden Rule, delight, Relationship Strength Meter, Guide, D0a–D1, cinematic shell |
| **4C** | Journey Shell + Welcome + Intent + You | Brand-continuous shell; progressive pre-account personal steps; local journey draft |
| **4D** | Secure chapter | Late Account; email/phone verify; soft protection gate; login/reset polish |
| **4E** | Profile chapter | Photo coaching; about; interests; Ready celebration |
| **4F** | First Discover session | Day-0 guided path; warm empty; first Signal teaching |
| **3B** | Discreet enforcement | **After 4F** — checkout + invisibility (3A frozen) |

**Non-negotiable:** users must never feel they are filling forms — guided relationship experience only. If a screen feels like paperwork or could belong to another app, it fails review.

**Do not redesign auth pages one-by-one before blueprint approval.** Do not start 3B before 4F.

---

## Screenshot inventory

Path: `docs/audits/phase4-auth-onboarding/screenshots/`

- `01-landing-mobile.png` — premium hero  
- `01-landing-desktop.png` — desktop attempt (truncation under Emulation)  
- `02-signup-mobile.png` — capture unreliable; prefer a11y snapshot findings  
- `05-login-mobile.png` — Welcome back  
- `05b-login-error-mobile.png` — Invalid username or PIN  
- `06-reset-pin-mobile.png` — Reset PIN email step  
- `09-onboarding-redirect-to-login.png` — `/onboarding` unauthenticated → login  

**Not captured (blocked):** verify OTP, existing account UI, 2FA, restore stall, full onboarding steps, photo crop, member Discover empty.

---

## Honesty bar (explicit)

- Auth still feels like a **generic authentication form**.  
- Onboarding still feels like a **government form** before delight.  
- Restore states risk **eroding trust** when they hang.  
- Premium homepage messaging is **not continued** into signup/onboarding.
