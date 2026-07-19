# National Production Readiness — Face Verification

**Date:** 2026-07-19  
**System:** BamSignal National Production Verification System  
**Architecture:** Provider interface (InsightFace / FaceNet / future) — **no SDK coupling in app code**

## Verdict

**Ready for staged enablement.** Ship with `FACE_MATCH_REQUIRED_FOR_MESSAGING=false` until remote face service + Coolify env + moderator SOP are confirmed. Provider plumbing, DB, private storage, APIs, risk engine, admin queue, and rate limits are in place.

## Delivered

| Requirement | Status |
|-------------|--------|
| Provider interface (`initialize/detectFace/extractEmbedding/compare/verify`) | Done |
| InsightFace + FaceNet adapters via factory | Done |
| Liveness + risk engine | Done |
| Sessions / events / results / audit tables | Done |
| Private `verification-selfies` bucket + signed URLs | Done |
| `/api/verification/start\|upload\|verify\|status` | Done |
| Admin approve / reject / request selfie / suspend | Done |
| Rate limits + encrypted metadata + audit logs | Done |
| Messaging gate optional national unlock | Done |

## Production enablement order

1. Run migration `0049_national_verification.sql`
2. Confirm Supabase service role can create private bucket `verification-selfies`
3. Deploy remote face service OR set `FACE_VERIFICATION_PROVIDER=noop` for dry-run only
4. Set thresholds + `VERIFICATION_METADATA_KEY`
5. Train moderators on Admin → Verifications → National queue
6. Flip `FACE_MATCH_REQUIRED_FOR_MESSAGING=true` and matching `VITE_*` then rebuild

## Risks / follow-ups

- Remote InsightFace service must implement `/detect`, `/embed`, `/verify` JSON contract
- Hash-embedding fallback is for continuity only — not production biometric strength
- Duplicate-device scoring needs a persisted device registry (stubbed signal today)
- Cleanup job for expired session selfie objects should be added to cron

## Non-goals preserved

- Member UI redesign not touched beyond verification wizard wiring
- Existing SMS YIKE gate remains default unlock path until national flag is on
