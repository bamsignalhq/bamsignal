# Storage restore runbook

**When to use:** bucket deletion, accidental object wipe, Supabase storage incident, or DB/storage mismatch after database restore.

---

## Before you start

1. Confirm **database** state — profile JSON references URLs in storage. Restore storage to a point that matches DB backup age, or expect broken links.
2. Capture inventory of missing URLs from member reports or:

   ```sql
   select id, profile->>'photo' as photo, profile->'photos' as photos
   from app_member_profiles
   where profile->>'photo' is not null
   limit 50;
   ```

3. Do **not** overwrite production buckets without a pre-restore mirror (see [storage-backup.md](./storage-backup.md)).

---

## Option A — Restore from off-site mirror

1. Stop member photo uploads (optional: maintenance banner via Command Center — not required for read-only restore).
2. For each bucket (`profile-photos`, `cover-photos`, `voice-intros`):

   ```bash
   supabase storage cp -r backups/storage/YYYYMMDD/profile-photos ss:///profile-photos --experimental
   ```

3. Verify public URL pattern:

   ```
   {SUPABASE_URL}/storage/v1/object/public/profile-photos/{userId}/{file}
   ```

4. Spot-check member profiles in app (Discover / own profile).

---

## Option B — Supabase project restore

If entire Supabase project was restored (PITR):

1. Update Coolify runtime env if project URL or keys changed:
   - `SUPABASE_URL`, `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`
2. Redeploy web build if public URL changed (build-time `VITE_*`).
3. Confirm `/ready` → 200 and photo upload smoke on staging.

---

## Option C — Single member recovery

1. Locate member backup object in off-site mirror.
2. Upload to correct path under member's `authUserId` prefix.
3. Update profile JSON if URLs changed (via normal profile sync or controlled SQL on staging first).
4. Re-submit photo for moderation if policy requires (`photo_review` queue in Command Center).

---

## Orphan cleanup (post-restore)

After restore, run orphan review (staging):

1. List objects without DB reference → quarantine prefix `/_orphan/` before delete.
2. Document counts; delete only after 7-day quarantine.

---

## Verification checklist

- [ ] `GET /ready` reports `photoStorage: true` (detailed mode with diagnostics secret)
- [ ] New profile photo upload succeeds (staging account)
- [ ] Existing public photo URLs return HTTP 200
- [ ] Voice intro playback works for test account
- [ ] No spike in `photo_upload_failed` logs

---

## Related runbooks

- [storage-backup.md](./storage-backup.md)
- [database-restore.md](./database-restore.md)
- [deployment-recovery.md](./deployment-recovery.md)
