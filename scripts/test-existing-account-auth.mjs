/**
 * Static regression checks for signup identity conflict UX.
 * Covers: stay on signup, field-specific conflicts, forgot username, no forced login trap.
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
const forgotUsername = readFileSync(join(rootPath, "server/services/forgotUsername.js"), "utf8");
const appJs = readFileSync(join(rootPath, "server/app.js"), "utf8");

assertCheck(
  /export type AuthMode = .*"existing"/.test(authTypes) &&
    /"forgot-username"/.test(authTypes),
  "AuthMode must include existing and forgot-username"
);

assertCheck(
  authPage.includes("applySignupConflicts") &&
    authPage.includes("SignupConflictActions") &&
    authPage.includes("Forgot username?") &&
    !/onModeChange\("existing"\)/.test(authPage),
  "Conflicts must stay on signup via applySignupConflicts (no forced existing mode)"
);

assertCheck(
  /if\s*\(\s*error\.kind\s*===\s*"exists"\s*\)\s*\{[\s\S]*?applySignupConflicts/.test(authPage),
  "Signup exists errors must apply inline conflicts (not verify OTP)"
);

assertCheck(
  !/error\.kind\s*===\s*"exists"[\s\S]{0,200}onModeChange\("verify"\)/.test(authPage),
  "Exists errors must never navigate to verify"
);

assertCheck(
  loveAuth.includes("LOCAL_AUTH_MODES") &&
    loveAuth.includes('"forgot-username"') &&
    loveAuth.includes("path === AUTH_SIGNUP_PATH && hasRestorableSignupVerify()") &&
    !loveAuth.includes('onLogoClick={() => navigateToPath("/")}'),
  "Login must not restore verify; logo must not go to homepage; forgot-username is local"
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
  authEmail.includes("this.field = field") &&
    authEmail.includes("conflicts") &&
    authEmail.includes("sendForgotUsernameCode"),
  "AuthEmailError must preserve field/conflicts; forgot-username client API required"
);

assertCheck(
  signupIdentity.includes("email_exists") &&
    signupIdentity.includes("phone_exists") &&
    signupIdentity.includes("username_exists") &&
    signupIdentity.includes("collectSignupIdentityConflicts") &&
    signupIdentity.includes("This email is already registered.") &&
    signupIdentity.includes("This username is already taken.") &&
    signupIdentity.includes("This phone number is already registered."),
  "Server must return structured multi-field conflict codes and required copy"
);

assertCheck(
  forgotUsername.includes("sendForgotUsernameCode") &&
    forgotUsername.includes("completeForgotUsername") &&
    appJs.includes("/api/auth/forgot-username"),
  "Forgot username service and route must be mounted"
);

assertCheck(
  authPage.includes('aria-label="Back to BamSignal login"') &&
    !authPage.includes('aria-label="Back to BamSignal home"'),
  "Auth logo aria-label must not promise Home navigation"
);

console.log("existing-account auth tests ok");
