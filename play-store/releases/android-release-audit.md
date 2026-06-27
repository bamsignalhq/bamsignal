# Android Release Audit Report

**Version:** 1.0.15 (18)  
**Generated:** 2026-06-27T23:53:56.940Z  
**Git:** 05ba392

| Check | Status | Detail |
|-------|--------|--------|
| applicationId com.bamsignal.com | PASS |  |
| namespace com.bamsignal.com | PASS |  |
| versionName 1.0.15 | PASS |  |
| versionCode 18 | PASS |  |
| minSdk 23 | PASS |  |
| targetSdk 35 | PASS |  |
| compileSdk 35 | PASS |  |
| INTERNET permission | PASS |  |
| No dangerous storage permissions | PASS |  |
| Deep link autoVerify | PASS |  |
| Payment success App Link | PASS |  |
| Adaptive icon (anydpi-v26) | PASS |  |
| Splash screen theme | PASS |  |
| Release signingConfig | PASS |  |
| key.properties exists | PASS |  |
| Proguard/R8 minify disabled (Capacitor) | PASS |  |
| allowBackup false | PASS |  |
| FileProvider not exported | PASS |  |

## Summary

- **applicationId / namespace:** `com.bamsignal.com`
- **minSdk / targetSdk / compileSdk:** 23 / 35 / 35
- **Signing:** release signingConfig via `android/key.properties`
- **Permissions:** INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
- **Deep links:** `https://bamsignal.com/payment/success` (autoVerify)
- **Play Billing / Integrity:** Web-only Capacitor shell (no native SDK)
