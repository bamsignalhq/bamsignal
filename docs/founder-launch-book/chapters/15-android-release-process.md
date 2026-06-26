# Android Release Process

Android ships as a **Capacitor WebView** over the same `dist/` assets as web. Stale assets are a common failure mode — always verify before AAB upload.

## Preconditions

- Web release built and tested on production URL.
- Upload signing key documented in password manager.
- `public/.well-known/assetlinks.json` SHA-256 matches release keystore.

## Release commands

```bash
npm run build
npx cap sync android
npm run android:verify-assets
npm run android:release
```

`android:release` runs `scripts/build-android-release.mjs` which:

1. Builds fresh web assets.
2. Syncs Capacitor.
3. Verifies Android assets match `dist/` (including `bamsignal-build` meta).
4. Verifies service worker cache version alignment.
5. Produces AAB/APK for Play upload.

## Version bumps

Edit `android/app/build.gradle`:

- `versionCode` — monotonic integer (required by Play).
- `versionName` — user-visible semver.

Sync `src/buildInfo.ts` / cache version via release script.

## Verification gates

| Check | Command |
|-------|---------|
| Assets fresh | `npm run android:verify-assets` |
| Upload key | `npm run android:verify-upload-key` |
| Source integrity | `npm run test:source-integrity:android` |

## Never

- Upload AAB built before latest `npm run build`.
- Commit `android/app/build/` or `.gradle` caches.
- Skip asset verification after web changes.

See `ANDROID_RELEASE_NOTES.md` for release-specific notes.
