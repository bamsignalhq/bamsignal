# Photo Safety, Cover Photos & Sendchamp Verification

## Summary

This release separates profile cover imagery from gallery photos, adds quiet contact-detection on uploads, wires Sendchamp WhatsApp OTP verification server-side, and introduces a selfie → admin-review verification flow.

## 1. Cover photo system

- **Data model:** `DatingProfile.coverPhoto` is separate from `photos[]` (profile gallery).
- **Rules:** Cover cannot match any profile photo; first profile photo is never used as cover.
- **Default:** When no cover is set, `ProfileCoverHeader` uses a BamSignal lifestyle default (`lagos-rooftop-02.webp`), not the first gallery image.
- **Edit UI:** Settings → Edit Profile → Photos has two sections:
  - **Cover Photo** — one wide image (`CoverPhotoUpload`)
  - **Profile Photos** — 2–10 face-forward images (`PhotoUploadGrid`)

## 2. Image safety checks

Client-side moderation runs before any image is saved:

| Check | Profile | Cover | Selfie |
|-------|---------|-------|--------|
| Contact text (OCR + filename patterns) | ✓ | ✓ (stricter text-heavy) | ✓ |
| Face-forward heuristic | ✓ | — | ✓ |
| Wide aspect for cover | — | ✓ | — |
| Meme/screenshot heuristics | ✓ | ✓ | ✓ |

**User messaging:** Generic only — e.g. *"Please choose a clearer photo for your profile."* or *"We couldn't use that image. Try another photo."*

**Internal logging:** `photo_rejected_contact_text` analytics event (admin/debug only; no detail exposed to users).

**OCR:** Optional dynamic `tesseract.js` import when installed; pattern scan + text-density heuristics always run.

## 3. Sendchamp WhatsApp verification

**Environment (server only):**

```env
SENDCHAMP_API_KEY=
SENDCHAMP_SENDER=
SENDCHAMP_WHATSAPP_SENDER=
SENDCHAMP_BASE_URL=https://api.sendchamp.com/api/v1
```

**Endpoints:**

- `POST /api/verify/whatsapp/start` — `{ "phone": "+2348012345678" }`
- `POST /api/verify/whatsapp/confirm` — `{ "phone": "+2348012345678", "code": "123456" }`

On success: `app_users.phone_verified = true`, phone saved.

**User copy:**

- Send: *"We sent a code to your WhatsApp."*
- Wrong code: *"That code isn't correct. Please check and try again."*

## 4. Selfie verification flow

1. User opens **Settings → Verification**
2. Verifies WhatsApp (required first)
3. Uploads verification selfie
4. Server stores submission in `verification_submissions` with status `pending`
5. Admin reviews in **Admin → Verify** queue (profile photo + selfie + phone status)
6. Approve sets `profile.verified = true` on member record

**Badges:**

| State | Badge |
|-------|-------|
| Phone verified only | Phone Verified |
| Phone + admin-approved selfie | Verified |
| Premium + verified | Premium Verified |

No automatic facial identity matching — admin review is the source of truth. Simple face heuristics only gate upload quality.

## 5. Health check

`GET /health` now includes:

```json
{
  "sendchamp": true,
  "sendchampTrace": {
    "hasApiKey": true,
    "hasSender": true,
    "hasWhatsappSender": true
  }
}
```

Keys are never exposed.

## 6. Tests

```bash
npm run test:photo-verification
```

Covers:

- Nigerian number normalization
- Contact pattern detection
- WhatsApp OTP guarded paths (when Sendchamp not configured)
- Verification queue approve/reject (when `DATABASE_URL` connected)

## 7. Remaining risks

| Risk | Mitigation |
|------|------------|
| OCR misses stylized contact text | Pattern scan on filename + text-density; periodic admin review |
| Sendchamp downtime | Calm user errors; health trace for ops |
| Large selfie payloads (base64) | Consider object storage migration for production scale |
| Local verification queue legacy data | Admin UI prefers server queue; local queue kept for offline dev |
| Tesseract bundle size | Dynamic import; optional dependency |

## Files touched (key)

- `src/types/index.ts` — `coverPhoto`, `verificationSelfie`, `verificationStatus`
- `src/utils/mediaModeration.ts`, `src/utils/imageContactScan.ts`
- `src/components/CoverPhotoUpload.tsx`, `PhoneVerificationPanel.tsx`
- `server/services/sendchamp.js`, `whatsappVerification.js`, `verificationQueue.js`
- `api/verify/whatsapp/*`, `api/verify/submissions.js`
- `server/production.js` — routes + health

## Deploy checklist

1. Set `SENDCHAMP_*` env vars in Coolify
2. Push to `main` → Coolify rebuild
3. Confirm `/health` shows `sendchamp: true`
4. Test WhatsApp OTP on a real number
5. Submit test selfie and approve in admin queue
