/**
 * Static + smoke checks for authenticated photo upload attribution.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`photo upload attribution test failed: ${message}`);
  process.exit(1);
}

const photosApiSource = readFileSync(join(rootPath, "api/member/photos.js"), "utf8");
const photoReviewSource = readFileSync(join(rootPath, "server/services/photoReview.js"), "utf8");
const photoAttributionSource = readFileSync(
  join(rootPath, "server/services/photoUploadAttribution.js"),
  "utf8"
);
const profilePhotosClient = readFileSync(join(rootPath, "src/services/profilePhotos.ts"), "utf8");
const reconcileScript = readFileSync(join(rootPath, "scripts/reconcile-photo-orphans.mjs"), "utf8");
const photoReviewShared = readFileSync(join(rootPath, "shared/photoReview.mjs"), "utf8");

assertCheck(
  photosApiSource.includes("resolvePhotoUploadOwner") &&
    photosApiSource.includes("finalizeAuthenticatedPhotoUpload") &&
    !photosApiSource.includes("body.profileId") &&
    !photosApiSource.includes("verifySupabaseBearerUserId"),
  "photos API must derive owner from bearer auth and not trust body profileId"
);

assertCheck(
  photoAttributionSource.includes("requireMemberAuth") &&
    photoAttributionSource.includes("attachUploadedPhotoToProfile") &&
    photoAttributionSource.includes("authUserId: owner.authUserId"),
  "photo upload attribution must attach profile and pass auth user id to review"
);

assertCheck(
  photoReviewSource.includes("auth_user_id") &&
    photoReviewSource.includes("export async function attachUploadedPhotoToProfile") &&
    photoReviewSource.includes("unattributed"),
  "photo review service must store auth_user_id and expose attach helper"
);

assertCheck(
  !profilePhotosClient.includes("currentMemberProfileId") &&
    !profilePhotosClient.includes("profileId:"),
  "photo upload client must not send client profileId for review attribution"
);

assertCheck(
  reconcileScript.includes("dry-run") &&
    reconcileScript.includes("--fix") &&
    reconcileScript.includes("storageOrphans") &&
    reconcileScript.includes("reviewsWithoutAttribution"),
  "orphan reconciliation script must support dry-run reporting and optional --fix"
);

assertCheck(
  photoReviewShared.includes('return status === "approved"'),
  "pending photos must remain blocked from public surfaces"
);

const port = Number(process.env.SMOKE_PORT || process.env.PHOTO_ATTRIBUTION_SMOKE_PORT || 39454);
process.env.PORT = String(port);

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not become ready for photo attribution smoke");
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);

  const unauthUpload = await fetch(`${baseUrl}/api/member/photos?action=upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "profile", imageBase64: "data:image/jpeg;base64,AA==" })
  });
  assertCheck(
    unauthUpload.status === 401,
    `upload without bearer must return 401 (got ${unauthUpload.status})`
  );
  const unauthPayload = await unauthUpload.json();
  assertCheck(
    unauthPayload?.error === "not_authorized",
    "upload without bearer must return generic not_authorized error"
  );

  const unauthFinalize = await fetch(`${baseUrl}/api/member/photos?action=finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "profile", photoUrl: "https://example.com/x.jpg" })
  });
  assertCheck(
    unauthFinalize.status === 401,
    `finalize without bearer must return 401 (got ${unauthFinalize.status})`
  );

  console.log("photo upload attribution tests ok");
  process.exit(0);
} catch (error) {
  console.error("photo upload attribution tests failed:", error);
  process.exit(1);
}
