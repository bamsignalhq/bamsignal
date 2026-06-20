/**
 * Verify production server modules resolve (catches missing shared/*.mjs, etc.).
 * Uses a free port so local dev on :3000 does not block the check.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const port = Number(process.env.SMOKE_PORT || process.env.PORT || 39451);
process.env.PORT = String(port);

const productionPath = join(dirname(fileURLToPath(import.meta.url)), "..", "server", "production.js");
const productionSource = readFileSync(productionPath, "utf8");
const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const requiredRouteMounts = [
  { method: "post", route: "/api/auth/pin-login" },
  { method: "post", route: "/api/auth/pin-reset" },
  { method: "post", route: "/api/auth/email-code" },
  { method: "post", route: "/api/member/data" }
];
for (const { method, route } of requiredRouteMounts) {
  const mountPattern = new RegExp(
    `mountHandler\\(\\s*app\\s*,\\s*["']${method}["']\\s*,\\s*["']${route.replace(/\//g, "\\/")}["']`
  );
  const expressPattern = new RegExp(`app\\.${method}\\(\\s*["']${route.replace(/\//g, "\\/")}["']`);
  if (!mountPattern.test(productionSource) && !expressPattern.test(productionSource)) {
    console.error(`server smoke failed: missing ${method.toUpperCase()} route mount for ${route}`);
    process.exit(1);
  }
}

function assertSmoke(condition, message) {
  if (condition) return;
  console.error(`server smoke failed: ${message}`);
  process.exit(1);
}

const signupMathSource = readFileSync(join(rootPath, "server", "services", "signupMathChallenge.js"), "utf8");
const authPageSource = readFileSync(join(rootPath, "src", "pages", "AuthPage.tsx"), "utf8");
const appSource = readFileSync(join(rootPath, "src", "App.tsx"), "utf8");
const adminSessionSource = readFileSync(join(rootPath, "src", "utils", "adminSession.ts"), "utf8");
const adminShellSource = readFileSync(join(rootPath, "src", "components", "admin", "AdminShell.tsx"), "utf8");
const paymentsSource = readFileSync(join(rootPath, "src", "services", "payments.ts"), "utf8");
const paymentReturnSource = readFileSync(join(rootPath, "src", "utils", "paymentReturn.ts"), "utf8");
const purchaseEmailSource = readFileSync(
  join(rootPath, "server", "services", "purchaseEmail.js"),
  "utf8"
);

assertSmoke(
  paymentReturnSource.includes("hasPaystackCallbackInUrl") &&
    paymentReturnSource.includes('path === "/payment/success" || hasPaystackCallbackInUrl()'),
  "payment callback params must be intercepted before public homepage render"
);
assertSmoke(
  paymentsSource.includes('buildReturnContext("boost", boostId, returnContext, "/profile")'),
  "profile boost checkout must default back to /profile"
);
assertSmoke(
  paymentsSource.includes("returnPath: resolvePaymentReturnPath({ tab, pathname: memberPathname })") ||
    appSource.includes("returnPath: resolvePaymentReturnPath({ tab, pathname: memberPathname })"),
  "Signal Pass checkout must save the current member return path"
);
assertSmoke(
  appSource.indexOf("const returnPath = normalizePaymentReturnPath") >= 0 &&
    appSource.indexOf("const returnPath = normalizePaymentReturnPath") < appSource.indexOf("clearPaymentSession()"),
  "payment success must preserve returnPath before clearing payment state"
);
assertSmoke(
  appSource.includes("paymentReturnActive") && appSource.includes("!paymentReturnActive"),
  "session restore must not swallow Paystack callback params"
);
assertSmoke(
  purchaseEmailSource.includes("purchaseEmailAlreadySent(reference)") &&
    purchaseEmailSource.includes("markPurchaseEmailSent(reference)") &&
    purchaseEmailSource.indexOf("markPurchaseEmailSent(reference)") <
      purchaseEmailSource.indexOf("const sendResult = await sendResendPurchaseEmail"),
  "purchase confirmation email must be claimed once per reference before sending"
);
assertSmoke(
  signupMathSource.includes("createHmac") &&
    signupMathSource.includes("buildSignupMathChallengeToken") &&
    !signupMathSource.includes("const challenges = new Map") &&
    signupMathSource.includes('"challenge_expired"'),
  "signup math challenge must use signed stateless tokens"
);
assertSmoke(
  authPageSource.includes("onRefresh={() => void loadMathChallenge()}") &&
    authPageSource.includes('error.code === "challenge_expired"'),
  "signup math challenge must refresh expired tokens in the client"
);
assertSmoke(
  appSource.includes("const isPublicSurface") &&
    appSource.includes('memberAppEntered && !isPublicSurface ? "platform-root--member" : ""') &&
    appSource.includes("showMemberNav={isAuthed && memberAppEntered && !isPublicSurface}"),
  "public routes must not render the member shell"
);
assertSmoke(
  appSource.includes("showOpenApp={isAuthed && isPublicHome}") &&
    appSource.includes('flowLog("home_enter", { source: "open_app_fast" })') &&
    appSource.includes("validateServerSession") &&
    appSource.includes("repairGoToAppInBackground") &&
    appSource.includes('navigateToPath("/home", true)'),
  "Open App must route cached completed users to /home immediately"
);
assertSmoke(
  appSource.includes("setAuthPath(AUTH_SIGNUP_PATH)") &&
    appSource.includes("navigateToPath(AUTH_SIGNUP_PATH, true)"),
  "Open App without a session must route to /love/sign"
);
assertSmoke(
  appSource.includes("OPEN_APP_FAILSAFE_MS") &&
    appSource.includes("clearOpenAppPendingState") &&
    appSource.includes("expireStaleOpenAppState"),
  "Open App must fail safe and clear stale opening state"
);
assertSmoke(
  appSource.includes("isMemberAppPath(currentPathname)") &&
    appSource.includes("pathname: currentPathname"),
  "member route guard must evaluate the current URL, not stale route state"
);
assertSmoke(
  !appSource.includes("You're signed in. Go to app") &&
    !appSource.includes("You’re signed in. Go to app"),
  "intrusive signed-in homepage banner must stay removed"
);
assertSmoke(
  adminSessionSource.includes("export async function verifyAdminSession") &&
    adminSessionSource.includes('/api/auth/identity?action=admin-session"') &&
    !adminSessionSource.includes("isAdminSessionActive()") &&
    adminSessionSource.includes("clearStaleAdminBrowserState") &&
    adminSessionSource.includes('logAdminAudit("admin_restore_success")'),
  "admin session must be validated on the server, not localStorage"
);
assertSmoke(
  adminShellSource.includes('phase === "checking"') &&
    adminShellSource.includes("Session expired. Please sign in again.") &&
    adminShellSource.includes("validateHardSession()") &&
    adminShellSource.indexOf("{children}") > adminShellSource.indexOf('phase === "authorized"'),
  "admin shell must not render dashboard content before server validation"
);

async function waitForServer(baseUrl) {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error("server did not become ready");
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);
  const routeChecks = [
    {
      path: "/api/auth/pin-login",
      body: { username: "__smoke__", pin: "000000" }
    },
    {
      path: "/api/auth/pin-reset?action=__smoke__",
      body: { action: "__smoke__" }
    }
  ];

  for (const check of routeChecks) {
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.body)
    });
    if (response.status === 404) {
      console.error(`server smoke failed: route is not mounted: ${check.path}`);
      process.exit(1);
    }
  }

  console.log("server ok");
  process.exit(0);
} catch (error) {
  console.error("server import failed:", error);
  process.exit(1);
}
