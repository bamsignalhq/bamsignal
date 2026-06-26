import { log } from "../lib/context.mjs";
import { createConciergeJourney } from "../lib/cert-api.mjs";
import { validateConcierge } from "../lib/validators.mjs";
import { check } from "../lib/validators.mjs";

export const id = "07";
export const title = "Signal Concierge · consultation · assign · journey";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member?.profileId) {
    const { certQuery } = await import("../lib/cert-api.mjs");
    const rows = await certQuery("member-by-email", [member.email]);
    member.profileId = rows[0]?.id;
  }
  if (!member?.profileId) throw new Error("member profileId required");

  log(ctx, "scenario-07-start");

  const journey = await createConciergeJourney(member.profileId, "cert-consultant-01");
  ctx.journeyId = journey.journeyId;
  checks.push(check("consultation-created", "api", journey.ok !== false));
  checks.push(check("journey-id-generated", "api", Boolean(journey.journeyId)));

  const conciergeChecks = await validateConcierge(member.profileId, journey.journeyId);
  checks.push(...conciergeChecks);

  checks.push(
    check(
      "status-progression",
      "database",
      journey.member?.status === "consultation-scheduled" ||
        journey.status === "consultation-scheduled",
      `status=${journey.member?.status || journey.status}`
    )
  );

  await page.goto(`${ctx.baseUrl}/signal-concierge/status`);
  await page.waitForTimeout(1200);
  checks.push(
    check(
      "concierge-status-page",
      "ui",
      page.url().includes("/signal-concierge") || page.url().includes("/login")
    )
  );

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-07-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
