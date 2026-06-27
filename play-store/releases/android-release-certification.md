# Android Release Certification — RC1

**Build version:** bamsignal-v1.0.15-18  
**Version Name:** 1.0.15  
**Version Code:** 18  
**Git Commit:** b3839bb  
**Signing SHA1:** 71:BA:6A:A2:70:98:94:CB:45:64:83:F2:36:3E:C9:D6:22:D6:6E:67  
**Signing SHA256:** 5C:85:43:2F:5E:13:F2:B7:2B:C3:52:46:C0:C5:F6:F5:65:B5:A5:19:82:D8:A3:A1:64:80:4F:6A:7D:52:7B:BB  
**Bundle Size:** 11.21 MB  
**Bundle SHA256:** a9f50aef8c2e86eefbf501a069d8273214bb7eee266037e69b639220abcc9995  
**Build Time:** 2026-06-27T23:20:52.773Z  
**Android Score:** 100%  
**Verdict:** **GO**

## Release Notes

## RC1 (1.0.15) — Play Store release notes

**Version:** 1.0.15 (18)

## All Checks

| Category | Check | Status |
|----------|-------|--------|
| Audit | applicationId com.bamsignal.com | PASS |
| Audit | namespace com.bamsignal.com | PASS |
| Audit | versionName 1.0.15 | PASS |
| Audit | versionCode 18 | PASS |
| Audit | minSdk 23 | PASS |
| Audit | targetSdk 35 | PASS |
| Audit | compileSdk 35 | PASS |
| Audit | INTERNET permission | PASS |
| Audit | No dangerous storage permissions | PASS |
| Audit | Deep link autoVerify | PASS |
| Audit | Payment success App Link | PASS |
| Audit | Adaptive icon (anydpi-v26) | PASS |
| Audit | Splash screen theme | PASS |
| Audit | Release signingConfig | PASS |
| Audit | key.properties exists | PASS |
| Audit | Proguard/R8 minify disabled (Capacitor) | PASS |
| Audit | allowBackup false | PASS |
| Audit | FileProvider not exported | PASS |
| Signing | Active expected SHA1 matches approved | PASS |
| Signing | verify-android-upload-key | PASS |
| Signing | AAB SHA1 matches Play upload | PASS |
| Signing | AAB SHA256 matches Play upload | PASS |
| Deep Links | assetlinks package_name | PASS |
| Deep Links | assetlinks SHA256 matches upload cert | PASS |
| Deep Links | Production assetlinks.json live | PASS |
| Certification | test-android-app-links | PASS |
| Bundle | AAB exists at play-store/releases | PASS |
| Bundle | AAB size > 1MB | PASS |
| Bundle | Contains base dex | PASS |
| Bundle | Contains base manifest | PASS |
| Bundle | Contains web assets | PASS |
| Bundle | Contains adaptive icons | PASS |
| Play | targetSdk 35 (Play 2025 requirement) | PASS |
| Play | No foreground service permission | PASS |
| Play | No legacy storage permissions | PASS |
| Play | MainActivity exported (launcher) | PASS |
| Play | Billing via web (Paystack) — no native billing SDK | PASS |
| Play | Play Integrity — web-only app (N/A native SDK) | PASS |
| Certification | test-android-upload-signing | PASS |
| Certification | test-source-integrity-android | PASS |

## Artifacts

- `play-store/releases/BamSignal-v1.0.15-18.aab`
- `play-store/releases/android-release-certification.md`
- `play-store/releases/bundle-inspection.md`
- `play-store/releases/play-readiness.md`
