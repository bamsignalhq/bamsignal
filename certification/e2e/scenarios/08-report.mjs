import { log } from "../lib/context.mjs";
import { reportMember } from "../lib/member.mjs";
import { validateAuditLogs, validateReport, validateSafetyEvent, check } from "../lib/validators.mjs";

export const id = "08";
export const title = "Report member · moderation queue · safety log";

export async function run(ctx, { screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  const target = ctx.memberB;
  if (!member || !target?.profileId) throw new Error("memberA and memberB required");

  log(ctx, "scenario-08-start");

  const reported = await reportMember(
    member.accessToken,
    {
      profileId: target.profileId,
      reason: "certification-test",
      details: "Production E2E certification safety report — auto-generated",
      category: "other"
    },
    member.identity
  );
  checks.push(check("report-submitted", "api", reported.ok !== false));

  checks.push(await validateReport(member.email));
  checks.push(await validateAuditLogs(target.profileId));
  checks.push(await validateSafetyEvent(target.profileId));

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-08-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
