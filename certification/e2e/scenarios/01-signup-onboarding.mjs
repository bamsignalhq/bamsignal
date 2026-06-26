import { certEmail, certPhone, certUsername } from "../config.mjs";
import { log } from "../lib/context.mjs";
import {
  checkUsernameAvailable,
  completeOnboarding,
  completeSignupFlow,
  syncMemberProfile,
  certificationOnboardingProfile
} from "../lib/member.mjs";
import { validateMemberInDb } from "../lib/validators.mjs";
import { check } from "../lib/validators.mjs";
import { waitForMemberPath } from "../lib/browser.mjs";

export const id = "01";
export const title = "Create member · signup · OTP · onboarding · Home";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const email = certEmail("a");
  const username = certUsername("a");
  const phone = certPhone("01");
  const name = "Cert Member A";
  const identity = { email, phone };

  log(ctx, "scenario-01-start", { email, username });

  const uniqueness = await checkUsernameAvailable(username);
  checks.push(
    check("username-uniqueness", "api", uniqueness.ok && uniqueness.payload?.available !== false)
  );

  const session = await completeSignupFlow({ email, name, username, phone, pin: ctx.pin });
  ctx.memberA = {
    email,
    phone,
    username,
    name,
    accessToken: session.accessToken,
    identity
  };
  checks.push(check("signup-verify", "api", Boolean(session.accessToken)));

  await syncMemberProfile(
    session.accessToken,
    {
      city: "Lagos",
      state: "Lagos",
      profile: certificationOnboardingProfile(name)
    },
    identity
  );
  checks.push(check("profile-sync", "api", true));

  const onboard = await completeOnboarding(session.accessToken, identity);
  checks.push(check("onboarding-complete-api", "api", onboard.completed || onboard.ok));

  const db = await validateMemberInDb(email, { onboardingComplete: true });
  checks.push(...db.checks);

  await page.goto(`${ctx.baseUrl}/login`);
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/^pin$/i).fill(ctx.pin);
  await page.getByRole("button", { name: /log in/i }).click();
  await waitForMemberPath(page, "/home");
  checks.push(check("lands-on-home", "ui", page.url().includes("/home")));

  if (!checks.every((c) => c.ok)) {
    ctx.memberA.screenshot = await screenshot("scenario-01-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
