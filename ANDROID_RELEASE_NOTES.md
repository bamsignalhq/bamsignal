# Android Release Signing Notes

**Do not commit signing secrets to GitHub.**

## Keystore

| Field | Value |
|-------|-------|
| **Filename** | `android/app/bamsignal-upload-key.jks` |
| **Alias** | `bamsignal_upload` |
| **Algorithm** | RSA 2048, SHA384withRSA |
| **Certificate** | CN=BamSignal, O=BamSignal, L=Lagos, C=NG |

Store a backup of the keystore and passwords in a secure password manager or offline vault. **If you lose this keystore, you cannot publish updates to the same Play Console app.**

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

## Release build commands

Use Java 17 or 21 (Android Studio JBR). System Java 25 is not compatible with Gradle 8.13.

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npm run build
npx cap sync android
cd android
./gradlew assembleRelease bundleRelease
```

## Outputs

| Artifact | Path |
|----------|------|
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` |

## Play Console

Upload the **AAB** (`app-release.aab`) to a closed testing track. Keep the upload keystore for all future releases of `com.bamsignal.app`.
