/**
 * Static source integrity checks — requires src/ (not present in Docker runner).
 * Run locally and in pre-push; skipped when src/ is absent.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
const memberDataApiSource = readSrc("api/member/data.js");
const memberAuthSource = readSrc("server/services/memberAuth.js");
const memberDataClientSource = readSrc("src/services/memberData.ts");
const memberApiAuthSource = readSrc("src/utils/memberApiAuth.ts");
const pinLoginApiSource = readSrc("api/auth/pin-login.js");
const pinResetApiSource = readSrc("api/auth/pin-reset.js");
const pinAuthThrottleSource = readSrc("server/services/pinAuthThrottle.js");
const photoReviewSharedSource = readSrc("shared/photoReview.mjs");
const cityHomeSource = readSrc("server/cityHome.js");
const memberSocialSource = readSrc("server/memberSocial.js");

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
  purchaseEmailSource.includes("purchaseEmailAlreadySent(reference)") &&
    purchaseEmailSource.includes("markPurchaseEmailSent(reference)") &&
    purchaseEmailSource.indexOf("markPurchaseEmailSent(reference)") <
      purchaseEmailSource.indexOf("const sendResult = await sendResendPurchaseEmail"),
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
    appSource.includes('flowLog("home_enter", { source: "open_app_fast" })') &&
    appSource.includes("validateServerSession") &&
    appSource.includes("repairGoToAppInBackground") &&
    appSource.includes('navigateToPath("/home", true)'),
  "Open App must route cached completed users to /home immediately"
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
    adminSessionSource.includes('logAdminAudit("admin_restore_success")'),
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
    pinAuthThrottleSource.includes("PIN_AUTH_LOCK_MS"),
  "PIN auth throttle must expose attempts, window, and lock constants"
);
assertCheck(
  pinAuthThrottleSource.includes("action: \"pin_login\"") &&
    pinAuthThrottleSource.includes("action: \"pin_reset_complete\""),
  "PIN auth throttle must track pin_login and pin_reset_complete actions"
);
assertCheck(
  pinLoginApiSource.includes("pin_login_failed") &&
    pinLoginApiSource.includes("pin_login_locked") &&
    pinLoginApiSource.includes("pin_login_success"),
  "PIN login API must log success, failure, and lock events"
);
assertCheck(
  pinResetApiSource.includes("pin_reset_failed") &&
    pinResetApiSource.includes("pin_reset_locked") &&
    pinResetApiSource.includes("pin_reset_success"),
  "PIN reset API must log success, failure, and lock events"
);
assertCheck(
  pinLoginApiSource.includes("INVALID_LOGIN_MESSAGE") &&
    !pinLoginApiSource.includes("result.error || INVALID_LOGIN_MESSAGE"),
  "PIN login API must return generic invalid message"
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

console.log("source integrity ok");
