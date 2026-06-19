/** Safe merge for app_member_profiles.profile JSON — never drop cover or gallery fields. */

function pickCover(raw = {}) {
  return raw.coverPhotoUrl || raw.coverPhoto || null;
}

function coverTimestamp(raw = {}) {
  const value = raw.coverPhotoUpdatedAt;
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

export function mergeMemberProfilePayload(existing = {}, incoming = {}) {
  const next = { ...existing, ...incoming };

  const existingCover = pickCover(existing);
  const incomingCover = pickCover(incoming);
  const existingTs = coverTimestamp(existing);
  const incomingTs = coverTimestamp(incoming);

  if (incomingCover) {
    const useIncoming =
      !existingCover || incomingTs >= existingTs || incoming.coverPhotoExplicit === true;
    if (useIncoming) {
      next.coverPhotoUrl = incomingCover;
      next.coverPhoto = incomingCover;
      next.coverPhotoPath = incoming.coverPhotoPath ?? existing.coverPhotoPath ?? null;
      next.coverPhotoExplicit = incoming.coverPhotoExplicit ?? true;
      next.coverPhotoUpdatedAt =
        incoming.coverPhotoUpdatedAt ?? existing.coverPhotoUpdatedAt ?? new Date().toISOString();
    } else {
      next.coverPhotoUrl = existingCover;
      next.coverPhoto = existingCover;
      next.coverPhotoPath = existing.coverPhotoPath ?? incoming.coverPhotoPath ?? null;
      next.coverPhotoExplicit = existing.coverPhotoExplicit ?? incoming.coverPhotoExplicit ?? true;
      next.coverPhotoUpdatedAt = existing.coverPhotoUpdatedAt ?? incoming.coverPhotoUpdatedAt ?? null;
    }
  } else if (existingCover) {
    next.coverPhotoUrl = existingCover;
    next.coverPhoto = existingCover;
    next.coverPhotoPath = existing.coverPhotoPath ?? null;
    next.coverPhotoExplicit = existing.coverPhotoExplicit ?? false;
    next.coverPhotoUpdatedAt = existing.coverPhotoUpdatedAt ?? null;
  }

  if (!Array.isArray(incoming.photos) || incoming.photos.length === 0) {
    next.photos = Array.isArray(existing.photos) ? existing.photos : incoming.photos ?? [];
  }

  if (!incoming.mainPhotoUrl && existing.mainPhotoUrl) {
    next.mainPhotoUrl = existing.mainPhotoUrl;
  }

  if (!incoming.photoMeta && existing.photoMeta) {
    next.photoMeta = existing.photoMeta;
  }

  return next;
}
