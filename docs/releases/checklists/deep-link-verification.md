# Deep Link Verification Checklist

Use before every Android release and whenever payment return paths, domains, or intent filters change.

**Context:** Google Play may warn *"One deep link may be failing because web domains aren't associated."* This checklist ensures Digital Asset Links, manifest intent filters, and server-hosted verification files align.

**Package:** `com.bamsignal.com`  
**Production domain:** `bamsignal.com`  
**Custom scheme:** `com.bamsignal.com` (see `@string/custom_url_scheme`)

---

## Pre-flight

- [ ] Release engineer identified
- [ ] Release keystore SHA-256 fingerprint documented
- [ ] Testing device or emulator with app installed from release build (not debug, for App Links)

---

## assetlinks.json

**Source:** `public/.well-known/assetlinks.json`  
**Served at:** `https://bamsignal.com/.well-known/assetlinks.json`

- [ ] File committed in repo
- [ ] Express serves from dist (see `server/app.js` / launch infrastructure)
- [ ] `package_name` is `com.bamsignal.com`
- [ ] `sha256_cert_fingerprints` matches **release** signing key (not debug)
- [ ] JSON valid (no trailing commas)
- [ ] `Content-Type: application/json` (no `.json` extension redirect issues)

### Verification command

```bash
curl -sS "https://bamsignal.com/.well-known/assetlinks.json" | jq .
```

**Expected:** Array with `delegate_permission/common.handle_all_urls` relation and correct fingerprint.

---

## apple-app-site-association

**Source:** `public/.well-known/apple-app-site-association`  
**Served at:** `https://bamsignal.com/.well-known/apple-app-site-association`

- [ ] File present (iOS future / Universal Links)
- [ ] `TEAMID` replaced with Apple Developer Team ID before iOS ship
- [ ] Paths include `/payment/success*`

### Verification command

```bash
curl -sS "https://bamsignal.com/.well-known/apple-app-site-association" | jq .
```

**Expected:** Valid JSON with `applinks.details` entry (Team ID placeholder acceptable until iOS launch).

---

## Android Manifest

**File:** `android/app/src/main/AndroidManifest.xml`

### Launcher intent

- [ ] `MAIN` / `LAUNCHER` intent filter present

### Custom scheme — auth callback

- [ ] `android:scheme="@string/custom_url_scheme"`
- [ ] `android:host="auth-callback"`

### Custom scheme — payment success

- [ ] `android:scheme="@string/custom_url_scheme"`
- [ ] `android:host="payment-success"`

### HTTPS App Links (autoVerify)

- [ ] `android:autoVerify="true"` on HTTPS intent filter
- [ ] `android:scheme="https"`
- [ ] `android:host="bamsignal.com"`
- [ ] `android:pathPrefix="/payment/success"`

---

## Intent Filters Summary

| Type | Scheme | Host | Path | autoVerify |
|------|--------|------|------|------------|
| Custom | `com.bamsignal.com` | `auth-callback` | — | false |
| Custom | `com.bamsignal.com` | `payment-success` | — | false |
| App Link | `https` | `bamsignal.com` | `/payment/success` | true |

---

## Digital Asset Links

- [ ] Domain serves HTTPS with valid certificate
- [ ] No redirect chain breaking `/.well-known/` path
- [ ] Fingerprint matches Google Play App Signing certificate (if Play App Signing enabled, use Play Console cert)

### Google Statement List Generator

Use [Google Digital Asset Links tool](https://developers.google.com/digital-asset-links/tools/generator) to validate statement.

---

## App Links

- [ ] Only production domain in `autoVerify` filters
- [ ] No conflicting intent filters from dependencies
- [ ] `android:launchMode="singleTask"` on MainActivity (payment return handling)

---

## Associated Domains

- [ ] iOS: Associated Domains entitlement (future) will list `applinks:bamsignal.com`
- [ ] Android: App Links domain association via assetlinks only

---

## HTTPS

```bash
curl -sI "https://bamsignal.com/.well-known/assetlinks.json" | head -5
```

- [ ] HTTP 200
- [ ] Valid TLS certificate
- [ ] No mixed-content issues on `/payment/success`

---

## Domain Ownership

- [ ] DNS for `bamsignal.com` points to production server
- [ ] Coolify / reverse proxy forwards `/.well-known/*` to Node app
- [ ] Staging domain (if any) does **not** reuse production assetlinks without separate file

---

## Google Play Validation

In Play Console → App → **Deep links**:

- [ ] Domains listed and verification status reviewed
- [ ] Warning *"web domains aren't associated"* investigated
- [ ] Fix: update `assetlinks.json` fingerprint or manifest host/path mismatch

**Common causes:**

1. Debug SHA-256 in assetlinks instead of release / Play App Signing cert
2. `assetlinks.json` not reachable at production URL
3. `pathPrefix` mismatch between manifest and actual Paystack callback URL
4. Deploy stale web assets without updated `.well-known` files

---

## ADB Verification Commands

Replace package if needed. Run on device with release APK/AAB installed.

### Dump app link verification state

```bash
adb shell pm get-app-links com.bamsignal.com
```

**Expected:** `bamsignal.com` domain with `verified` status (may take time after install).

### Force re-verification (Android 12+)

```bash
adb shell pm verify-app-links --re-verify com.bamsignal.com
```

### Test custom scheme — payment success

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "com.bamsignal.com://payment-success?reference=test-ref"
```

**Expected:** BamSignal opens; app handles payment return (no browser chooser for custom scheme).

### Test HTTPS App Link — payment success

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "https://bamsignal.com/payment/success?reference=test-ref"
```

**Expected (verified):** Opens directly in BamSignal app.  
**Expected (unverified):** Disambiguation dialog or browser — fix assetlinks/manifest.

### Test auth callback

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "com.bamsignal.com://auth-callback"
```

**Expected:** App opens to auth handler.

---

## Expected Results Summary

| Check | Pass Criteria |
|-------|---------------|
| assetlinks.json HTTP | 200, valid JSON, correct package + fingerprint |
| apple-app-site-association | 200, valid JSON |
| Manifest intent filters | Custom + HTTPS filters match table above |
| `pm get-app-links` | Domain verified (release build) |
| Custom scheme ADB test | App opens, no crash |
| HTTPS App Link ADB test | App opens without disambiguation when verified |
| Play Console deep links | No unresolved domain association warnings |

---

## Sign-off

| Field | Value |
|-------|-------|
| Release version | |
| Android versionCode | |
| Keystore fingerprint used | |
| Verified by | |
| Date | |
| Result | ☐ Pass ☐ Fail ☐ Pass with known issues |

**Notes:**

---

## References

- [Release Management System](../README.md)
- [Production release checklist](./production-release-checklist.md)
- `public/.well-known/assetlinks.json`
- `android/app/src/main/AndroidManifest.xml`
- [Android App Links documentation](https://developer.android.com/training/app-links)
