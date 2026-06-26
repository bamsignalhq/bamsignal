import { certEmail, certPhone, certUsername } from "../config.mjs";
import { log } from "../lib/context.mjs";
import {
  acceptSignal,
  completeSignupFlow,
  declineSignal,
  incomingSignals,
  sendSignal,
  syncMemberProfile,
  certificationOnboardingProfile
} from "../lib/member.mjs";
import { completeOnboarding } from "../lib/member.mjs";
import { certQuery } from "../lib/cert-api.mjs";
import { check, validateSignals } from "../lib/validators.mjs";

export const id = "03";
export const title = "Send · receive · accept · decline signal";

export async function run(ctx, { screenshot }) {
  const checks = [];
  const memberA = ctx.memberA;
  if (!memberA) throw new Error("memberA required");

  log(ctx, "scenario-03-start");

  const emailB = certEmail("b");
  const usernameB = certUsername("b");
  const phoneB = certPhone("02");
  const sessionB = await completeSignupFlow({
    email: emailB,
    name: "Cert Member B",
    username: usernameB,
    phone: phoneB,
    pin: ctx.pin
  });
  await syncMemberProfile(
    sessionB.accessToken,
    {
      city: "Lagos",
      state: "Lagos",
      profile: certificationOnboardingProfile("Cert Member B", {
        age: 27,
        gender: "Woman",
        photos: [
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"
        ],
        mainPhotoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
      })
    },
    { email: emailB, phone: phoneB }
  );
  await completeOnboarding(sessionB.accessToken, { email: emailB, phone: phoneB });

  const rowsA = await certQuery("member-by-email", [memberA.email]);
  const rowsB = await certQuery("member-by-email", [emailB]);
  memberA.profileId = rowsA[0]?.id;
  const profileIdB = rowsB[0]?.id;
  const userKeyB = rowsB[0]?.user_key;

  ctx.memberB = {
    email: emailB,
    phone: phoneB,
    username: usernameB,
    accessToken: sessionB.accessToken,
    profileId: profileIdB,
    userKey: userKeyB,
    identity: { email: emailB, phone: phoneB }
  };

  const sent = await sendSignal(
    memberA.accessToken,
    profileIdB,
    memberA.identity
  );
  checks.push(check("send-signal", "api", sent.ok !== false));

  const incoming = await incomingSignals(sessionB.accessToken, ctx.memberB.identity);
  checks.push(check("receive-signal", "api", incoming.length >= 1));
  const signalId = incoming[0]?.id;
  ctx.signalId = signalId;

  if (signalId) {
    const accepted = await acceptSignal(sessionB.accessToken, signalId, ctx.memberB.identity);
    checks.push(check("accept-signal", "api", accepted.ok !== false));
  }

  const sentBack = await sendSignal(
    sessionB.accessToken,
    memberA.profileId,
    ctx.memberB.identity
  );
  checks.push(check("send-signal-return", "api", sentBack.ok !== false));

  const incomingA = await incomingSignals(memberA.accessToken, memberA.identity);
  if (incomingA[0]?.id) {
    const declined = await declineSignal(memberA.accessToken, incomingA[0].id, memberA.identity);
    checks.push(check("decline-signal", "api", declined.ok !== false));
  }

  const signalCheck = await validateSignals(rowsA[0]?.user_key, 1);
  checks.push(signalCheck);

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-03-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
