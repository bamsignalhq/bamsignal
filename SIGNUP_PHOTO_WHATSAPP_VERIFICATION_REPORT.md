# Signup Photo Upload + WhatsApp Verification Report

## Photo upload — root cause

Onboarding used the same **strict profile moderation** as edit-profile:

1. **MIME type gate** — `file.type.startsWith("image/")` rejected many mobile camera files (empty type or `application/octet-stream` on Android).
2. **Aggressive face heuristics** — skin-tone / center-face checks blocked valid selfies and portraits during signup.
3. **Text-density heuristic** — screenshot detection false-positived on detailed photos.
4. **No upload feedback** — async moderation ran with no spinner; users thought tap did nothing.
5. **Hidden file input** — `hidden` attribute can be unreliable on some WebViews; replaced with visually-hidden accessible input.

## Photo upload — fix

| Change | Detail |
|--------|--------|
| `signupMode` on `PhotoUploadGrid` | Onboarding passes `signupMode` → `moderateSignupPhotoUpload` |
| Light validation | Extension/MIME check, min 200×200 (or size fallback for HEIC), filename contact scan only |
| No face AI at signup | Face heuristics skipped for `kind: "signup"` |
| Calm reject copy | *"We couldn't use that image. Try another clear photo."* |
| Mobile-friendly input | `accept` includes HEIC/HEIF; `capture="environment"` on main tile; visually-hidden input |
| Loading state | Spinner on active tile while processing |
| Immediate persist | Photos written to `datingProfile` localStorage on each add |

## WhatsApp verification UI

**Phone row**

- Digits-only input, max 11 (`08012345678`)
- **Verify** button appears only at 11 valid digits
- Verified: green check, no button

**Modal (Verify tap)**

- Title: *Receive code on WhatsApp*
- Shows current number
- **Receive WhatsApp OTP** → `POST /api/verify/whatsapp/start`
- *Wrong number? Change it* → inline edit + **Save number** → returns to OTP step
- Loading: *Sending…* / *Verifying…*

**OTP row (after send)**

- 6-digit numeric input
- **Verify Code** appears at 6 digits
- Success: check mark, OTP row hidden, `phoneVerified` persisted in `userProfile`
- Wrong code: *That code is not correct. Please check and try again.*

**Refresh/login**

- `applyRestoredSession` merges `phoneVerified` + phone from local `userProfile` storage.

## Sendchamp backend

| Endpoint | Body | Server behavior |
|----------|------|-----------------|
| `POST /api/verify/whatsapp/start` | `{ "phone": "08012345678" }` | Normalize → Sendchamp WhatsApp OTP |
| `POST /api/verify/whatsapp/confirm` | `{ "phone": "08012345678", "code": "123456" }` | Confirm → `phone_verified=true` |

Env: `SENDCHAMP_API_KEY`, `SENDCHAMP_WHATSAPP_SENDER`, `SENDCHAMP_BASE_URL`

Health: `/health` → `sendchamp` + `sendchampTrace`

## Test results

| Test | Status |
|------|--------|
| `npm run build` | Pass |
| `npm run test:photo-verification` | Pass (phone normalization, contact patterns, OTP guards) |
| Desktop / mobile / APK photo upload | Code paths fixed; manual QA recommended on device |
| 10 digits → no Verify button | Implemented (`phone.length === 11`) |
| 11 digits → Verify visible | Implemented |
| Modal + change number + OTP flow | Implemented |
| Green check + persist | Implemented |

## Remaining blockers

1. **Sendchamp credentials** — OTP send requires production `SENDCHAMP_*` env vars in Coolify.
2. **HEIC decode** — If bitmap load fails, signup still accepts file by size; full preview depends on browser WebView support.
3. **Server-side phoneVerified on login** — Currently client-local; optional future: pull `phone_verified` from `app_users` on member bundle pull.
4. **OCR** — Not enabled; filename-only contact scan at signup for speed.

## Success criteria

- User can add photos during onboarding (gallery + camera on supported devices).
- User can verify WhatsApp with modal → OTP → green check.
- Verified state survives refresh within the same device session.
