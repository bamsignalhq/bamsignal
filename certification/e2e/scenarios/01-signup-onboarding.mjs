import { certEmail, certPhone, certUsername } from "../config.mjs";
import { log } from "../lib/context.mjs";
import {
  checkUsernameAvailable,
  completeOnboarding,
  completeSignupFlow
} from "../lib/member.mjs";
import { seedMemberProfile } from "../lib/cert-api.mjs";
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

  await seedMemberProfile(email, phone, {
    fullName: name,
    age: 29,
    gender: "Man",
    state: "Lagos",
    city: "Lagos",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    ],
    mainPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    intents: ["serious-relationship"]
  });

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
