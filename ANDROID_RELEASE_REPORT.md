# Android Release Report

**Generated:** 2026-06-15  
**Sprint:** Android release build + Play Console closed testing prep

---

## Build status

| Step | Status |
|------|--------|
| Web build (`npm run build`) | **PASS** |
| Capacitor sync (`npx cap sync android`) | **PASS** |
| Release APK (`assembleRelease`) | **PASS** |
| Debug APK (`assembleDebug`) | **PASS** |
| Release AAB (`bundleRelease`) | **PASS** |

**Note:** Gradle requires Java 21. Use Android Studio JBR:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

System Java 25 fails with Gradle 8.13 (`Unsupported class file major version 69`).

---

## Artifacts

| Artifact | Path | Size |
|----------|------|------|
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | 8.5 MB |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | 9.6 MB |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | 8.2 MB |

---

## App identity

| Field | Value |
|-------|-------|
| App name | BamSignal |
| Package / applicationId | `com.bamsignal.app` |
| versionName | `1.0.0` |
| versionCode | `1` |
| minSdkVersion | 23 |
| targetSdkVersion | 35 |
| compileSdkVersion | 35 |

Verified via `aapt dump badging` on release APK.

---

## Signing status

| Check | Result |
|-------|--------|
| Upload keystore present | **YES** — `android/app/bamsignal-upload-key.jks` (gitignored) |
| key.properties present | **YES** — `android/key.properties` (gitignored) |
| Release APK signed | **YES** — CN=BamSignal, RSA 2048 |
| Release AAB signed | **YES** — `signReleaseBundle` task completed |

Secrets were **not** committed to Git.

---

## Capacitor configuration

| Setting | Value |
|---------|-------|
| appId | `com.bamsignal.app` |
| appName | `BamSignal` |
| webDir | `dist` |
| Remote server URL | **Removed** — release loads bundled `dist` assets |
| Dev live reload | Set `CAP_SERVER_URL` env var only for local dev |

Synced `capacitor.config.json` in Android assets confirms no `server.url` in release build.

---

## Android branding

| Item | Status |
|------|--------|
| Launcher icons | **Updated** — generated from `public/brand/logo.png` at all densities |
| Adaptive icon foreground | **Updated** — `mipmap-*/ic_launcher_foreground.png` |
| Adaptive icon background | **Updated** — `#1A0A2E` |
| Splash screen | **Updated** — `drawable/splash_logo.png` on `#101923` |
| Theme colors | **Updated** — `values/colors.xml` (pink `#E91E8C`, purple `#1A0A2E`) |
| App label | BamSignal (`strings.xml`) |
| Default Capacitor icon | **Removed** |

Regenerate icons after logo changes:

```bash
npm run generate:android-icons
```

---

## Permissions audit

| Permission | Included | Reason |
|------------|----------|--------|
| `INTERNET` | Yes | API calls, auth, payments |
| `RECORD_AUDIO` | Yes | Voice intro (`getUserMedia` in WebView) |
| `MODIFY_AUDIO_SETTINGS` | Yes | WebView audio recording compatibility |
| Camera | No | Photo upload uses web file picker |
| Storage | No | Not required for file picker on modern Android |
| Location | No | Not used |

---

## Local device test status

| Check | Result |
|-------|--------|
| `adb devices` | **No device connected** at build time |
| `adb install -r app-release.apk` | **Not run** — no attached device/emulator |

**Manual test checklist** (run when device is available):

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

- [ ] App opens (no white screen)
- [ ] Signup / login
- [ ] Onboarding flow
- [ ] Discover loads
- [ ] Send Signal
- [ ] Inbox / Likes
- [ ] Photo upload
- [ ] Voice intro (microphone permission prompt)
- [ ] Payment flow opens (Paystack browser)
- [ ] Android back button
- [ ] Dark / light mode

---

## Play Console upload readiness

| Requirement | Ready |
|-------------|-------|
| Signed AAB built | **YES** |
| Package name correct | **YES** |
| Version set | **YES** |
| Branding updated | **YES** |
| Checklist doc | **YES** — `PLAY_CONSOLE_UPLOAD_CHECKLIST.md` |
| Tester invite template | **YES** — `TESTER_INVITE_MESSAGE.md` |
| Signing documentation | **YES** — `ANDROID_RELEASE_NOTES.md` |
| Closed test link | **Pending** — create in Play Console |
| 12+ testers for 14 days | **Pending** — recruit ~20 testers |
| Store listing assets | **Pending** — screenshots, feature graphic |

**Overall:** **Ready to upload AAB to closed testing** after store listing assets and tester list are prepared.

---

## Blockers

### Mobile (resolved this sprint)

- ~~Remote-only Capacitor server URL~~ → fixed; bundled assets
- ~~Default Capacitor launcher icon~~ → replaced with BamSignal branding
- ~~versionName 1.0.8 / versionCode 9~~ → reset to `1.0.0` / `1`

### Mobile (remaining)

- **No device attached** — local install QA not yet executed
- **Java 25 incompatible** — document `JAVA_HOME` for release builds (see above)

### Backend (affects tester experience)

From production validation — not Android build blockers, but testers will hit:

- `DATABASE_URL` not set → discover/signals/messages return empty or 503
- Paystack `initialize` may return HTTP 502 on server

Recommend fixing backend before wide closed test, or warn testers in invite message.

---

## Files changed (safe to commit)

- `capacitor.config.ts`
- `package.json` (android icon + release scripts)
- `scripts/generate-android-icons.mjs`
- `android/app/build.gradle` (versioning)
- `android/app/src/main/AndroidManifest.xml` (permissions)
- `android/app/src/main/res/**` (icons, splash, colors, styles)
- `.gitignore`, `android/.gitignore`
- `android/key.properties.example`
- Documentation: `ANDROID_RELEASE_NOTES.md`, `PLAY_CONSOLE_UPLOAD_CHECKLIST.md`, `TESTER_INVITE_MESSAGE.md`, `ANDROID_RELEASE_REPORT.md`

## Files NOT committed

- `android/app/bamsignal-upload-key.jks`
- `android/key.properties`
- `*.apk`, `*.aab` (gitignored)
