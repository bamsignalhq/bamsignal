/**
 * Static regression checks for the existing-account registration trap fix.
 * Covers: existing email → Account already exists → Login (no OTP / no Home loop).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`existing-account auth test failed: ${message}`);
  process.exit(1);
}

const authPage = readFileSync(join(rootPath, "src/pages/AuthPage.tsx"), "utf8");
const loveAuth = readFileSync(join(rootPath, "src/pages/LoveAuthRoutePage.tsx"), "utf8");
const authEmail = readFileSync(join(rootPath, "src/services/authEmail.ts"), "utf8");
const signupIdentity = readFileSync(join(rootPath, "server/services/signupIdentity.js"), "utf8");
const authTypes = readFileSync(join(rootPath, "src/types/index.ts"), "utf8");

assertCheck(
  /export type AuthMode = .*"existing"/.test(authTypes),
  "AuthMode must include existing"
);

assertCheck(
  authPage.includes('onModeChange("existing")') &&
    authPage.includes("Account already exists") &&
    authPage.includes("showExistingAccount") &&
    authPage.includes("goToLoginFromExisting") &&
    authPage.includes("Use another email") &&
    authPage.includes("Forgot your PIN?"),
  "AuthPage must show dedicated existing-account screen with Log In / Use another email / Forgot PIN"
);

assertCheck(
  authPage.includes("Log In") && authPage.includes("goToLoginFromExisting"),
  "Existing-account primary action must navigate to login"
);

assertCheck(
  /if\s*\(\s*error\.kind\s*===\s*"exists"\s*\)\s*\{[\s\S]*?showExistingAccount/.test(authPage),
  "Signup exists errors must open existing-account screen (not verify OTP)"
);

assertCheck(
  !/error\.kind\s*===\s*"exists"[\s\S]{0,200}onModeChange\("verify"\)/.test(authPage),
  "Exists errors must never navigate to verify"
);

assertCheck(
  loveAuth.includes("LOCAL_AUTH_MODES") &&
    loveAuth.includes('"existing"') &&
    loveAuth.includes("path === AUTH_SIGNUP_PATH && hasRestorableSignupVerify()") &&
    !loveAuth.includes('onLogoClick={() => navigateToPath("/")}'),
  "Login must not restore verify; logo must not go to homepage"
);

assertCheck(
  loveAuth.includes("AUTH_LOGIN_PATH") &&
    /onLogoClick=\{\(\)\s*=>\s*\{[\s\S]*navigateToPath\(AUTH_LOGIN_PATH\)/.test(loveAuth),
  "Auth logo must return to auth login landing"
);

assertCheck(
  /initialAuthMode[\s\S]*AUTH_SIGNUP_PATH[\s\S]*hasRestorableSignupVerify/.test(loveAuth) &&
    !/function initialAuthMode[\s\S]*if \(hasRestorableSignupVerify\(\)\) return "verify";\n  return path/.test(
      loveAuth
    ),
  "initialAuthMode must only restore verify on signup path"
);

assertCheck(
  authEmail.includes("this.field = field"),
  "AuthEmailError must preserve field for exists routing"
);

assertCheck(
  signupIdentity.includes("An account already exists with this email address.") &&
    !signupIdentity.includes("Try logging in instead."),
  "Existing-email copy must not rely on buried try-logging-in text"
);

assertCheck(
  authPage.includes('aria-label="Back to BamSignal login"') &&
    !authPage.includes('aria-label="Back to BamSignal home"'),
  "Auth logo aria-label must not promise Home navigation"
);

console.log("existing-account auth tests ok");
