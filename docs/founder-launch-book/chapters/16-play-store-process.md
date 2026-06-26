# Play Store Process

## Tracks

| Track | Use |
|-------|-----|
| Internal testing | Engineering smoke on device |
| Closed testing | Trusted testers pre-launch |
| Open testing | Optional wider beta |
| Production | Public Play listing |

## Upload workflow

1. Complete **Android Release Process** — fresh AAB in hand.
2. Google Play Console → BamSignal app.
3. Create new release on target track.
4. Upload AAB; confirm version code is higher than previous.
5. Complete store listing compliance (content rating, data safety).
6. Roll out; monitor Android vitals.

## Signing

- Play App Signing enabled (recommended).
- Upload certificate registered with Play — verify with `npm run android:verify-upload-key`.
- `play-store/` local artifacts are operator tools — **do not commit** private keys or keystores.

## Deep links and payments

Before payment-related releases:

- Complete `docs/releases/checklists/deep-link-verification.md`
- Test `assetlinks.json` on device
- Test Paystack return to preserved member path (not public homepage)

## Post-publish verification

1. Install from Play track on physical device.
2. Login (username + PIN).
3. Discover loads; payment flow opens Paystack and returns correctly.
4. Push notification (if Firebase configured).

## Rollback on Play

- Halt rollout in Play Console.
- Ship fixed AAB with incremented `versionCode`.
- Web-only hotfixes still require new AAB if bundled assets changed.
