import { log } from "../lib/context.mjs";
import { discoverProfiles, saveProfile, unsaveProfile } from "../lib/member.mjs";
import { check, validateSavedProfiles } from "../lib/validators.mjs";

export const id = "02";
export const title = "Discover · open profile · save · unsave";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member?.accessToken) throw new Error("Scenario 01 must pass first — memberA missing");

  log(ctx, "scenario-02-start");

  const profiles = await discoverProfiles(member.accessToken, member.identity);
  checks.push(check("discover-api", "api", profiles.length > 0, `profiles=${profiles.length}`));

  const target = profiles[0];
  const profileView = await fetch(`${ctx.baseUrl}/api/member/data?action=profile-by-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: target.id })
    }
  );
  checks.push(check("profile-by-id", "api", profileView.ok));

  const { certQuery } = await import("../lib/cert-api.mjs");
  const rows = await certQuery("member-by-email", [member.email]);
  member.profileId = rows[0]?.id;

  await saveProfile(member.accessToken, target.id, member.identity);
  let savedCheck = await validateSavedProfiles(member.profileId, 1);
  checks.push(savedCheck);

  await unsaveProfile(member.accessToken, target.id, member.identity);
  const unsavedCheck = await validateSavedProfiles(member.profileId, 0);
  checks.push(unsavedCheck);

  await page.goto(`${ctx.baseUrl}/discover`);
  await page.waitForTimeout(1500);
  checks.push(check("discover-page-loads", "ui", page.url().includes("/discover")));

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-02-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
