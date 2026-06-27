# Play Readiness Report

**Target SDK:** 35  
**Verdict:** Ready for Play Console upload

| Check | Status | Detail |
|-------|--------|--------|
| assetlinks package_name | PASS |  |
| assetlinks SHA256 matches upload cert | PASS | 5C:85:43:2F:5E:13:F2:B7:2B:C3:52:46:C0:C5:F6:F5:65:B5:A5:19:82:D8:A3:A1:64:80:4F:6A:7D:52:7B:BB |
| Production assetlinks.json live | PASS | 5C:85:43:2F:5E:13:F2:B7:2B:C3:52:46:C0:C5:F6:F5:65:B5:A5:19:82:D8:A3:A1:64:80:4F:6A:7D:52:7B:BB |
| targetSdk 35 (Play 2025 requirement) | PASS |  |
| No foreground service permission | PASS |  |
| No legacy storage permissions | PASS |  |
| MainActivity exported (launcher) | PASS |  |
| Billing via web (Paystack) — no native billing SDK | PASS | Capacitor WebView |
| Play Integrity — web-only app (N/A native SDK) | PASS | N/A |

## ADB verification (manual)

```bash
adb shell pm get-app-links com.bamsignal.com
adb shell am start -a android.intent.action.VIEW -d "https://bamsignal.com/payment/success?reference=test"
```
