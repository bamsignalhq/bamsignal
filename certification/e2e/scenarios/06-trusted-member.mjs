import { log } from "../lib/context.mjs";
import { submitVerificationSelfie } from "../lib/member.mjs";
import { approveVerification, setPhoneVerified } from "../lib/cert-api.mjs";
import { certQuery } from "../lib/cert-api.mjs";
import { check, validateVerification } from "../lib/validators.mjs";

const CERT_SELFIE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";

export const id = "06";
export const title = "Trusted Member · submit · approve · badge";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member) throw new Error("memberA required");

  log(ctx, "scenario-06-start");

  await setPhoneVerified(member.email, member.phone);

  const submitted = await submitVerificationSelfie({
    email: member.email,
    phone: member.phone,
    name: member.name,
    verificationSelfie: CERT_SELFIE
  });
  checks.push(check("submit-verification", "api", submitted.ok !== false));

  const approved = await approveVerification(member.email, member.phone);
  checks.push(check("approve-verification", "api", approved.ok !== false));

  const rows = await certQuery("member-by-email", [member.email]);
  const userKey = rows[0]?.user_key;
  if (userKey) {
    checks.push(await validateVerification(userKey, "approved"));
  }

  const profile = rows[0]?.profile || {};
  checks.push(
    check(
      "trusted-badge-data",
      "database",
      profile.verified === true || profile.verificationStatus === "approved",
      `verified=${profile.verified}`
    )
  );

  await page.goto(`${ctx.baseUrl}/profile`);
  await page.waitForTimeout(1500);
  checks.push(check("profile-page", "ui", page.url().includes("/profile")));

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-06-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
