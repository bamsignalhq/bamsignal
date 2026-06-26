import { log } from "../lib/context.mjs";
import { pinLogin } from "../lib/member.mjs";
import { waitForMemberPath } from "../lib/browser.mjs";
import { check } from "../lib/validators.mjs";

export const id = "09";
export const title = "Logout · login · session restore · Home";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member?.username) throw new Error("memberA required");

  log(ctx, "scenario-09-start");

  await page.goto(`${ctx.baseUrl}/settings`);
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${ctx.baseUrl}/login`);

  const session = await pinLogin(member.username, ctx.pin);
  checks.push(check("pin-login-api", "api", Boolean(session.accessToken)));

  await page.getByLabel(/username/i).fill(member.username);
  await page.getByLabel(/^pin$/i).fill(ctx.pin);
  await page.getByRole("button", { name: /log in/i }).click();

  await waitForMemberPath(page, "/home", 45_000);
  checks.push(check("session-restored-home", "ui", page.url().includes("/home")));
  checks.push(check("no-stale-onboarding", "ui", !page.url().includes("/onboarding")));

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-09-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
