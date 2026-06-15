# BamSignal Final Launch Blocker Audit

**Date:** 15 June 2026  
**Scope:** Launch-critical flows only — no new features, no redesign.  
**Build verified:** `npm run build` ✓ · `npx cap sync android` ✓ · `assembleRelease` + `bundleRelease` ✓

---

## Executive summary

| Area | Status |
|------|--------|
| Signup | **PASS** (code) — blocked by production env if unset |
| Payments | **PASS** (web + Android code) — needs live Paystack + device payment test |
| Android | **PASS** — APK/AAB built, `com.bamsignal.com` |
| Trust/Safety | **PARTIAL** — client flows work; server admin gaps remain |
| Play Console | **PARTIAL** — legal/delete ready; store assets missing |

### Final recommendation

## Ready for Closed Testing: **NO**

Ship to **internal/closed testing** only after:

1. Coolify production env complete (`/health` all green)
2. One live Android Paystack payment verified end-to-end
3. Play reviewer account provisioned on production DB
4. Play Console screenshots + feature graphic uploaded

Web-only closed test with configured env: **possible** once item 1 is done.

---

## 1. Signup

| Item | Result | Notes |
|------|--------|-------|
| Email OTP send | **PASS*** | `POST /api/auth/email-code` → Resend. *Requires `RESEND_API_KEY` in prod.* |
| Email OTP verify + account create | **PASS*** | `signupOtp.js` → Supabase admin. *Requires `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_URL`. `/health` `signupEmail` must be `true`.* |
| WhatsApp phone verification | **PASS** | Fixed broken import in `api/verify/whatsapp/confirm.js`. *Requires `SENDCHAMP_*` env.* Post-onboarding via Settings → Verification. |
| Photo upload (onboarding) | **PASS** | `signupMode` + light `moderateSignupPhotoUpload`; HEIC/empty MIME tolerant; spinner on upload. |
| Onboarding completion | **PASS** | Min 2 photos enforced; `isOnboardingComplete()` aligned with `MIN_PROFILE_PHOTOS`. |
| Session persistence | **PASS** | Supabase session + `userProfile` localStorage; `phoneVerified` no longer auto-set from phone presence; merge on restore/login. |

### Fixes applied (signup)

- `api/verify/whatsapp/confirm.js` — import path `../../../server/...` (was broken `../../`)
- `AuthPage.tsx` — PIN error matches 6-digit `isStrongPin` rules
- `authIdentity.ts` — `phoneVerified` from `meta.phoneVerified`, not `meta.phone`
- `App.tsx` — merge stored `phoneVerified` on login and session restore
- `profile.ts` — onboarding complete requires `MIN_PROFILE_PHOTOS` (2)

### Remaining blockers (signup)

- **Ops:** Production must set `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SENDCHAMP_API_KEY`, `SENDCHAMP_WHATSAPP_SENDER`
- WhatsApp verify is optional in signup funnel (post-onboarding) — acceptable for launch if documented for testers

---

## 2. Payments

| Item | Result | Notes |
|------|--------|-------|
| Upgrade starts cleanly | **PASS** | State machine `idle → initializing`; email required |
| Paystack opens properly | **PASS** | Web: inline JS; Native: Capacitor Browser |
| Payment returns to app | **PASS** | Fixed: native uses `com.bamsignal.com://payment-success` callback; manifest deep links; global `appUrlOpen` handler |
| Premium activates | **PASS** | Verify API → `activateAppUserPremium`; client `setPremiumSnapshot` |
| Failed/cancelled messages | **PASS** | Recovery banner on failed/cancelled only; calm copy |

### Fixes applied (payments)

- `api/paystack/verify.js` — `platform: "native"` → `PAYSTACK_ANDROID_CALLBACK_URL` (`com.bamsignal.com://payment-success`)
- `payments.ts` — sends `platform` on all initialize calls
- `AndroidManifest.xml` — intent filters for custom scheme + HTTPS `/payment/success`
- `paymentState.ts` — parse custom scheme URLs
- `App.tsx` — persistent native `appUrlOpen` stores reference and triggers verify
- `.env.example` — `PAYSTACK_ANDROID_CALLBACK_URL`

### Remaining blockers (payments)

- **Ops:** `PAYSTACK_SECRET_KEY` required in Coolify
- **Ops:** Disable Card channel in Paystack Dashboard (code uses bank_transfer, USSD, mobile_money only)
- **Test:** One real payment on Android APK before closed testing
- HTTPS App Links need `/.well-known/assetlinks.json` on `bamsignal.com` for verified links (custom scheme is primary path)

---

## 3. Android

| Item | Result | Notes |
|------|--------|-------|
| Package `com.bamsignal.com` | **PASS** | `capacitor.config.ts`, `build.gradle`, `MainActivity` |
| Latest web build synced | **PASS** | `npm run build && npx cap sync android` run 15 Jun 2026 |
| APK rebuilt | **PASS** | `android/app/build/outputs/apk/release/app-release.apk` (~8.9 MB) |
| AAB rebuilt | **PASS** | `android/app/build/outputs/bundle/release/app-release.aab` (~8.6 MB) |
| App opens | **PASS*** | Build succeeds; manual install test recommended |
| Signup works | **PASS*** | Code ready; depends on prod API + env |
| Payment flow works | **PASS*** | Code fixed; needs device test with live Paystack |

### Remaining blockers (Android)

- Release signing uses local `key.properties` — ensure same keystore used for Play uploads
- Device QA: install APK, full signup → pay → verify premium

---

## 4. Trust / Safety

| Item | Result | Notes |
|------|--------|-------|
| Report user | **PASS*** | In-app modal → localStorage + `POST /api/member/data?action=report`. *Admin queue reads localStorage only — cross-device reports not visible in admin.* |
| Block user | **PASS*** | Client-only `localStorage` block list. Works per device; no server sync. |
| Contact blocking (chat) | **PASS** | `contactGuard.ts` + `ChatsPage` — phones, handles, off-platform patterns |
| Photo contact-info rejection | **PASS*** | Heuristic + filename patterns; OCR stubbed (no tesseract) |
| Verification queue (admin) | **PASS*** | Server `verification_submissions` + Admin Verify tab. *Requires `DATABASE_URL` + admin auth.* |

### Fixes applied (trust)

- None required for launch-minimum client flows

### Remaining blockers (trust)

- **Non-blocking for closed test:** Server-backed block list, admin reports from `app_reports` table
- Shadow ban is local-only (documented limitation)

---

## 5. Play Console readiness

| Item | Result | Notes |
|------|--------|-------|
| Privacy Policy | **PASS** | https://bamsignal.com/privacy |
| Terms | **PASS** | https://bamsignal.com/terms |
| Contact | **PASS** | https://bamsignal.com/contact + `support@bamsignal.com` |
| Account deletion | **PASS** | https://bamsignal.com/delete-account + contact topic "Delete my account" |
| Reviewer test account | **PASS*** | `scripts/provision-play-reviewer.mjs` — *must run against prod DB before review* |
| Release notes | **PASS** | `PLAY_STORE_RELEASE_NOTES.txt` added |
| Screenshots | **FAIL** | No Play-formatted phone screenshots in repo |
| Feature graphic | **FAIL** | No 1024×500 asset in repo (`public/brand/logo.png` is not store-ready) |

### Fixes applied (Play)

- `/delete-account` legal page + footer link + sitemap
- `ContactForm` — "Delete my account" topic
- `PLAY_STORE_RELEASE_NOTES.txt` — paste-ready blurb

### Remaining blockers (Play)

- Create phone screenshots (min 2) and 1024×500 feature graphic before store listing
- Run `node scripts/provision-play-reviewer.mjs` on production
- Add Play Console Data safety + content rating questionnaires (manual)

---

## Production health checklist

Before closed testing, confirm https://bamsignal.com/health:

```json
{
  "database": "connected",
  "paystack": true,
  "resend": true,
  "signupEmail": true,
  "sendchamp": true
}
```

---

## Fixes applied this audit (summary)

| File | Fix |
|------|-----|
| `api/verify/whatsapp/confirm.js` | Broken server import path |
| `api/paystack/verify.js` | Native Android callback URL |
| `AndroidManifest.xml` | Payment deep links |
| `App.tsx` | Native payment return listener; phoneVerified merge |
| `payments.ts` | `platform: native` on initialize |
| `paymentState.ts` | Parse custom scheme returns |
| `AuthPage.tsx` | PIN validation message |
| `authIdentity.ts` | phoneVerified semantics |
| `profile.ts` | Onboarding photo minimum |
| `footer.ts` / `legalPages.ts` | Delete account page |
| `ContactForm.tsx` | Delete account topic |
| `PLAY_STORE_RELEASE_NOTES.txt` | Store release notes |

---

## Recommended launch sequence

1. Deploy current `main` to Coolify with all env vars
2. Verify `/health` endpoints
3. Test signup + payment on web
4. Install `app-release.apk` — test signup + payment
5. Upload AAB to Play **internal testing** track
6. Add screenshots + feature graphic
7. Provision Play reviewer credentials
8. Promote to **closed testing** after steps 3–7 pass

---

## Verdict

**Codebase:** Launch-critical paths are in good shape after this audit’s blocker fixes.  
**Operations:** Production secrets, store assets, and device QA are the gating items.  
**Closed Testing:** **NO** until production env is verified and one Android payment succeeds.
