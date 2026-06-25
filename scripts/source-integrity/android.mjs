/**
 * Android-specific source integrity checks (skipped when android/ is absent).
 */
import { assertCheck } from "./lib.mjs";

export function runAndroidIntegrityChecks(ctx) {
  const androidReleaseSource = ctx.readSrc("scripts/build-android-release.mjs");
  const androidVerifySource = ctx.readSrc("scripts/verify-android-assets.mjs");
  const androidManifestSource = ctx.readSrc("android/app/src/main/AndroidManifest.xml");
  const androidAssetlinksSource = ctx.readSrc("public/.well-known/assetlinks.json");

  assertCheck(
    androidReleaseSource.includes("cleanWebAssets") &&
      androidReleaseSource.includes('run("5", "npm", ["run", "android:verify-assets"])') &&
      androidReleaseSource.indexOf("android:verify-assets") <
        androidReleaseSource.indexOf('run("6", gradlew, ["clean"]') &&
      androidReleaseSource.includes('run("7", gradlew, ["bundleRelease"]') &&
      androidReleaseSource.includes('run("8", gradlew, ["assembleRelease"]') &&
      !androidReleaseSource.includes("VITE_APP_BUILD_ID"),
    "android release must clean, build, sync, verify, then gradle clean/bundle/assemble without stale build-id override"
  );
  assertCheck(
    androidVerifySource.includes("extractBuildMarker") &&
      androidVerifySource.includes("compareHashes") &&
      androidVerifySource.includes("swHash") &&
      androidVerifySource.includes("ANDROID_ASSET_FIX_HINT"),
    "android asset verifier must compare refs, hashes, build marker, and service worker cache"
  );
  assertCheck(
    androidManifestSource.includes('android:autoVerify="true"') &&
      androidManifestSource.includes('android:host="bamsignal.com"') &&
      androidManifestSource.includes('android:pathPrefix="/payment/success"') &&
      androidManifestSource.includes('android:host="payment-success"') &&
      androidManifestSource.includes('android:scheme="@string/custom_url_scheme"'),
    "Android manifest must keep verified HTTPS app links and custom scheme callbacks"
  );
  assertCheck(
    androidAssetlinksSource.includes('"package_name": "com.bamsignal.com"') &&
      androidAssetlinksSource.includes("sha256_cert_fingerprints") &&
      androidAssetlinksSource.includes("delegate_permission/common.handle_all_urls"),
    "assetlinks.json must associate com.bamsignal.com with release signing fingerprint"
  );
}
