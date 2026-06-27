# Dependency & Supply Chain Certification™

**Run ID:** dep-b41bc854  
**Generated:** 2026-06-26T23:00:12.644Z  
**Dependency score:** 80%  
**Release gate:** PASS

## Summary

| Metric | Value |
|--------|------:|
| Packages scanned | 478 |
| Critical vulnerabilities | 0 |
| Upgrade candidates | 20 |
| Unused dependencies | 14 |
| Duplicate packages | 20 |

## Categories

| Category | Findings | Critical | Status |
|----------|----------:|---------:|--------|
| npm packages | 6 | 0 | PASS |
| Docker base image | 1 | 0 | PASS |
| Node version | 1 | 0 | PASS |
| Android dependencies | 1 | 0 | PASS |
| Firebase SDK | 1 | 0 | PASS |
| Supabase SDK | 1 | 0 | PASS |
| Payment SDKs | 2 | 0 | PASS |
| Notification SDKs | 5 | 0 | PASS |

## Critical vulnerabilities

- None

## Upgrade candidates

| Package | Current | Wanted | Latest |
|---------|---------|--------|--------|
| @capacitor-community/fcm | 7.1.3 | 7.3.0 | 8.1.0 |
| @capacitor/android | 7.6.7 | 7.6.7 | 8.4.1 |
| @capacitor/app | 7.1.2 | 7.1.2 | 8.1.0 |
| @capacitor/browser | 7.0.5 | 7.0.5 | 8.0.3 |
| @capacitor/cli | 7.6.7 | 7.6.7 | 8.4.1 |
| @capacitor/core | 7.6.7 | 7.6.7 | 8.4.1 |
| @capacitor/ios | 7.6.7 | 7.6.7 | 8.4.1 |
| @capacitor/push-notifications | 7.0.6 | 7.0.6 | 8.1.1 |
| @types/react | 18.3.31 | 18.3.31 | 19.2.17 |
| @types/react-dom | 18.3.7 | 18.3.7 | 19.2.3 |
| @vitejs/plugin-react | 4.7.0 | 4.7.0 | 6.0.3 |
| axios | 1.18.0 | 1.18.1 | 1.18.1 |

## Unused dependencies

- @capacitor-community/fcm
- @capacitor/android
- @capacitor/ios
- @capacitor/push-notifications
- @tensorflow/tfjs-converter
- axios
- jsqr
- node-cron
- tesseract.js
- @capacitor/cli
- @types/react
- @types/react-dom

## Recommendations

- [high] Plan major upgrade for @capacitor-community/fcm: 7.1.3 → latest 8.1.0
- [high] Plan major upgrade for @capacitor/android: 7.6.7 → latest 8.4.1
- [high] Plan major upgrade for @capacitor/app: 7.1.2 → latest 8.1.0
- [high] Plan major upgrade for @capacitor/browser: 7.0.5 → latest 8.0.3
- [high] Plan major upgrade for @capacitor/cli: 7.6.7 → latest 8.4.1
- [high] Plan major upgrade for @capacitor/core: 7.6.7 → latest 8.4.1
- [high] High CVE: vite has high severity advisory.
- [medium] Review unused dependencies: @capacitor-community/fcm, @capacitor/android, @capacitor/ios, @capacitor/push-notifications, @tensorflow/tfjs-converter, axios, jsqr, node-cron
- [medium] Deduplicate package versions: Align transitive dependencies via overrides or direct upgrades.

---
Command: `npm run certify:dependencies`
