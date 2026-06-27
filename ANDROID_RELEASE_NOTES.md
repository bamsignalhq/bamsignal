# Android Release Signing Notes

**Do not commit signing secrets to GitHub.**

## What the two files in `android/app/` are

| File | Purpose | Related to Play upload signing? |
|------|---------|--------------------------------|
| **`bamsignal-upload-key.jks`** | **Release signing keystore** — private key Gradle uses to sign AAB/APK | **YES** — this must match Play’s upload certificate |
| **`google-services.json`** | **Firebase config** — push notifications, FCM, project ID for `com.bamsignal.com` | **NO** — unrelated to AAB signing; safe to commit (public client config) |

The **`build/outputs/bundle/release/app-release.aab`** file is the signed output. It does not contain a separate signing key — only a **public certificate embedded** at build time from whatever `.jks` was used.

---

## Keystore

| Field | Value |
|-------|-------|
| **Filename** | `android/app/bamsignal-upload-key.jks` |
| **Alias** | `bamsignal_upload` |
| **Algorithm** | RSA 2048, SHA384withRSA |
| **Certificate** | CN=BamSignal, O=BamSignal, L=Lagos, C=NG |

Store a backup of the keystore and passwords in a secure password manager or offline vault. **If you lose this keystore, you cannot publish updates to the same Play Console app.**

### Play Console upload certificate (required)

Google Play only accepts AABs signed with the **upload key** registered for the app.

| | SHA-1 fingerprint |
|---|-------------------|
| **Active upload key (approved 2026-06)** | `71:BA:6A:A2:70:98:94:CB:45:64:83:F2:36:3E:C9:D6:22:D6:6E:67` |
| **SHA-256 (App Links / assetlinks)** | `5C:85:43:2F:5E:13:F2:B7:2B:C3:52:46:C0:C5:F6:F5:65:B5:A5:19:82:D8:A3:A1:64:80:4F:6A:7D:52:7B:BB` |
| **Legacy upload key (pre-reset)** | `85:64:EC:E7:77:F3:57:9E:D7:B5:0F:21:98:78:B2:AB:70:1F:81:71` |

Upload key reset was **approved**. `bamsignal-upload-key.jks` on this machine matches the active Play upload certificate (`71:BA:6A…`).

Scan for backups:

```bash
npm run android:scan-keystores
# or extra paths:
ANDROID_KEYSTORE_SEARCH="$HOME/iCloud Drive/Backup:$HOME/Google Drive" npm run android:scan-keystores
```

Verify before every release:

```bash
npm run android:verify-upload-key
```

If you see a fingerprint mismatch, **do not upload the AAB**. Find the original upload keystore backup or reset the upload key in Play Console.

### Wrong signing key — recovery

1. **Find the original keystore** whose SHA-1 is `85:64:EC:…` (password manager, old laptop, cloud backup, team member).
2. Place it at `android/app/bamsignal-upload-key.jks` (or another path) and update `android/key.properties` `storeFile`.
3. Run `npm run android:verify-upload-key` — must print `Android upload key OK`.
4. Update `public/.well-known/assetlinks.json` `sha256_cert_fingerprints` to match the **Play upload** cert (not the wrong local one).
5. Rebuild: `npm run android:release` and upload the new AAB.

**If the original keystore is lost:** Play Console → **App integrity** → **App signing** → **Request upload key reset**. Upload `play-store/play-upload-certificate.pem`. Approval is often **hours to 1–2 days** (not always 3). While waiting, search iCloud/Google Drive/password manager for `.jks` backups.

**Urgent:** Play Console → **Help** → **Contact support** → explain upload key mismatch and request expedited reset.

**Never** run `keytool -genkeypair` for a new keystore on an app that already exists in Play Console unless you have completed an upload key reset.

### Upload key reset approved (after Google)

When Play Console shows the new upload certificate matching your local keystore (`71:BA:6A…`):

1. Edit `play-store/signing-status.json`:
   ```json
   "uploadKeyResetApproved": true,
   "activeExpectedSha1": "71:BA:6A:A2:70:98:94:CB:45:64:83:F2:36:3E:C9:D6:22:D6:6E:67"
   ```
2. Run `npm run android:verify-upload-key` — must pass.
3. Run `npm run android:release` and upload the new AAB.

## key.properties

| Field | Value |
|-------|-------|
| **Location** | `android/key.properties` (gitignored) |
| **Referenced from** | `android/app/build.gradle` |

Example template (copy to `android/key.properties` and fill in values locally):

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=bamsignal_upload
storeFile=bamsignal-upload-key.jks
```

`storeFile` is relative to the `android/app/` module directory.

## Generate a new keystore (only if missing)

```bash
keytool -genkeypair -v \
  -keystore android/app/bamsignal-upload-key.jks \
  -alias bamsignal_upload \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storetype JKS
```

## Gitignore

The following must never be committed:

- `*.jks`
- `*.keystore`
- `android/key.properties`

## Release build (one command)

Auto-bumps `versionCode` / `versionName`, cleans old artifacts, builds web + Capacitor, and outputs signed APK + AAB:

```bash
npm run android:release
```

The script updates `android/app/build.gradle`, `src/buildInfo.ts`, `public/sw.js` (service worker cache), then prints the exact AAB path to upload to Play Console.

Requires `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, and `android/key.properties` for signing.

Use Java 17 or 21 (Android Studio JBR). System Java 25 is not compatible with Gradle 8.13.

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npm run android:release
```

### Manual steps (if needed)

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npm run build
npx cap sync android
cd android
./gradlew clean bundleRelease assembleRelease
```

## Future: thin WebView shell (optional)

If we want UI changes to appear without uploading a new AAB every time, the Android app could become a thin WebView shell that loads `https://bamsignal.com`. Trade-offs:

- Google Play may still require store updates for native/SDK changes
- Offline support is reduced
- Store review expectations for hybrid apps can differ

For now, use the packaged Capacitor release (`npm run android:release`).

## Outputs

| Artifact | Path |
|----------|------|
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` |

## Play Console

Upload the **AAB** (`app-release.aab`) to a closed testing track. Keep the upload keystore for all future releases of `com.bamsignal.com`.

---

## RC1 (1.0.15) — Play Store release notes

**Version:** 1.0.15 (18)

### What's new

- Faster app startup and smoother session restore after login
- Production stability fixes for profile loading and navigation
- Performance improvements across the member experience
- Paystack payment return links verified for Android App Links
- Upload key reset completed — signed with approved Play upload certificate

### For testers

Install from the closed testing track. After Paystack payment, you should return to the app automatically at `/payment/success`.
