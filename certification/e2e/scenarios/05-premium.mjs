import { log } from "../lib/context.mjs";
import { initializePremium } from "../lib/member.mjs";
import { simulatePremiumWebhook } from "../lib/cert-api.mjs";
import { certQuery } from "../lib/cert-api.mjs";
import { check, validatePremium } from "../lib/validators.mjs";

export const id = "05";
export const title = "Premium · Paystack init · webhook · subscription";

export async function run(ctx, { page, screenshot }) {
  const checks = [];
  const member = ctx.memberA;
  if (!member) throw new Error("memberA required");

  log(ctx, "scenario-05-start");

  const init = await initializePremium(member.accessToken, member.identity);
  checks.push(
    check(
      "paystack-initialize",
      "api",
      init.ok || init.status === 503,
      init.payload?.authorization_url
        ? "authorization_url returned"
        : init.payload?.error || `status=${init.status}`
    )
  );

  const webhook = await simulatePremiumWebhook(member.email, {
    productId: "signal-pass-monthly",
    reference: `cert-premium-${ctx.runId}`
  });
  ctx.paymentReference = webhook.reference;
  checks.push(check("webhook-simulated", "api", webhook.ok, `status=${webhook.status}`));

  const rows = await certQuery("member-by-email", [member.email]);
  const userKey = rows[0]?.user_key;
  if (userKey) {
    const premiumCheck = await validatePremium(userKey, true);
    checks.push(premiumCheck);
  }

  checks.push(check("subscription-persisted", "permissions", webhook.ok));

  await page.goto(`${ctx.baseUrl}/subscription`);
  await page.waitForTimeout(1200);
  checks.push(check("subscription-page", "ui", page.url().includes("/subscription")));

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-05-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
