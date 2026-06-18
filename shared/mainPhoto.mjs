/** Resolve primary profile photo URL from gallery + optional mainPhotoUrl. */

function sameUrl(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  try {
    const pathA = a.split("/storage/v1/object/public/")[1];
    const pathB = b.split("/storage/v1/object/public/")[1];
    if (pathA && pathB) return pathA === pathB;
  } catch {
    /* ignore */
  }
  return false;
}

function cleanPhotos(photos) {
  return (Array.isArray(photos) ? photos : []).filter(Boolean);
}

export function resolveMainPhotoUrl(photos, mainPhotoUrl) {
  const list = cleanPhotos(photos);
  if (!list.length) return "";
  if (mainPhotoUrl && list.some((url) => sameUrl(url, mainPhotoUrl))) return mainPhotoUrl;
  return list[0];
}

export function orderPhotosWithMainFirst(photos, mainPhotoUrl) {
  const list = cleanPhotos(photos);
  if (!list.length) return [];
  const main = resolveMainPhotoUrl(list, mainPhotoUrl);
  const rest = list.filter((url) => !sameUrl(url, main));
  return [main, ...rest];
}

export function normalizeMainPhoto(photos, mainPhotoUrl) {
  const list = cleanPhotos(photos);
  if (!list.length) return { photos: [], mainPhotoUrl: undefined };
  const main = resolveMainPhotoUrl(list, mainPhotoUrl);
  return {
    photos: orderPhotosWithMainFirst(list, main),
    mainPhotoUrl: main
  };
}

export function mainPhotoAfterDelete(photos, mainPhotoUrl, deletedUrl) {
  const list = cleanPhotos(photos).filter((url) => !sameUrl(url, deletedUrl));
  if (!list.length) return { photos: [], mainPhotoUrl: undefined };
  const wasMain = deletedUrl && sameUrl(deletedUrl, mainPhotoUrl);
  const nextMain = wasMain ? list[0] : resolveMainPhotoUrl(list, mainPhotoUrl);
  return normalizeMainPhoto(list, nextMain);
}

export function setMainPhoto(photos, url) {
  return normalizeMainPhoto(photos, url);
}

export function addProfilePhotos(photos, mainPhotoUrl, newUrls) {
  const list = [...cleanPhotos(photos), ...cleanPhotos(newUrls)];
  const main = mainPhotoUrl || list[0];
  return normalizeMainPhoto(list, main);
}

export function discoverPhotoFromProfile(profile = {}) {
  const photos = cleanPhotos(profile.photos);
  return resolveMainPhotoUrl(photos, profile.mainPhotoUrl) || photos[0] || "";
}
