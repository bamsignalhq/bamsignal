# Google Play Console Upload Checklist

**App:** BamSignal  
**Package:** `com.bamsignal.app`  
**Version:** `1.0.0` (versionCode `1`)  
**AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## App basics

| Field | Value |
|-------|-------|
| App name | BamSignal |
| Default language | English (United States) |
| App type | App |
| Category | Dating (or Social, if Dating unavailable in your region) |
| Free or paid | Free |
| Contains ads | No |
| Target age | 18+ (dating app) |

---

## Required store listings

Prepare before first upload:

- [ ] Short description (max 80 chars)
- [ ] Full description
- [ ] App icon (512×512 PNG — use `public/brand/logo.png` or export from generated assets)
- [ ] Feature graphic (1024×500)
- [ ] Phone screenshots (minimum 2, recommended 4–8)
- [ ] 7-inch tablet screenshots (optional but recommended)
- [ ] Contact email for store listing

---

## Required policy URLs

| Policy | URL |
|--------|-----|
| Privacy Policy | https://bamsignal.com/privacy |
| Terms of Service | https://bamsignal.com/terms |
| Safety | https://bamsignal.com/safety |
| Contact / support | https://bamsignal.com/contact |
| Account deletion | https://bamsignal.com/privacy (covers deletion requests via contact) |

Confirm all URLs load over HTTPS and match in-app legal pages.

---

## Data safety form

Declare accurately based on app behavior:

- [ ] Email, phone, profile photos, bio, preferences collected
- [ ] Messages and signals stored (when `DATABASE_URL` is connected)
- [ ] Payment data handled by Paystack (not stored directly by app)
- [ ] Microphone used for optional voice intro recording
- [ ] Data encrypted in transit (HTTPS)
- [ ] Users can request account/data deletion via contact

---

## Content rating

- [ ] Complete IARC questionnaire in Play Console
- [ ] Expect **Mature 17+** or **18+** for dating/social content
- [ ] Declare user-generated content, messaging, and reporting features

---

## App access

If login is required:

- [ ] Provide test credentials in Play Console “App access” section
- [ ] Or mark all functionality available without special access if guest flows work

---

## Closed testing track

### Setup

1. [ ] Create **Closed testing** track (e.g. “Closed test – BamSignal v1.0.0”)
2. [ ] Upload `app-release.aab`
3. [ ] Add release notes (see below)
4. [ ] Create email list or Google Group for testers
5. [ ] Copy closed testing opt-in link
6. [ ] Send invite using `TESTER_INVITE_MESSAGE.md`

### Tester requirements (Google Play)

- [ ] **Minimum 12 testers** opted in
- [ ] Testers must remain opted in **continuously for 14 days**
- [ ] Recommend recruiting **20 testers** to account for drop-off

### Suggested release notes

```
BamSignal closed testing build.

This release includes:
• Signup and onboarding
• Nigerian state and city selection
• Discover and Signals
• Inbox messaging
• Profile preferences
• Safety and reporting
• Premium payment flows
```

---

## Pre-upload technical checks

- [x] Package name: `com.bamsignal.app`
- [x] versionName: `1.0.0`
- [x] versionCode: `1`
- [x] AAB signed with upload keystore
- [x] Target SDK 35
- [x] Min SDK 23
- [ ] Play App Signing enrolled (recommended — let Google manage app signing key)
- [ ] Upload key certificate registered in Play Console (if using Play App Signing)

If Play Console rejects duplicate `versionCode`, increment in `android/app/build.gradle` and rebuild:

```gradle
versionCode 2
versionName "1.0.1"
```

---

## Post-upload

- [ ] Resolve any policy or pre-launch report issues
- [ ] Monitor crash reports (Play Console Vitals)
- [ ] Collect tester feedback for 14-day period
- [ ] Fix blockers before promoting to production

---

## Known production blockers (backend)

From `PRE_LAUNCH_VALIDATION_REPORT.md` — mobile build is ready, but live features depend on:

- `DATABASE_URL` configured in Coolify (signals, matches, messages)
- Paystack checkout initialize working on server

Testers may see empty discover or payment errors until backend is connected.
