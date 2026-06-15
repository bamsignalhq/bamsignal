# Android Final Build Report

**Date:** 2026-06-15  
**Sprint:** BamSignal Android final build refresh  
**Status:** Build successful — ready for Play Console upload (device QA pending)

---

## Summary

Release **APK** and **AAB** were built from the latest production web bundle (`npm run build` + `npx cap sync android`). **versionCode** bumped to **2** for Play Console (assumes versionCode 1 was previously uploaded or reserved).

---

## 1. Web sync

| Step | Status |
|------|--------|
| `npm install` | Pass |
| `npm run build` | Pass — `index-BqsOw4Ff.js`, `index-xxp_Go_2.css` |
| `npx cap sync android` | Pass — web assets copied to `android/app/src/main/assets/public` |

### Bundled production changes confirmed in APK

| Area | Evidence in APK |
|------|-----------------|
| Hero images (WebP) | `hero-lagos-young-professionals-01/02/03.webp` + HTML preload |
| Homepage / City Spotlight | Latest JS bundle `index-BqsOw4Ff.js` |
| Auth session persistence | Included in current web bundle |
| Paystack / contact fixes | Included in current web bundle |
| Profile / dashboard cleanup | Included in current web bundle |

---

## 2. Android config

| Field | Value | Status |
|-------|-------|--------|
| App name | BamSignal | `strings.xml` |
| Package | `com.bamsignal.app` | `build.gradle` + manifest |
| versionName | **1.0.0** | Unchanged |
| versionCode | **2** | Incremented from 1 |
| minSdk | 23 | |
| targetSdk | 35 | |
| Web assets | Bundled `dist/` (no remote Capacitor server URL) | `capacitor.config.ts` |

**Safe commit candidate:** `android/app/build.gradle` (versionCode only).  
**Not committed:** `key.properties`, keystore files (gitignored).

---

## 3. Release builds

Built with:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android
./gradlew clean assembleRelease bundleRelease
```

| Output | Path | Size |
|--------|------|------|
| **APK** (device testing) | `android/app/build/outputs/apk/release/app-release.apk` | **8.5 MB** |
| **AAB** (Play Console) | `android/app/build/outputs/bundle/release/app-release.aab` | **8.2 MB** |

**Gradle result:** `BUILD SUCCESSFUL`

### Java note

Default system Java **25** fails Gradle (`Unsupported class file major version 69`). Use Android Studio JBR (Java **21**):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

---

## 4. Signing

| Check | Result |
|-------|--------|
| `key.properties` present locally | Yes (gitignored) |
| Release signing config applied | Yes — `validateSigningRelease` passed |
| APK signer | **CN=BamSignal, OU=Mobile, O=BamSignal** |
| Debug build | No — `assembleRelease` / `bundleRelease` |

---

## 5. Device test (APK)

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

| Check | Status |
|-------|--------|
| Device connected | **No** — `adb devices` empty at build time |
| Install | **Not run** — no device attached |
| Manual QA checklist | **Pending** on physical device |

**Recommended on-device smoke test:**

- App opens, no white screen
- Login persists after force-close
- Signup / OTP / onboarding
- Discover, profile, send/accept signal, inbox
- Contact form, Paystack checkout opens in browser
- Hero images load (bundled WebP)
- Back button behavior

---

## 6. Play Console readiness

| Requirement | Status |
|-------------|--------|
| Signed AAB | Yes |
| Package `com.bamsignal.app` | Yes |
| versionCode **2** / versionName **1.0.0** | Yes |
| App name BamSignal | Yes |
| Release build (not debug) | Yes |
| BamSignal launcher icons | Yes — custom `ic_launcher` mipmaps |
| No legacy sports/prediction branding | Yes — BamSignal web + icons |
| Permissions | `INTERNET`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` only (voice intro) |

**Upload:** `android/app/build/outputs/bundle/release/app-release.aab` → Closed testing track.

---

## 7. Blockers / follow-ups

| Item | Severity | Action |
|------|----------|--------|
| No device for adb install | Medium | Install APK on test phone and run smoke checklist |
| Java 25 default JDK | Low | Always set `JAVA_HOME` to Android Studio JBR before Gradle |
| Commit versionCode bump | Optional | Commit `android/app/build.gradle` only if you want version tracked in git |
| Store listing assets | Info | Screenshots / feature graphic still manual in Play Console |

---

## 8. Quick reference

```bash
# Full refresh (from repo root)
npm install && npm run build && npx cap sync android

# Release builds
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew clean assembleRelease bundleRelease

# Device install
adb install -r app/build/outputs/apk/release/app-release.apk
```

**Goal:** Test on device with the APK, then upload the AAB to Google Play closed testing immediately.
