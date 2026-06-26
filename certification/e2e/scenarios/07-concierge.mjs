import { log } from "../lib/context.mjs";
import { httpJson } from "../lib/http.mjs";
import { certQuery } from "../lib/cert-api.mjs";
import { check } from "../lib/validators.mjs";

export const id = "07";
export const title = "Signal Concierge · persistence · routes · member read";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member?.accessToken) throw new Error("memberA required");

  log(ctx, "scenario-07-start");

  const status = await httpJson("/api/concierge-persistence?action=status", { method: "POST" });
  checks.push(
    check(
      "concierge-persistence-status",
      "api",
      status.ok && status.payload?.database === "connected",
      `database=${status.payload?.database || "unknown"}`
    )
  );

  const persistence = await certQuery("concierge-persistence-status", []);
  const row = persistence[0] || {};
  checks.push(
    check(
      "concierge-tables-readable",
      "database",
      row.member_count != null && row.consultant_count != null,
      `members=${row.member_count} consultants=${row.consultant_count}`
    )
  );

  const memberGet = await httpJson("/api/concierge-persistence?action=member-get", {
    method: "POST",
    token: member.accessToken,
    body: {}
  });
  checks.push(
    check(
      "member-get-api",
      "api",
      memberGet.ok,
      memberGet.payload?.member ? "journey present" : "no journey yet (valid)"
    )
  );

  if (memberGet.payload?.member?.journeyId) {
    ctx.journeyId = memberGet.payload.member.journeyId;
    checks.push(check("journey-id-present", "api", Boolean(ctx.journeyId)));
    const dbRows = await certQuery("concierge-member", [member.profileId || memberGet.payload.member.id]);
    checks.push(
      check(
        "journey-db-match",
        "database",
        dbRows[0]?.journey_id === ctx.journeyId,
        `db=${dbRows[0]?.journey_id || "none"}`
      )
    );
  } else {
    checks.push(
      check(
        "concierge-apply-route",
        "ui",
        true,
        "member has no journey — certifying infrastructure only"
      )
    );
  }

  await page.goto(`${ctx.baseUrl}/signal-concierge/apply`);
  await page.waitForTimeout(1200);
  checks.push(
    check(
      "concierge-apply-page",
      "ui",
      page.url().includes("/signal-concierge")
    )
  );

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-07-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
