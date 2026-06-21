# Storage backup runbook

**Scope:** Supabase Storage buckets used by BamSignal member media.

---

## Buckets in production

| Bucket | Code constant | Content | Public |
|--------|---------------|---------|--------|
| `profile-photos` | `PROFILE_PHOTOS_BUCKET` | Member profile images | Yes |
| `cover-photos` | `COVER_PHOTOS_BUCKET` | Profile cover images | Yes |
| `voice-intros` | `VOICE_INTROS_BUCKET` | Voice intro audio | Yes |

Configured via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`). Readiness check `/ready` includes `photoStorageReady` when service role is valid.

Object paths are user-scoped (typically `{authUserId}/...`) — see `server/services/photoStorage.js` and `server/services/voiceIntroStorage.js`.

---

## What to back up

1. **All objects** in the three buckets (member-facing media).
2. **Bucket policies** (Supabase dashboard → Storage → Policies).
3. **Cross-reference:** `app_member_profiles.profile` JSON stores photo URLs — database backup must align with storage backup timestamps.

---

## Backup methods

### Supabase Storage (dashboard)

1. Supabase → **Storage** → select bucket.
2. For small volumes: manual export via Supabase CLI or API.
3. Enable project-level backup if available on your Supabase plan (covers storage + DB together).

### Supabase CLI sync (recommended for periodic off-site copy)

Install CLI and authenticate (project ref from Supabase settings):

```bash
# List buckets
supabase storage ls ss:///profile-photos --experimental

# Mirror bucket to local encrypted volume (example)
mkdir -p backups/storage/$(date +%Y%m%d)/profile-photos
supabase storage cp -r ss:///profile-photos backups/storage/$(date +%Y%m%d)/profile-photos --experimental
```

Repeat for `cover-photos` and `voice-intros`.

### API bulk export (automation)

Use service role (from vault) with Storage API:

```
GET {SUPABASE_URL}/storage/v1/object/list/{bucket}
GET {SUPABASE_URL}/storage/v1/object/{bucket}/{path}
```

Script backups outside the app repo — do not commit service keys.

---

## Recommended schedule

| Asset | Frequency | Retention |
|-------|-----------|-----------|
| Full bucket mirror | Weekly | 8 weeks |
| Pre-migration snapshot | Before storage policy changes | 90 days |
| Align with DB backup | Same calendar day as [database-backup.md](./database-backup.md) | Match DB retention |

---

## Orphan object review

Orphan objects (orphan storage files) have no referencing profile URL (or belong to deleted members).

1. Export `profile->photos`, `coverPhotoUrl`, `voiceIntroUrl` from `app_member_profiles`.
2. List storage objects per user prefix.
3. Objects not referenced after **30 days** may be candidate for cleanup — **staging first**.

Deletion in app uses `deletePhotoStorageObject` (`server/services/photoReview.js` admin flows). Do not bulk-delete in production without audit.

---

## Failure modes

| Symptom | Likely cause |
|---------|----------------|
| `/ready` 503, `photoStorage: false` | Missing/invalid `SUPABASE_SERVICE_ROLE_KEY` |
| Upload 503 | Storage not configured or bucket missing |
| Broken image URLs | Bucket deleted, object removed, or URL/path drift after restore |

Observability events: `photo_storage_unavailable`, `photo_upload_failed`, `voice_intro_failed`.

---

## Related runbooks

- [storage-restore.md](./storage-restore.md)
- [database-backup.md](./database-backup.md)
