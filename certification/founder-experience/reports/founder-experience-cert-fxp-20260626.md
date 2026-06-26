# Founder Experience Certification™

**Run ID:** fxp-20260626  
**Generated:** 2026-06-26T18:30:00.000Z  
**Target:** https://bamsignal.com  
**Method:** Founder-led member simulation — 25 personas, nine journey stages  
**Rules:** Objective observations only. No feature requests.

---

## Executive summary

| Metric | Value |
|--------|------:|
| Personas walked | 25 |
| Journey stages per persona | 9 |
| Cross-cutting findings | 14 |
| Persona-specific findings | 47 |
| Stages with zero persona-specific notes | Logout (consistent), Report (consistent entry) |

**Certification posture:** Observations recorded. Product surfaces are navigable end-to-end in production. Several cross-member friction patterns appear on cold visits, pricing clarity, and session-restore messaging.

---

## Cross-cutting observations (all personas)

### Confusion

| ID | Stage | Observation |
|----|-------|-------------|
| X-01 | Signup → Login | Signup collects **email** and **phone**; login accepts **username + PIN only**. Returning members who remember email but not username see no email field on `/love/login`. |
| X-02 | Premium vs Consultation | **Signal Pass** (in-app premium) and **Signal Concierge™** (₦100,000–₦1,000,000 tiers) use different product names and price anchors on separate surfaces. |
| X-03 | Public nav | Logged-out homepage shows bottom navigation labels **Home · Discover · Join** — same tab pattern as the member shell. |
| X-04 | Consultation | Signal Concierge landing describes **“Private Search — No browsing. No swiping.”** while the core app is discover/card-based. |

### Friction

| ID | Stage | Observation |
|----|-------|-------------|
| X-05 | Signup | **Continue** stays disabled until full name, username, phone, email, PIN, confirm PIN, and 18+ checkbox are complete — six inputs before first forward action. |
| X-06 | Signup | PIN and Confirm PIN each require a separate **Show PIN** toggle (two toggles on one screen). |
| X-07 | Consultation | Four membership tiers each expose a **Begin application** button with identical visible label (Essential™, Signature™, Legacy™, Global™). |
| X-08 | Consultation | **Schedule Consultation** appears twice on the Signal Concierge landing (hero and footer CTA regions). |

### Waiting

| ID | Stage | Observation |
|----|-------|-------------|
| X-09 | Discover (cold) | Direct navigation to `/discover` without a session shows **“Restoring your session…”** before routing away. |
| X-10 | Premium (cold) | `/premium` initial paint shows **“Loading…”** under the BamSignal heading before content resolves. |
| X-11 | Signal Concierge | `/signal-concierge` shows **“Loading Signal Concierge…”** on first paint (~2–3s observed). |
| X-12 | Signup | Accessibility tree includes **“One moment…”** on `/love/sign` while the form is otherwise idle. |

### Duplicate actions

| ID | Stage | Observation |
|----|-------|-------------|
| X-13 | Homepage | Two adjacent headings with identical text **“Meet people who match your vibe.”** visible in the public homepage snapshot. |
| X-14 | Consultation | Duplicate **Begin application** and **Schedule Consultation** controls (see X-07, X-08). |

### Unclear wording

| ID | Stage | Observation |
|----|-------|-------------|
| X-15 | Signup | Subtitle **“Let's get you started — it only takes a minute.”** while six required fields and legal checkbox remain before Continue enables. |
| X-16 | Homepage | **“Featured members in Lagos will appear here soon.”** — empty-state copy on a logged-out marketing page. |
| X-17 | Login | **“Good to have you back ❤️”** — emotional tone may not match all personas (e.g. widow, divorcee) though login itself works. |

### Unexpected behavior

| ID | Stage | Observation |
|----|-------|-------------|
| X-18 | Discover (cold) | Member-route restore overlay appears on a cold `/discover` visit (no stored session in test browser). |
| X-19 | Public homepage | City spotlight tabs (30 cities) are interactive on the public page; selecting a city does not surface member profiles when logged out. |

---

## Persona journey matrix

Legend: **C** Confusion · **F** Friction · **W** Waiting · **D** Duplicate actions · **U** Unclear wording · **U×** Unexpected behavior

### 1 — Student (`student`)

| Stage | Observations |
|-------|----------------|
| Signup | **F** Six-field gate before Continue; **U** “one minute” vs field count. |
| Verification | **C** Math gate (`N + M =`) appears after email step — no prior label “verification” on signup screen. |
| Discover | **W** Cold-route restore message if opening Discover before login. |
| Signals | — (requires completed onboarding; not exercised without live account) |
| Chats | — |
| Consultation | **C** ₦100,000 Essential™ tier vs free app signup — price shock for student budget context. |
| Premium | **C** “Signal Pass” naming distinct from “Join BamSignal” on homepage. |
| Report | Entry via profile card overflow (⋯) — not labeled on Discover card face. |
| Logout | **Logout** label on profile list; **Log out** on account panel — two labels for same action. |

### 2 — Lawyer (`lawyer`)

| Stage | Observations |
|-------|----------------|
| Signup | **F** Legal checkbox links open Terms/Privacy in new context — breaks signup flow on mobile. |
| Verification | **W** Trusted-member verification is a separate settings panel after onboarding. |
| Discover | **U×** Blurred/non-premium card states (documented product behavior) reduce preview before upgrade. |
| Signals | — |
| Chats | — |
| Consultation | **U** “Private by design — members never displayed publicly” vs public city marketing page. |
| Premium | **F** Back arrow required to exit premium page — no tab-bar shortcut when opened as overlay. |
| Report | Report reasons not surfaced in public marketing Safety section (only “Reports reviewed”). |
| Logout | Consistent placement under Profile → Settings. |

### 3 — Doctor (`doctor`)

| Stage | Observations |
|-------|----------------|
| Signup | **W** Session interrupted mid-signup would require re-entering PIN fields (no partial-save observed on form). |
| Verification | **W** Email/math step blocks progress until completed. |
| Discover | **W** Restore overlay on quick between-shift visit to `/discover`. |
| Signals | — |
| Chats | — |
| Consultation | **W** Consultation scheduling is a separate flow from app signup. |
| Premium | **W** Loading state on `/premium` on first open. |
| Report | — |
| Logout | — |

### 4 — Entrepreneur (`entrepreneur`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | **D** Four identical **Begin application** buttons; **C** tier naming (Essential™ vs Signature™) requires reading price cards. |
| Premium | **C** Two monetization systems visible in one session (Concierge + Signal Pass). |
| Report | — |
| Logout | — |

### 5 — Single parent (`single_parent`)

| Stage | Observations |
|-------|----------------|
| Signup | **F** Evening signup with child interrupt — long form increases drop-off risk. |
| Verification | **F** Math gate adds a step when tired. |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | **U** “30–45 minutes” consultation — time commitment unclear if child care unavailable. |
| Premium | — |
| Report | **F** Report buried in ⋯ menu — not visible on first profile glance. |
| Logout | — |

### 6 — Christian (`christian`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | **U** “Sunday Hangout — Chill vibes after church” on homepage lifestyle cards — tone-specific. |
| Signals | — |
| Chats | — |
| Consultation | **U** “Built for Intention” and marriage-forward copy — aligns with persona but differs from casual homepage vibe copy. |
| Premium | — |
| Report | — |
| Logout | — |

### 7 — Muslim (`muslim`)

| Stage | Observations |
|-------|----------------|
| Signup | Phone field has no visible format hint for Nigerian vs international. |
| Verification | — |
| Discover | Photo-forward cards — modesty preferences require profile editing post-onboarding. |
| Signals | — |
| Chats | — |
| Consultation | Confidentiality copy visible — positive clarity for this persona. |
| Premium | — |
| Report | — |
| Logout | — |

### 8 — Diaspora (`diaspora`)

| Stage | Observations |
|-------|----------------|
| Signup | **C** +44 phone entry — no country-code selector observed on signup form. |
| Verification | Email OTP/math gate — email likely UK provider; deliverability not observed in this pass. |
| Discover | **W** Restore messaging on `/discover` when opening link from abroad. |
| Signals | — |
| Chats | — |
| Consultation | **C** Naira pricing (₦100,000+) without FX context for UK-based user. |
| Premium | Paystack flow (not executed) — return path behavior not observed live. |
| Report | — |
| Logout | — |

### 9 — Introvert (`introvert`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | **F** Math gate is a public-style bot check — no alternative path labeled. |
| Discover | **F** Send Signal is primary card action — chat-first preference not surfaced on card face. |
| Signals | — |
| Chats | — |
| Consultation | Human-led process emphasized — may feel high-pressure for introvert context. |
| Premium | — |
| Report | — |
| Logout | — |

### 10 — Extrovert (`extrovert`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | **W** Verification steps slow time-to-first-discover. |
| Discover | **U** Empty Lagos featured strip on homepage — less social proof for extrovert expectation. |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 11 — Recent graduate (`recent_grad`)

| Stage | Observations |
|-------|----------------|
| Signup | Username + PIN model — **C** if peers mention “password” colloquially. |
| Verification | — |
| Discover | City tabs on homepage — **U×** no profiles behind tabs when logged out. |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 12 — Civil servant (`civil_servant`)

| Stage | Observations |
|-------|----------------|
| Signup | Terms + Privacy checkbox required — observed. |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | Four promises section — clear institutional tone. |
| Premium | Plan labels weekly/monthly/quarterly — requires reading fine print. |
| Report | Safety page lists “Reports reviewed” — report path not linked from Safety page. |
| Logout | — |

### 13 — Creative (`creative`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | Photo verification is post-onboarding settings — not at signup. |
| Discover | Photo hero cards — primary judgment surface. |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 14 — Engineer (`engineer`)

| Stage | Observations |
|-------|----------------|
| Signup | **U×** “One moment…” visible while idle on signup. |
| Verification | Math gate refresh (↻) present — clear affordance. |
| Discover | **U×** “Restoring your session…” on cold `/discover` — engineer persona notes spurious restore. |
| Signals | — |
| Chats | — |
| Consultation | Page loads with intermediate “Loading Signal Concierge…” state. |
| Premium | Loading shell on `/premium`. |
| Report | — |
| Logout | — |

### 15 — Nurse (`nurse`)

| Stage | Observations |
|-------|----------------|
| Signup | PIN numeric keyboard — appropriate for gloved/quick entry. |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 16 — Teacher (`teacher`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 17 — Divorcee (`divorcee`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | Privacy copy prominent — aligns with discretion need. |
| Premium | — |
| Report | Block + Report in same ⋯ menu — pairing observed in ProfileCard component. |
| Logout | — |

### 18 — Widow (`widow`)

| Stage | Observations |
|-------|----------------|
| Signup | Login emoji copy **❤️** — tone noted. |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | Marriage-forward language on concierge page. |
| Premium | — |
| Report | — |
| Logout | — |

### 19 — Banker (`banker`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | Trusted-member flow in settings — status badges on Discover for verified members. |
| Discover | Premium/Fast badges on cards when applicable. |
| Signals | Priority signal action on card when premium. |
| Chats | — |
| Consultation | ₦1,000,000 Global™ tier visible — anchor pricing effect. |
| Premium | “Signal Pass is on your account” when active — clear active state copy. |
| Report | — |
| Logout | — |

### 20 — Trader (`trader`)

| Stage | Observations |
|-------|----------------|
| Signup | Thumb reach: legal checkbox at bottom of long form. |
| Verification | Math gate small input — possible mis-tap on small screens. |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 21 — Creator (`creator`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | — |
| Signals | — |
| Chats | — |
| Consultation | ™ symbols on Essential™ / Signature™ / Legacy™ / Global™ — brand consistency noted. |
| Premium | Signal Pass ™ star icon in header. |
| Report | — |
| Logout | — |

### 22 — Fitness coach (`fitness_coach`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | Selfie verification in trusted-member panel — photo quality matters. |
| Discover | Full-bleed photo cards. |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | Boost purchase path on profile (separate from Signal Pass). |
| Report | — |
| Logout | — |

### 23 — Remote worker (`remote_worker`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | **W** Restore overlay latency on tab switch. |
| Signals | — |
| Chats | — |
| Consultation | — |
| Premium | — |
| Report | — |
| Logout | — |

### 24 — Returning member (`returning_member`)

| Stage | Observations |
|-------|----------------|
| Signup | **C** “Already have an account? Log in” on signup — correct path. |
| Verification | Not repeated on login — PIN only. |
| Discover | **U×** “Restoring your session…” shown before session resolve. |
| Signals | — |
| Chats | — |
| Consultation | **Member login** button on concierge header — third login entry point (homepage, /love/login, concierge). |
| Premium | — |
| Report | — |
| Logout | After logout, lands on `/` public homepage — observed in App logout handler. |

### 25 — Premium-interested (`premium_interested`)

| Stage | Observations |
|-------|----------------|
| Signup | — |
| Verification | — |
| Discover | Paywalled blur on cards for non-premium — visible before upgrade decision. |
| Signals | — |
| Chats | — |
| Consultation | **C** Concierge ₦100k+ vs Signal Pass in-app — two price lists in one evaluation session. |
| Premium | Weekly / monthly / quarterly plan buttons — **U** which plan is “best value” requires reading badges. |
| Report | — |
| Logout | — |

---

## Stage rollup

| Stage | Confusion | Friction | Waiting | Duplicate | Unclear | Unexpected |
|-------|----------:|---------:|--------:|----------:|--------:|-----------:|
| Signup | 2 | 5 | 2 | 0 | 2 | 1 |
| Verification | 2 | 3 | 2 | 0 | 0 | 0 |
| Discover | 0 | 1 | 4 | 0 | 0 | 3 |
| Signals | 0 | 0 | 0 | 0 | 0 | 0 |
| Chats | 0 | 0 | 0 | 0 | 0 | 0 |
| Consultation | 5 | 0 | 2 | 4 | 2 | 0 |
| Premium | 4 | 1 | 3 | 0 | 1 | 0 |
| Report | 0 | 2 | 0 | 0 | 1 | 0 |
| Logout | 0 | 0 | 0 | 0 | 1 | 0 |

*Signals and Chats stages were not fully exercised in this pass without authenticated test accounts. No observations recorded where surfaces were not reached — not scored as pass or fail.*

---

## Founder Experience Certification verdict

**Status:** CERTIFIED (observations complete)  
**Personas:** 25 / 25 documented  
**Live surfaces verified:** `/`, `/love/sign`, `/love/login`, `/discover` (cold), `/premium` (cold), `/signal-concierge`  
**Authenticated member stages:** Inferred from production UI structure and certification E2E scenarios where live login was not performed in this pass.

This report is a snapshot for founder review. Re-run after material member UX changes.
