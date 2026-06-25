/**
 * Static source integrity checks — requires src/ (not present in Docker runner).
 * Run locally and in pre-push; skipped when src/ is absent.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { isDisposableEmail } from "../shared/blockedEmailDomains.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(rootPath, "src");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`source integrity failed: ${message}`);
  process.exit(1);
}

if (!existsSync(srcRoot)) {
  console.log("source integrity skipped (no src/ — Docker runner or partial checkout)");
  process.exit(0);
}

function readSrc(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const signupMathSource = readSrc("server/services/signupMathChallenge.js");
const authPageSource = readSrc("src/pages/AuthPage.tsx");
const appSource = readSrc("src/App.tsx");
const adminSessionSource = readSrc("src/utils/adminSession.ts");
const adminShellSource = readSrc("src/components/admin/AdminShell.tsx");
const paymentsSource = readSrc("src/services/payments.ts");
const paymentReturnSource = readSrc("src/utils/paymentReturn.ts");
const purchaseEmailSource = readSrc("server/services/purchaseEmail.js");
const memberProfileSyncSource = readSrc("src/services/memberProfileSync.ts");
const memberProfileListenerSource = readSrc("src/hooks/useMemberProfileListener.ts");
const memberDataApiSource = readSrc("api/member/data.js");
const memberDataClientSource = readSrc("src/services/memberData.ts");
const memberCityHomeClientSource = readSrc("src/services/cityHome.ts");
const memberAuthSource = readSrc("server/services/memberAuth.js");
const memberApiAuthSource = readSrc("src/utils/memberApiAuth.ts");
const pinLoginApiSource = readSrc("api/auth/pin-login.js");
const pinResetApiSource = readSrc("api/auth/pin-reset.js");
const pinAuthThrottleSource = readSrc("server/services/pinAuthThrottle.js");
const apiErrorResponseSource = readSrc("server/services/apiErrorResponse.js");
const errorResponseSource = readSrc("server/services/errorResponse.js");
const photoReviewSharedSource = readSrc("shared/photoReview.mjs");
const cityHomeSource = readSrc("server/cityHome.js");
const memberSocialSource = readSrc("server/memberSocial.js");
const diagnosticsAccessSource = readSrc("server/services/diagnosticsAccess.js");
const identityExposureSource = readSrc("server/services/identityExposure.js");
const identityApiSource = readSrc("api/auth/identity.js");
const loginSecurityApiSource = readSrc("api/auth/login-security.js");
const hardSetupApiSource = readSrc("api/hard/setup.js");
const consoleSetupAccessSource = readSrc("server/services/consoleSetupAccess.js");
const adminBootstrapApiSource = readSrc("api/admin/bootstrap.js");
const adminBootstrapAccessSource = readSrc("server/services/adminBootstrapAccess.js");
const adminAuthServerSource = readSrc("server/adminAuth.js");
const observabilitySource = readSrc("server/services/observability.js");
const paystackVerifyApiSource = readSrc("api/paystack/verify.js");
const viewSecurityApiSource = readSrc("api/diagnostics/view-security.js");
const functionSecurityApiSource = readSrc("api/diagnostics/function-security.js");
const paystackVerifySource = readFileSync(join(rootPath, "api/paystack/verify.js"), "utf8");
const paymentInitializeThrottleSource = readFileSync(
  join(rootPath, "server/services/paymentInitializeThrottle.js"),
  "utf8"
);
const rateLimitRetentionSource = readSrc("server/services/rateLimitRetention.js");
const retentionBatchDeleteSource = readSrc("server/services/retentionBatchDelete.js");
const productionServerSource = readSrc("server/production.js");
const rateLimitRetentionMigrationSource = readFileSync(
  join(rootPath, "migrations/0003_rate_limit_retention_indexes.sql"),
  "utf8"
);
const paystackWebhookHandlerSource = readFileSync(
  join(rootPath, "server/services/paystackWebhookHandler.js"),
  "utf8"
);
const paystackWebhookSource = readFileSync(join(rootPath, "api/webhooks/paystack.js"), "utf8");
const paystackRouterSource = readFileSync(join(rootPath, "server/routes/paystack.js"), "utf8");
const paymentCatalogSource = readFileSync(join(rootPath, "server/services/paymentCatalog.js"), "utf8");
const paymentFortressSource = readFileSync(join(rootPath, "server/services/paymentFortress.js"), "utf8");
const paymentDbSource = readFileSync(join(rootPath, "server/services/paymentDb.js"), "utf8");
const paymentFulfillmentsSource = readFileSync(join(rootPath, "server/services/paymentFulfillments.js"), "utf8");
const paymentRuntimeSchemaSource = readFileSync(
  join(rootPath, "migrations/0002_baseline_bamsignal_schema.sql"),
  "utf8"
);
const schemaVerificationSource = readSrc("server/services/schemaVerification.js");
const dbStartupSource = readSrc("server/db.js");
const paymentFulfillmentRaceMigrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606211300_payment_fulfillment_processing.sql"),
  "utf8"
);
const paystackDiagnosticsApiSource = readSrc("api/diagnostics/paystack-connectivity.js");
const memberPhotosApiSource = readSrc("api/member/photos.js");
const photoUploadAttributionSource = readSrc("server/services/photoUploadAttribution.js");
const photoReviewServiceSource = readSrc("server/services/photoReview.js");
const profileMergeSource = readSrc("server/utils/profileMerge.js");
const profilePatchSharedSource = readSrc("shared/profilePatch.mjs");
const androidReleaseSource = readSrc("scripts/build-android-release.mjs");
const androidVerifySource = readSrc("scripts/verify-android-assets.mjs");
const androidManifestSource = readSrc("android/app/src/main/AndroidManifest.xml");
const androidAssetlinksSource = readSrc("public/.well-known/assetlinks.json");
const goToAppSource = readSrc("src/services/goToApp.ts");
const openAppCacheSource = readSrc("src/utils/openAppOnboardingCache.ts");
const adminActionPinThrottleSource = readSrc("server/services/adminActionPinThrottle.js");
const adminConsentServerSource = readSrc("server/adminConsent.js");
const adminConsentApiSource = readSrc("api/admin/consent.js");
const dockerfileSource = readSrc("Dockerfile");
const smokeServerImportSource = readSrc("scripts/smoke-server-import.mjs");
const memberEntitlementsSource = readSrc("shared/memberEntitlements.mjs");
const memberEntitlementsClientSource = readSrc("src/utils/memberEntitlements.ts");
const premiumStatusSource = readSrc("src/services/premiumStatus.ts");
const bootFlagsSource = readSrc("src/utils/bootFlags.ts");
const blockedEmailSource = readSrc("shared/blockedEmailDomains.mjs");
const signupOtpSource = readSrc("server/services/signupOtp.js");
const signupProvisioningSource = readSrc("server/services/signupProvisioning.js");
const signupIdentitySource = readSrc("server/services/signupIdentity.js");
const photoUploadGridSource = readSrc("src/components/PhotoUploadGrid.tsx");
const profilePhotoUploadSource = readSrc("src/utils/profilePhotoUpload.ts");
const complianceGateSource = readSrc("src/components/ComplianceGateModal.tsx");
const complianceUtilSource = readSrc("src/utils/compliance.ts");
const profilePageSource = readSrc("src/pages/ProfilePage.tsx");
const discoverPageSource = readSrc("src/pages/DiscoverPage.tsx");
const homePageSource = readSrc("src/pages/HomePage.tsx");
const onboardingPageSource = readSrc("src/pages/OnboardingPage.tsx");
const fastConnectionIntentSource = readSrc("src/utils/fastConnectionIntent.ts");
const fastConnectionActivationSheetSource = readSrc("src/components/profile/FastConnectionActivationSheet.tsx");
const fastConnectionRenewalSheetSource = readSrc("src/components/profile/FastConnectionRenewalSheet.tsx");
const fastConnectionActivationHookSource = readSrc("src/hooks/useFastConnectionActivationPrompt.ts");
const fastConnectionStateSource = readSrc("src/utils/fastConnectionState.ts");
const fastConnectionPageSource = readSrc("src/pages/FastConnectionPage.tsx");
const fastConnectionPoolServiceSource = readSrc("src/services/fastConnectionPool.ts");
const fastConnectionServerSource = readFileSync(join(rootPath, "server/services/fastConnection.js"), "utf8");
const accountSecuritySource = readSrc("src/services/accountSecurity.ts");
const twoFactorCardSource = readSrc("src/components/TwoFactorSettingsCard.tsx");
const intentsSource = readSrc("src/constants/intents.ts");
const profileOptionsSource = readSrc("src/constants/profileOptions.ts");
const discoverFiltersSource = readSrc("src/components/DiscoverFilters.tsx");
const matchPreferenceFieldsSource = readSrc("src/components/preferences/MatchPreferenceFields.tsx");
const memberIntentsSharedSource = readFileSync(join(rootPath, "shared/memberIntents.mjs"), "utf8");
const memberOptionalPreferencesSource = readFileSync(
  join(rootPath, "shared/memberOptionalPreferences.mjs"),
  "utf8"
);
const voiceIntroSource = readSrc("src/components/VoiceIntro.tsx");
const voiceRecordingSource = readSrc("src/utils/voiceRecording.ts");
const voiceIntroUploadSource = readSrc("src/services/voiceIntroUpload.ts");
const voiceIntroStorageSource = readFileSync(join(rootPath, "server/services/voiceIntroStorage.js"), "utf8");
const serverAppSource = readFileSync(join(rootPath, "server/app.js"), "utf8");
const userMessagesSource = readSrc("src/constants/userMessages.ts");
const serviceWorkerSource = readSrc("src/utils/serviceWorker.ts");
const mainSource = readSrc("src/main.tsx");
const sourceIntegrityScriptSource = readSrc("scripts/source-integrity-check.mjs");

assertCheck(
  paymentReturnSource.includes("hasPaystackCallbackInUrl") &&
    paymentReturnSource.includes('path === "/payment/success" || hasPaystackCallbackInUrl()'),
  "payment callback params must be intercepted before public homepage render"
);
assertCheck(
  paymentsSource.includes('buildReturnContext("boost", boostId, returnContext, "/profile")'),
  "profile boost checkout must default back to /profile"
);
assertCheck(
  paymentsSource.includes("returnPath: resolvePaymentReturnPath({ tab, pathname: memberPathname })") ||
    appSource.includes("returnPath: resolvePaymentReturnPath({ tab, pathname: memberPathname })"),
  "Signal Pass checkout must save the current member return path"
);
assertCheck(
  appSource.indexOf("const returnPath = normalizePaymentReturnPath") >= 0 &&
    appSource.indexOf("const returnPath = normalizePaymentReturnPath") < appSource.indexOf("clearPaymentSession()"),
  "payment success must preserve returnPath before clearing payment state"
);
assertCheck(
  appSource.includes("paymentReturnActive") && appSource.includes("!paymentReturnActive"),
  "session restore must not swallow Paystack callback params"
);
assertCheck(
  (purchaseEmailSource.includes("fulfillmentEmailAlreadySent(reference)") ||
    purchaseEmailSource.includes("purchaseEmailAlreadySent(reference)")) &&
    (purchaseEmailSource.includes("claimFulfillmentEmailSend(reference)") ||
      purchaseEmailSource.includes("markPurchaseEmailSent(reference)")) &&
    (purchaseEmailSource.indexOf("claimFulfillmentEmailSend(reference)") >= 0
      ? purchaseEmailSource.indexOf("claimFulfillmentEmailSend(reference)") <
        purchaseEmailSource.indexOf("const sendResult = await sendResendPurchaseEmail")
      : purchaseEmailSource.indexOf("markPurchaseEmailSent(reference)") <
        purchaseEmailSource.indexOf("const sendResult = await sendResendPurchaseEmail")),
  "purchase confirmation email must be claimed once per reference before sending"
);
assertCheck(
  signupMathSource.includes("createHmac") &&
    signupMathSource.includes("buildSignupMathChallengeToken") &&
    !signupMathSource.includes("const challenges = new Map") &&
    signupMathSource.includes('"challenge_expired"'),
  "signup math challenge must use signed stateless tokens"
);
assertCheck(
  authPageSource.includes("onRefresh={() => void loadMathChallenge()}") &&
    authPageSource.includes('error.code === "challenge_expired"'),
  "signup math challenge must refresh expired tokens in the client"
);
assertCheck(
  appSource.includes("const isPublicSurface") &&
    appSource.includes('memberAppEntered && !isPublicSurface ? "platform-root--member" : ""') &&
    appSource.includes("showMemberNav={isAuthed && memberAppEntered && !isPublicSurface}"),
  "public routes must not render the member shell"
);
assertCheck(
  appSource.includes("showOpenApp={isAuthed && isPublicHome}") &&
    appSource.includes("goToApp({ loginEmail: undefined })") &&
    appSource.includes("open_app_server_confirmed") &&
    !appSource.includes('flowLog("home_enter", { source: "open_app_fast" })') &&
    appSource.includes("readOpenAppOnboardingCache"),
  "Open App must route only after server onboarding status or cached fallback"
);
assertCheck(
  appSource.includes("setAuthPath(AUTH_SIGNUP_PATH)") &&
    appSource.includes("navigateToPath(AUTH_SIGNUP_PATH, true)"),
  "Open App without a session must route to /love/sign"
);
assertCheck(
  appSource.includes("OPEN_APP_FAILSAFE_MS") &&
    appSource.includes("clearOpenAppPendingState") &&
    appSource.includes("expireStaleOpenAppState"),
  "Open App must fail safe and clear stale opening state"
);
const applyGoToAppBlock =
  appSource.match(/const applyGoToAppResult = useCallback\([\s\S]*?\n  \);/)?.[0] || "";
assertCheck(
  appSource.includes("scheduleMemberBundleHydration") &&
    appSource.includes("memberAccessReady") &&
    applyGoToAppBlock.length > 0 &&
    !applyGoToAppBlock.includes("markMemberSessionReady"),
  "member dashboards must hydrate the session bundle before memberSessionReady"
);
assertCheck(
  appSource.includes("isMemberAppPath(currentPathname)") &&
    appSource.includes("pathname: currentPathname"),
  "member route guard must evaluate the current URL, not stale route state"
);
assertCheck(
  !appSource.includes("You're signed in. Go to app") &&
    !appSource.includes("You’re signed in. Go to app"),
  "intrusive signed-in homepage banner must stay removed"
);
assertCheck(
  adminSessionSource.includes("export async function verifyAdminSession") &&
    adminSessionSource.includes('/api/auth/identity?action=admin-session"') &&
    !adminSessionSource.includes("isAdminSessionActive()") &&
    adminSessionSource.includes("clearStaleAdminBrowserState") &&
    adminSessionSource.includes('logAdminAudit("admin_restore_success"'),
  "admin session must be validated on the server, not localStorage"
);
assertCheck(
  adminShellSource.includes('phase === "checking"') &&
    adminShellSource.includes("Session expired. Please sign in again.") &&
    adminShellSource.includes("validateHardSession()") &&
    adminShellSource.indexOf("{children}") > adminShellSource.indexOf('phase === "authorized"'),
  "admin shell must not render dashboard content before server validation"
);
assertCheck(
  memberAuthSource.includes("PUBLIC_MEMBER_DATA_ACTIONS") &&
    memberAuthSource.includes("requireMemberAuth") &&
    memberAuthSource.includes("hasBodyIdentityMismatch"),
  "member data API must resolve identity from verified bearer tokens"
);
assertCheck(
  memberDataApiSource.includes("requireMemberAuth(req, body)") &&
    !memberDataApiSource.includes("resolveRequestIdentity"),
  "member data handler must not trust body identity"
);
assertCheck(
  memberDataClientSource.includes("memberApiHeaders") &&
    memberApiAuthSource.includes("supabase.auth.getSession"),
  "member data client calls must attach Supabase bearer tokens"
);
assertCheck(
  pinAuthThrottleSource.includes("PIN_AUTH_MAX_ATTEMPTS") &&
    pinAuthThrottleSource.includes("PIN_AUTH_WINDOW_MS") &&
    pinAuthThrottleSource.includes("PIN_AUTH_LOCK_MS") &&
    pinAuthThrottleSource.includes("checkMemoryMemberThrottle") &&
    pinAuthThrottleSource.includes("logMemberMemoryThrottleUsed"),
  "PIN auth throttle must expose attempts, window, lock constants, and memory fallback"
);
assertCheck(
  pinAuthThrottleSource.includes("action: \"pin_login\"") &&
    pinAuthThrottleSource.includes("action: \"pin_reset_complete\""),
  "PIN auth throttle must track pin_login and pin_reset_complete actions"
);
assertCheck(
  pinLoginApiSource.includes("pin_login_failed") &&
    pinLoginApiSource.includes("pin_login_locked") &&
    pinLoginApiSource.includes("pin_login_success") &&
    pinLoginApiSource.includes("buildAuthAuditContext") &&
    pinLoginApiSource.includes("logObservabilityEvent"),
  "PIN login API must log success, failure, and lock events with redacted identifiers"
);
assertCheck(
  pinResetApiSource.includes("pin_reset_failed") &&
    pinResetApiSource.includes("pin_reset_locked") &&
    pinResetApiSource.includes("pin_reset_success") &&
    pinResetApiSource.includes("buildAuthAuditContext") &&
    pinResetApiSource.includes("logObservabilityEvent"),
  "PIN reset API must log success, failure, and lock events with redacted identifiers"
);
assertCheck(
  pinLoginApiSource.includes("INVALID_LOGIN_MESSAGE") &&
    !pinLoginApiSource.includes("result.error || INVALID_LOGIN_MESSAGE"),
  "PIN login API must return generic invalid message"
);
assertCheck(
  apiErrorResponseSource.includes("ensureApiRequestContext") &&
    apiErrorResponseSource.includes("REQUEST_ID_HEADER") &&
    apiErrorResponseSource.includes("logSanitizedApiError") &&
    apiErrorResponseSource.includes("safeClientMessage") &&
    errorResponseSource.includes("createRequestId") &&
    errorResponseSource.includes("clientError") &&
    errorResponseSource.includes("logError") &&
    pinLoginApiSource.includes("sendLoggedApiError") &&
    pinLoginApiSource.includes('message: "Login failed."') &&
    memberDataApiSource.includes("sendLoggedApiError") &&
    memberDataApiSource.includes('message: "Member data request failed."') &&
    memberDataApiSource.includes('message: "Message blocked for safety."') &&
    memberPhotosApiSource.includes("sendLoggedApiError") &&
    memberPhotosApiSource.includes("photoStorageClientMessage") &&
    !pinLoginApiSource.includes("error.message ||") &&
    !memberDataApiSource.includes("error: error.message") &&
    !memberPhotosApiSource.includes("error: error.message"),
  "auth/member/photo APIs must not return raw error.message and must include request IDs"
);
assertCheck(
  pinResetApiSource.includes("INVALID_RESET_MESSAGE"),
  "PIN reset API must return generic invalid reset message"
);
assertCheck(
  photoReviewSharedSource.includes("getApprovedPublicPhotos") &&
    photoReviewSharedSource.includes("getApprovedMainPhoto") &&
    photoReviewSharedSource.includes('return status === "approved"'),
  "public photo surfaces must restrict to approved photos only"
);
assertCheck(
  cityHomeSource.includes("getApprovedMainPhoto") && !cityHomeSource.includes("discoverPhotoFromProfile"),
  "city home cards must use approved main photo helper"
);
assertCheck(
  memberSocialSource.includes("getApprovedMainPhoto") &&
    !memberSocialSource.includes("discoverPhotoFromProfile"),
  "member social discovery must use approved main photo helper"
);
assertCheck(
  diagnosticsAccessSource.includes("requireDiagnosticsAccess") &&
    diagnosticsAccessSource.includes('headers?.["x-diagnostics-secret"]') &&
    diagnosticsAccessSource.includes("verifySupabaseAdmin"),
  "diagnostics access helper must require secret header or admin session"
);
for (const [label, source] of [
  ["view-security", viewSecurityApiSource],
  ["function-security", functionSecurityApiSource],
  ["paystack-connectivity", paystackDiagnosticsApiSource]
]) {
  assertCheck(
    source.includes("requireDiagnosticsAccess(req)") &&
      source.includes("sendDiagnosticsAccessDenied") &&
      !source.includes("x-bamsignal-secret") &&
      !source.includes("Diagnostics secret required"),
    `${label} diagnostics endpoint must use shared auth and hide purpose on failure`
  );
}

assertCheck(
  photoUploadAttributionSource.includes("requireMemberAuth") &&
    photoUploadAttributionSource.includes("finalizeAuthenticatedPhotoUpload") &&
    memberPhotosApiSource.includes("resolvePhotoUploadOwner") &&
    !memberPhotosApiSource.includes("body.profileId"),
  "photo uploads must derive owner from bearer auth and attach server-side"
);
assertCheck(
  photoReviewServiceSource.includes("auth_user_id") &&
    photoReviewServiceSource.includes("attachUploadedPhotoToProfile") &&
    photoReviewServiceSource.includes("unattributed") &&
    photoReviewServiceSource.includes("trustedModeration") &&
    photoReviewServiceSource.includes("resolveMemberPhotoReviewStatus"),
  "photo reviews must store auth user attribution and enforce moderation authority"
);
assertCheck(
  profileMergeSource.includes("sanitizeMemberPhotoMeta") &&
    photoReviewSharedSource.includes("sanitizeMemberPhotoMeta") &&
    !memberPhotosApiSource.includes("body.photoReviewStatus"),
  "member profile save and photo APIs must not trust client moderation status"
);
assertCheck(
  profilePatchSharedSource.includes("PROFILE_PATCH_SCOPES") &&
    profileMergeSource.includes("patchScope") &&
    memberDataApiSource.includes("profilePatchScope") &&
    memberCityHomeClientSource.includes("profilePatchScope"),
  "profile saves must use scoped patches to avoid media race conditions"
);
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
assertCheck(
  goToAppSource.includes("fetchOnboardingStatusWithTimeout") &&
    goToAppSource.includes("hydrateMemberAppInBackground") &&
    !goToAppSource.includes("await bootstrapMemberSession") &&
    openAppCacheSource.includes("readOpenAppOnboardingCache"),
  "Open App must confirm onboarding on the server before routing home"
);
assertCheck(
  adminActionPinThrottleSource.includes("ADMIN_ACTION_PIN_MAX_ATTEMPTS") &&
    adminActionPinThrottleSource.includes("ADMIN_ACTION_PIN_LOCK_MS") &&
    adminActionPinThrottleSource.includes('ACTION = "admin_action_pin"') &&
    adminActionPinThrottleSource.includes("ADMIN_SECURITY_UNAVAILABLE_MESSAGE") &&
    adminActionPinThrottleSource.includes("failClosed"),
  "admin action PIN throttle must track durable attempts and fail closed during outages"
);
assertCheck(
  adminConsentServerSource.includes("attemptAdminActionPin") &&
    adminConsentServerSource.includes("admin_action_pin_failed") &&
    adminConsentServerSource.includes("admin_action_pin_locked") &&
    adminConsentServerSource.includes("admin_action_pin_success") &&
    adminConsentServerSource.includes("buildAdminAuditContext") &&
    adminConsentServerSource.includes("logObservabilityEvent") &&
    adminConsentServerSource.includes("INVALID_ADMIN_ACTION_PIN_MESSAGE"),
  "admin consent must throttle action PIN with redacted audit events"
);
assertCheck(
  adminConsentApiSource.includes("createConsentFromPin(req, body.pin)") &&
    adminConsentApiSource.includes("rotateAdminActionPin(req,"),
  "admin consent API must route PIN verification through throttled server helper"
);
assertCheck(
  dockerfileSource.includes("RUN npm run build") &&
    dockerfileSource.includes("RUN npm run test:source-integrity") &&
    dockerfileSource.indexOf("RUN npm run test:source-integrity") >
      dockerfileSource.indexOf("RUN npm run build") &&
    dockerfileSource.includes("node scripts/smoke-server-import.mjs") &&
    !dockerfileSource.match(/runner[\s\S]*RUN npm run test:source-integrity/),
  "Docker builder must run source integrity after build; runner must use runtime smoke only"
);
assertCheck(
  !smokeServerImportSource.includes('join(rootPath, "src"') &&
    !smokeServerImportSource.includes("readSrc(") &&
    smokeServerImportSource.includes("server/production.js"),
  "runtime smoke must not depend on src/"
);
assertCheck(
  appSource.includes("onPublicWebRoute") &&
    appSource.includes("!onPublicWebRoute") &&
    appSource.includes("shouldBlockForAuthRestore"),
  "public routes must never block on member session restore"
);
assertCheck(
  memberEntitlementsSource.includes("resolveSignalPassStatus") &&
    memberSocialSource.includes("resolveSignalPassStatus") &&
    !memberSocialSource.includes("Boolean(user.is_premium)") &&
    memberEntitlementsClientSource.includes("hasUnlimitedSignals") &&
    premiumStatusSource.includes("pruneExpiredBoosts"),
  "Signal Pass must be time-bound and separate from boost entitlements"
);
assertCheck(
  bootFlagsSource.includes("clearStaleBootFlags") &&
    bootFlagsSource.includes("bamsignal-otp-verify-pending") &&
    bootFlagsSource.includes("bamsignal-app-update-pending") &&
    mainSource.includes("clearStaleBootFlags()"),
  "boot must clear stale opening, restore, OTP, and app-update flags"
);
assertCheck(
  goToAppSource.includes("validateServerSessionWithTimeout") &&
    goToAppSource.includes("OPEN_APP_STATUS_TIMEOUT_MS"),
  "Open App session validation must time out quickly"
);
assertCheck(
  authPageSource.includes("OTP_VERIFY_TIMEOUT_MS = 15_000") &&
    authPageSource.includes("USER_MESSAGES.otpVerifySlow") &&
    authPageSource.includes("markOtpVerifyPending"),
  "OTP verify must fail safe after 15 seconds"
);
assertCheck(
  serviceWorkerSource.includes("notifyConnectionRefreshed") &&
    !serviceWorkerSource.includes("showUpdatingOverlay") &&
    serviceWorkerSource.includes("silentRecoveryReload"),
  "app update recovery must reload silently without the updating overlay"
);
assertCheck(
  blockedEmailSource.includes('"blondmail.com"') &&
    blockedEmailSource.includes('"tempmailo.com"') &&
    isDisposableEmail("jamesowen@blondmail.com") &&
    isDisposableEmail("USER@BLONDMAIL.COM") &&
    isDisposableEmail("user@sub.blondmail.com") &&
    !isDisposableEmail("user@gmail.com") &&
    !isDisposableEmail("user@yahoo.com") &&
    !isDisposableEmail("user@outlook.com"),
  "disposable email blocklist must reject blondmail and allow real providers"
);
assertCheck(
  photoUploadGridSource.includes("createSerializedQueue") &&
    photoUploadGridSource.includes("commitUploadedPhoto") &&
    photoUploadGridSource.includes("mergeUploadedProfilePhoto") &&
    photoUploadGridSource.includes("UPLOAD_CONCURRENCY = 3") &&
    profilePhotoUploadSource.includes("runWithConcurrency") &&
    !photoUploadGridSource.includes("const snapshot = workingRef.current"),
  "multi-photo upload must serialize commits and upload with bounded concurrency"
);
assertCheck(
  signupOtpSource.includes("assertEmailNotDisposable(normalized)") &&
    signupIdentitySource.includes("Please use a real email address to continue.") &&
    authPageSource.includes("DISPOSABLE_EMAIL_MESSAGE"),
  "signup must block disposable emails on server and client before OTP"
);
assertCheck(
  signupOtpSource.includes('from "./signupProvisioning.js"') &&
    signupOtpSource.includes("runSignupProvisioning") &&
    signupProvisioningSource.includes("assertSchemaTable") &&
    signupProvisioningSource.includes("signup_provisioning_attempts") &&
    signupProvisioningSource.includes("export async function beginProvisioning") &&
    signupProvisioningSource.includes("export async function resumeProvisioning") &&
    signupProvisioningSource.includes("export async function completeProvisioning") &&
    signupProvisioningSource.includes("export async function cleanupProvisioning") &&
    signupProvisioningSource.includes("auth_cleanup_pending") &&
    signupProvisioningSource.includes("shouldCleanupOrphanAuthUser") &&
    signupProvisioningSource.includes("provisioning_resume") &&
    existsSync(join(rootPath, "migrations/0002_baseline_bamsignal_schema.sql")) &&
    existsSync(join(rootPath, "supabase/migrations/202606211430_signup_provisioning_recovery.sql")),
  "signup provisioning must be resumable and clean up newly-created orphan auth users"
);
assertCheck(
  schemaVerificationSource.includes("export async function checkSchema") &&
    schemaVerificationSource.includes("REQUIRED_SCHEMA_TABLES") &&
    dbStartupSource.includes("checkSchema({ force: true })") &&
    !dbStartupSource.includes("create table if not exists") &&
    !dbStartupSource.includes("alter table") &&
    existsSync(join(rootPath, "migrations/0001_schema_migrations.sql")) &&
    existsSync(join(rootPath, "migrations/0002_baseline_bamsignal_schema.sql")) &&
    existsSync(join(rootPath, "server/migrationRunner.js")),
  "startup must verify migrated schema and never mutate database DDL at runtime"
);
assertCheck(
  rateLimitRetentionSource.includes("runRateLimitRetentionCleanup") &&
    rateLimitRetentionSource.includes("startRateLimitRetentionScheduler") &&
    retentionBatchDeleteSource.includes("batchDeleteOlderThan") &&
    retentionBatchDeleteSource.includes("API_RATE_EVENTS_RETENTION_MS = 7 * DAY_MS") &&
    retentionBatchDeleteSource.includes("PAYMENT_INITIALIZE_EVENTS_RETENTION_MS = 30 * DAY_MS") &&
    retentionBatchDeleteSource.includes("OTP_ATTEMPTS_RETENTION_MS = 7 * DAY_MS") &&
    retentionBatchDeleteSource.includes("PIN_AUTH_ATTEMPTS_RETENTION_MS = 30 * DAY_MS") &&
    rateLimitRetentionMigrationSource.includes("api_rate_events_created_at_idx") &&
    rateLimitRetentionMigrationSource.includes("payment_initialize_rate_events_created_at_idx") &&
    rateLimitRetentionMigrationSource.includes("pin_auth_attempts_last_attempt_at_idx") &&
    productionServerSource.includes("startRateLimitRetentionScheduler") &&
    existsSync(join(rootPath, "migrations/0003_rate_limit_retention_indexes.sql")),
  "rate-limit tables must define retention cleanup, batch deletes, and scheduled pruning"
);
assertCheck(
  !complianceUtilSource.includes("onboardingComplete") &&
    complianceUtilSource.includes('"offline_safety"') &&
    complianceUtilSource.includes("offline_safety") &&
    appSource.includes("shouldBlockForCompliance(datingProfileForCompliance.compliance, user)") &&
    !appSource.includes("onboardingComplete: onboardingCompleteForCompliance") &&
    complianceGateSource.includes("saveComplianceAcknowledgements") &&
    complianceGateSource.includes("complianceGatePhase") &&
    !complianceGateSource.includes("dismissComplianceGateForever") &&
    complianceGateSource.includes("SAFETY_PLEDGE_RULES") &&
    complianceGateSource.includes("OFFLINE_SAFETY_COPY"),
  "post-onboarding compliance gate must run multi-step checkpoints without onboarding bypass"
);
assertCheck(
  fastConnectionIntentSource.includes("sanitizeIntentsForActivePass") &&
    fastConnectionIntentSource.includes("handleQuickieIntentTap") &&
    fastConnectionStateSource.includes("fastConnectionInterested") &&
    fastConnectionStateSource.includes("snoozeFastConnectionActivation") &&
    onboardingPageSource.includes("fastConnectionInterested") &&
    !onboardingPageSource.includes("useFastConnectionCheckout") &&
    !onboardingPageSource.includes("FastConnectionSheet") &&
    homePageSource.includes("FastConnectionActivationSheet") &&
    homePageSource.includes("useFastConnectionActivationPrompt") &&
    fastConnectionActivationSheetSource.includes("Activate Fast Connection") &&
    fastConnectionActivationSheetSource.includes("Maybe later") &&
    fastConnectionActivationHookSource.includes("startFastConnectionActivationPayment") &&
    paymentsSource.includes("startFastConnectionActivationPayment") &&
    profilePageSource.includes("fastConnectionActiveLabel"),
  "Fast Connection must defer payment from onboarding and prompt activation on Home"
);
assertCheck(
  fastConnectionServerSource.includes("listFastConnectionPool") &&
    fastConnectionServerSource.includes("fastConnectionInterested") &&
    fastConnectionServerSource.includes("fetchFastConnectionSignalStatus") &&
    fastConnectionServerSource.includes("sendFastConnectionSignal") &&
    fastConnectionServerSource.includes("app_fast_connection_daily") &&
    memberDataApiSource.includes('action === "fast-connection-pool"') &&
    memberDataApiSource.includes('action === "fast-connection-signal"') &&
    fastConnectionPoolServiceSource.includes("fetchFastConnectionPool") &&
    fastConnectionPageSource.includes("No Fast Connection matches nearby yet") &&
    fastConnectionPageSource.includes("fastSignalsStatusLabel") &&
    !fastConnectionPageSource.includes('navigateToPath("/discover")') &&
    !fastConnectionPageSource.includes("Open Discover"),
  "Fast Connection must use a dedicated local pool with server-enforced signals"
);
assertCheck(
  fastConnectionServerSource.includes("computeFastConnectionExpiryReminder") &&
    fastConnectionServerSource.includes("listFastConnectionPurchaseHistory") &&
    memberDataApiSource.includes('action === "fast-connection-history"') &&
    fastConnectionPageSource.includes("FastConnectionRenewalSheet") &&
    fastConnectionRenewalSheetSource.includes("Fast Connection expired.") &&
    homePageSource.includes("FastConnectionExpiryBanner") &&
    fastConnectionPoolServiceSource.includes("fetchFastConnectionPurchaseHistory") &&
    paymentsSource.includes("startFastConnectionRenewalPayment") &&
    profilePageSource.includes("FastConnectionPurchaseHistory"),
  "Fast Connection must handle expiry, renewal, reminders, and purchase history"
);
assertCheck(
  accountSecuritySource.includes("memberApiHeaders") &&
    accountSecuritySource.includes('action=${action}') &&
    accountSecuritySource.includes('"security-settings"') &&
    accountSecuritySource.includes('"two-factor-enable"') &&
    accountSecuritySource.includes("resolveMemberIdentity") &&
    twoFactorCardSource.includes("fetchSecuritySettingsRemote") &&
    twoFactorCardSource.includes("resolveMemberIdentity") &&
    twoFactorCardSource.includes("Two-factor authentication enabled.") &&
    twoFactorCardSource.includes("Retry") &&
    memberDataApiSource.includes('action === "security-settings"') &&
    memberDataApiSource.includes('action === "two-factor-enable"') &&
    memberDataApiSource.includes("requireMemberAuth"),
  "two-factor settings must load and save through authenticated member API"
);
assertCheck(
  profileOptionsSource.includes("MAX_OPTIONAL_PREFERENCE_SELECTIONS = 3") &&
    profileOptionsSource.includes("OPTIONAL_PREFERENCE_LIMIT_MESSAGE") &&
    profileOptionsSource.includes("normalizeOccupations") &&
    profileOptionsSource.includes("normalizeStatesOfOrigin") &&
    profileOptionsSource.includes("normalizeGenotypes") &&
    profileOptionsSource.includes("normalizeHasKidsOptions") &&
    profileOptionsSource.includes("normalizeWantsKidsOptions") &&
    profileOptionsSource.includes("normalizeBodyTypes") &&
    matchPreferenceFieldsSource.includes("MAX_OPTIONAL_PREFERENCE_SELECTIONS") &&
    matchPreferenceFieldsSource.includes("OPTIONAL_PREFERENCE_LIMIT_MESSAGE") &&
    memberOptionalPreferencesSource.includes("normalizeProfileOptionalPreferences") &&
    memberDataApiSource.includes("normalizeProfileOptionalPreferences") &&
    memberSocialSource.includes("normalizeSearchOccupations") &&
    memberSocialSource.includes("normalizeSearchStatesOfOrigin"),
  "optional profile preferences must cap at three selections client and server"
);
assertCheck(
  intentsSource.includes("MAX_INTENT_SELECTIONS = 3") &&
    intentsSource.includes("toggleIntentSelection") &&
    intentsSource.includes("You can select up to 3 intentions.") &&
    profileOptionsSource.includes("MAX_RELATIONSHIP_INTENTION_SELECTIONS = 3") &&
    profileOptionsSource.includes("normalizeRelationshipIntentions") &&
    matchPreferenceFieldsSource.includes("MAX_RELATIONSHIP_INTENTION_SELECTIONS") &&
    discoverFiltersSource.includes("toggleIntentSelection") &&
    discoverFiltersSource.includes("MAX_INTENT_SELECTIONS") &&
    memberDataApiSource.includes("normalizeProfileIntents") &&
    memberIntentsSharedSource.includes("MAX_INTENT_SELECTIONS = 3") &&
    memberSocialSource.includes("normalizeRelationshipIntentions"),
  "relationship and profile intentions must cap at three selections client and server"
);
assertCheck(
  profilePageSource.includes("profile-save-feedback") &&
    profilePageSource.includes("syncMemberProfileWithResult") &&
    profilePageSource.includes("revalidateMemberProfileAfterUpdate") &&
    profilePageSource.includes("returnToProfileOverview") &&
    profilePageSource.includes("USER_MESSAGES.profileSaved") &&
    profilePageSource.includes("600"),
  "profile save must confirm below Save, refresh data, and return to overview"
);
assertCheck(
  voiceIntroSource.includes("uploadVoiceIntroBlob") &&
    voiceIntroSource.includes("Use this voice intro") &&
    voiceIntroSource.includes("isVoiceRecordingSupported") &&
    voiceRecordingSource.includes("MAX_VOICE_SECONDS = 30") &&
    voiceIntroUploadSource.includes("/api/member/voice?action=upload") &&
    voiceIntroStorageSource.includes("VOICE_INTROS_BUCKET") &&
    serverAppSource.includes('"/api/member/voice"') &&
    profilePageSource.includes("getVoiceVibeUrl") &&
    profilePageSource.includes("VoiceVibeWaveformCard") &&
    userMessagesSource.includes("voiceIntroSaveFailed"),
  "voice intro must record, upload to storage, and persist on profile"
);
assertCheck(
  memberProfileSyncSource.includes("revalidateMemberProfileAfterUpdate") &&
    memberProfileSyncSource.includes("MEMBER_PROFILE_UPDATED_EVENT") &&
    memberProfileSyncSource.includes("invalidateMemberProfileCaches") &&
    memberProfileListenerSource.includes("useMemberProfileListener") &&
    memberDataClientSource.includes("serverWins") &&
    profilePageSource.includes("revalidateMemberProfileAfterUpdate") &&
    discoverPageSource.includes("useMemberProfileListener") &&
    homePageSource.includes("useMemberProfileListener"),
  "profile updates must revalidate server snapshot and broadcast to member pages"
);
assertCheck(
  sourceIntegrityScriptSource.includes('if (!existsSync(srcRoot))') &&
    sourceIntegrityScriptSource.includes("source integrity skipped"),
  "source integrity must skip gracefully when src/ is absent"
);
assertCheck(
  paymentCatalogSource.includes("DEFAULT_BOOST_CATALOG") &&
    paymentCatalogSource.includes("resolvePaymentProduct") &&
    paymentCatalogSource.includes("verifyExpectedAmount") &&
    paymentFortressSource.includes("recordPurchaseIntent") &&
    paymentFortressSource.includes("assertVerifiedPurchaseAmount") &&
    paymentFortressSource.includes("completePaymentFulfillment") &&
    paystackWebhookHandlerSource.includes("completePaymentFulfillment") &&
    paystackVerifySource.includes("resolveInitializeIntent") &&
    paystackVerifySource.includes("completePaymentFulfillment") &&
    !paystackVerifySource.includes("body.amount") &&
    !paystackVerifySource.includes("body.durationHours") &&
    !paystackVerifySource.includes("metadata.quickie_days") &&
    !paystackVerifySource.includes("metadata.duration_hours || body.durationHours") &&
    paystackWebhookSource.includes("handlePaystackWebhookRequest") &&
    !paystackWebhookSource.includes("completePaymentFulfillment") &&
    paymentsSource.includes("?action=initialize") &&
    paymentsSource.includes("productId: plan.id") &&
    paymentsSource.includes('productId: "fast-connection-pass"') &&
    paymentsSource.includes("productId: boostId") &&
    !paymentsSource.includes("durationHours,") &&
    !paymentsSource.includes("amount: plan.price") &&
    !paymentsSource.includes("dailyFastSignals"),
  "payment pricing and entitlements must be server authoritative"
);
assertCheck(
  paystackVerifySource.includes("requireMemberAuth(req, body)") &&
    paystackVerifySource.includes("enforcePaymentInitializeThrottle") &&
    paystackVerifySource.includes("PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE") &&
    paystackVerifySource.indexOf("requireMemberAuth(req, body)") <
      paystackVerifySource.indexOf("if (!paystackConfigured())") &&
    paymentInitializeThrottleSource.includes("payment_initialize_rate_events") &&
    paymentInitializeThrottleSource.includes("PAYMENT_INITIALIZE_MAX_REQUESTS = 5") &&
    paymentInitializeThrottleSource.includes("PAYMENT_INITIALIZE_WINDOW_MS = 60 * 1000") &&
    paymentInitializeThrottleSource.includes("PAYMENT_INITIALIZE_BURST_MAX_REQUESTS") &&
    paymentInitializeThrottleSource.includes("checkMemoryMemberThrottle") &&
    paymentInitializeThrottleSource.includes("payment_initialize_rate_limited") &&
    paymentInitializeThrottleSource.includes("prunePaymentThrottleEvents") &&
    paymentsSource.includes("memberApiHeaders") &&
    paymentsSource.includes("headers: await memberApiHeaders()"),
  "Paystack initialize must require member auth, throttle by member/client identity, fail closed to memory, and log rate limits"
);
assertCheck(
  paystackVerifySource.includes("PAYMENT_INITIALIZE_CLIENT_ERROR") &&
    paystackVerifySource.includes("PAYMENT_VERIFY_CLIENT_ERROR") &&
    paystackVerifySource.includes("logPaymentProviderError") &&
    !paystackVerifySource.includes("PAYSTACK_SECRET_KEY is not configured.") &&
    !paystackVerifySource.includes("error.message || \"Payment request failed.\"") &&
    readFileSync(join(rootPath, "server/services/paystackClient.js"), "utf8").includes(
      "payment_provider_error"
    ) &&
    readFileSync(join(rootPath, "server/services/paystackClient.js"), "utf8").includes(
      "upstreamMessage"
    ),
  "Paystack client responses must stay generic while provider diagnostics remain server-side"
);
assertCheck(
  paymentDbSource.includes("requireDatabaseReadyForPayments") &&
    paymentDbSource.includes("paymentQuery") &&
    paymentFulfillmentsSource.includes("requireDatabaseReadyForPayments") &&
    paymentFulfillmentsSource.includes("assertPaymentPersistenceRow") &&
    paymentFortressSource.includes("completePaymentFulfillment") &&
    paystackVerifySource.includes("completePaymentFulfillment") &&
    paystackVerifySource.includes("PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE") &&
    paystackVerifySource.includes("status(503)") &&
    paystackWebhookHandlerSource.includes("status: 503") &&
    paystackWebhookSource.includes("handlePaystackWebhookRequest") &&
    !paystackWebhookSource.includes("completePaymentFulfillment") &&
    paymentsSource.includes("PAYMENT_CONFIRM_UNAVAILABLE") &&
    paymentsSource.includes("response.status === 503") &&
    paymentsSource.includes("retryable: true") &&
    !paystackVerifySource.includes("await notifyPurchaseEmail") &&
    paymentFortressSource.includes("sendPurchaseConfirmationEmail"),
  "payment fulfillment must fail closed when persistence is unavailable"
);
assertCheck(
  paymentFulfillmentsSource.includes("claimPaymentFulfillmentProcessing") &&
    paymentFulfillmentsSource.includes("status = 'processing'") &&
    paymentFulfillmentsSource.includes("processing_started_at < now() -") &&
    paymentFortressSource.includes("fulfillmentAlreadyInProgress") &&
    paymentFortressSource.includes("processingClaim.claimed") &&
    paystackVerifySource.includes("result.processing") &&
    paystackVerifySource.includes("status(503)") &&
    paystackWebhookHandlerSource.includes("result?.processing") &&
    paystackWebhookHandlerSource.includes("status: 503") &&
    cityHomeSource.includes("on conflict (paystack_reference)") &&
    paymentRuntimeSchemaSource.includes("payment_fulfillments_reference_unique_idx") &&
    paymentRuntimeSchemaSource.includes("app_users_paystack_reference_unique_idx") &&
    paymentRuntimeSchemaSource.includes("city_home_placements_paystack_reference_unique_idx") &&
    paymentFulfillmentRaceMigrationSource.includes("payment_fulfillments_reference_unique_idx") &&
    paymentFulfillmentRaceMigrationSource.includes("app_users_paystack_reference_unique_idx") &&
    paymentFulfillmentRaceMigrationSource.includes("city_home_placements_paystack_reference_unique_idx"),
  "payment fulfillment must atomically claim processing and enforce unique Paystack references"
);
assertCheck(
  paystackWebhookHandlerSource.includes("/api/paystack/webhook") &&
    paystackRouterSource.includes("PAYSTACK_WEBHOOK_MOUNT_PATHS") &&
    paystackRouterSource.includes("handlePaystackWebhookExpress") &&
    paystackWebhookSource.includes("handlePaystackWebhookRequest") &&
    !paystackWebhookSource.includes("fulfillVerifiedPurchase") &&
    !paystackRouterSource.includes("fulfillVerifiedPurchase") &&
    paystackWebhookHandlerSource.includes("verifyPaystackWebhookSignature") &&
    serverAppSource.includes("PAYSTACK_WEBHOOK_MOUNT_PATHS"),
  "Paystack webhook routes must use one shared handler"
);
const readinessServiceSource = readFileSync(join(rootPath, "server/services/readiness.js"), "utf8");
assertCheck(
  serverAppSource.includes('app.get("/health"') &&
    serverAppSource.includes("livenessPayload()") &&
    serverAppSource.includes('app.get("/ready"') &&
    serverAppSource.includes("readinessPayload") &&
    readinessServiceSource.includes("isPhotoStorageConfigured") &&
    !serverAppSource.includes("healthPayload"),
  "health endpoints must split liveness (/health) from readiness (/ready)"
);
assertCheck(
  dockerfileSource.includes("/ready") &&
    !dockerfileSource.match(/HEALTHCHECK[\s\S]*\/health/),
  "Docker HEALTHCHECK must probe /ready for production dependency readiness"
);
assertCheck(
  identityExposureSource.includes("identity_exposure_blocked") &&
    identityExposureSource.includes("admin_status_hidden") &&
    identityExposureSource.includes("sanitizePublicMemberProfile") &&
    identityApiSource.includes("requireMemberIdentity") &&
    !identityApiSource.includes("exists: true") &&
    memberDataApiSource.includes("sanitizePublicMemberProfile") &&
    !memberDataApiSource.includes("Account not found") &&
    loginSecurityApiSource.includes("requireMemberAuth(req, body)") &&
    diagnosticsAccessSource.includes("logDiagnosticsAccessDenied") &&
    adminAuthServerSource.includes("logAdminStatusHidden") &&
    hardSetupApiSource.includes("validateSetupHeader") &&
    hardSetupApiSource.includes("hasForbiddenSetupSecretChannel") &&
    hardSetupApiSource.includes("requireLegacySetupEnabled") &&
    !hardSetupApiSource.includes("hasSetupSecret") &&
    !memberAuthSource.includes('"check-username"'),
  "identity and admin status exposure must stay minimized for public callers"
);
assertCheck(
  consoleSetupAccessSource.includes("LEGACY_SETUP_SECRET") &&
    consoleSetupAccessSource.includes("LEGACY_SETUP_ENABLED") &&
    consoleSetupAccessSource.includes("x-setup-secret") &&
    !consoleSetupAccessSource.includes("CRON_SECRET") &&
    hardSetupApiSource.includes("sendLegacySetupAccessDenied") &&
    !hardSetupApiSource.includes("req.query.secret") &&
    !hardSetupApiSource.includes("body.setupSecret") &&
    !hardSetupApiSource.includes("x-bamsignal-secret"),
  "legacy setup endpoint must stay locked to dedicated header secret and enable flag"
);
assertCheck(
  adminBootstrapAccessSource.includes("ADMIN_BOOTSTRAP_SECRET") &&
    adminBootstrapAccessSource.includes("ADMIN_BOOTSTRAP_ENABLED") &&
    adminBootstrapAccessSource.includes("x-admin-bootstrap-secret") &&
    !adminBootstrapAccessSource.includes("CRON_SECRET") &&
    !adminBootstrapAccessSource.includes("DIAGNOSTICS_SECRET") &&
    adminBootstrapApiSource.includes("requireAdminBootstrapAccess(req)") &&
    !adminBootstrapApiSource.includes("req.query.secret") &&
    !adminBootstrapApiSource.includes("body.secret") &&
    !adminBootstrapApiSource.includes("result.password"),
  "admin bootstrap endpoint must stay locked to dedicated header secret and enable flag"
);
assertCheck(
  observabilitySource.includes("requestContextMiddleware") &&
    observabilitySource.includes("sanitizeLogContext") &&
    serverAppSource.includes("requestContextMiddleware") &&
    paystackVerifyApiSource.includes("logPaymentProviderError") &&
    paystackVerifyApiSource.includes("observabilityContext") &&
    readFileSync(join(rootPath, "server/services/paystackClient.js"), "utf8").includes(
      "payment_verify_failed"
    ),
  "observability middleware and payment failure events must be wired"
);
assertCheck(
  existsSync(join(rootPath, "docs/runbooks/database-backup.md")) &&
    existsSync(join(rootPath, "docs/runbooks/database-restore.md")) &&
    existsSync(join(rootPath, "docs/runbooks/storage-backup.md")) &&
    existsSync(join(rootPath, "docs/runbooks/storage-restore.md")) &&
    existsSync(join(rootPath, "docs/runbooks/deployment-recovery.md")) &&
    existsSync(join(rootPath, "docs/runbooks/payment-recovery.md")),
  "disaster recovery runbooks must exist under docs/runbooks/"
);
assertCheck(
  existsSync(join(rootPath, "src/app/lazyRoutes.ts")) &&
    existsSync(join(rootPath, "src/app/AdminConsoleRoot.tsx")) &&
    !appSource.includes('from "./pages/AdminHubPage"') &&
    !appSource.includes('from "./pages/AdminAuthPage"') &&
    appSource.includes("LazyAdminConsoleRoot"),
  "admin console must stay out of the App.tsx main bundle"
);
assertCheck(
  existsSync(join(rootPath, "server/services/retryPolicy.js")) &&
    readSrc("server/services/observability.js").includes("logThresholdedAlert") &&
    readSrc("src/utils/serviceWorker.ts").includes("MAX_RECOVERY_RELOADS") &&
    readSrc("src/App.tsx").includes("MAX_COMPLIANCE_SYNC_ATTEMPTS"),
  "stability guards must keep bounded retries and recovery reload caps"
);
assertCheck(
  existsSync(join(rootPath, "server/services/boundedMemoryStore.js")) &&
    readSrc("server/services/boundedMemoryStore.js").includes("MEMORY_STORE_MAX_ENTRIES") &&
    readSrc("server/services/boundedMemoryStore.js").includes("runMemoryStoreCleanup") &&
    readSrc("server/services/memoryThrottle.js").includes("createBoundedMemoryStore") &&
    readSrc("server/services/signupOtp.js").includes("createBoundedMemoryStore") &&
    readSrc("server/services/pinReset.js").includes("createBoundedMemoryStore"),
  "auth and OTP memory fallback stores must use bounded caps and periodic cleanup"
);
assertCheck(
  existsSync(join(rootPath, "server/services/logRedaction.js")) &&
    readSrc("server/services/logRedaction.js").includes("maskEmailForLog") &&
    readSrc("server/services/pinLogin.js").includes("sanitizeAuthDebugLog") &&
    readSrc("server/services/loginResolve.js").includes("sanitizeAuthDebugLog"),
  "auth and admin logs must redact identifiers before emission"
);

console.log("source integrity ok");
