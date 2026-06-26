/**
 * Member auth + API helpers for certification scenarios.
 */
import { authApi, httpJson, memberApi } from "./http.mjs";
import { peekSignupOtp, seedSignupOtp } from "./cert-api.mjs";

async function issueSignupMathChallengeRemote() {
  const result = await authApi("/api/auth/email-code", { action: "math-challenge" });
  if (!result.ok || !result.payload?.token) {
    throw new Error(result.payload?.error || "math-challenge failed");
  }
  return result.payload;
}

export async function sendSignupOtp({ email, name, username, phone, legalAccepted = true }) {
  const math = await issueSignupMathChallengeRemote();
  const answer = String(Number(math.a) + Number(math.b));
  return authApi("/api/auth/email-code", {
    action: "send",
    email,
    name,
    username,
    phone,
    legalAccepted,
    mathToken: math.token,
    mathAnswer: answer
  });
}

export async function checkUsernameAvailable(username) {
  return authApi("/api/auth/email-code", {
    action: "check",
    field: "username",
    username
  });
}

export async function verifySignupAndLogin({ email, code, pin, name, username, phone }) {
  const verify = await authApi("/api/auth/email-code", {
    action: "verify",
    email,
    code,
    password: pin,
    name,
    username,
    phone
  });
  if (!verify.ok) {
    throw new Error(verify.payload?.error || `signup verify failed (${verify.status})`);
  }
  const session = verify.payload?.session;
  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("signup verify did not return session access_token");
  }
  return {
    accessToken,
    refreshToken: session?.refresh_token,
    user: verify.payload?.user,
    onboardingComplete: Boolean(verify.payload?.onboardingComplete)
  };
}

export async function completeSignupFlow({ email, name, username, phone, pin }) {
  await seedSignupOtp(email, "246810");
  const uniqueness = await checkUsernameAvailable(username);
  if (!uniqueness.ok || uniqueness.payload?.available === false) {
    throw new Error(uniqueness.payload?.error || "username not available");
  }
  const sent = await sendSignupOtp({ email, name, username, phone });
  if (!sent.ok) {
    throw new Error(sent.payload?.error || "signup OTP send failed");
  }
  let code = "246810";
  try {
    code = await peekSignupOtp(email);
  } catch {
    // seeded fallback
  }
  return verifySignupAndLogin({ email, code, pin, name, username, phone });
}

export async function pinLogin(username, pin) {
  const result = await authApi("/api/auth/pin-login", { username, pin });
  if (!result.ok) {
    throw new Error(result.payload?.error || `pin login failed (${result.status})`);
  }
  const session = result.payload?.session;
  if (!session?.access_token) {
    throw new Error("pin login did not return session");
  }
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: result.payload?.user
  };
}

export async function pullMemberBundle(token, identity = {}) {
  const result = await memberApi("pull", identity, token);
  if (!result.ok) throw new Error(result.payload?.error || "member pull failed");
  return result.payload;
}

export async function completeOnboarding(token, identity = {}) {
  const result = await memberApi("force-complete-onboarding", identity, token);
  if (!result.ok) throw new Error(result.payload?.error || "force-complete-onboarding failed");
  return result.payload;
}

export async function syncMemberProfile(token, { city, state, profile }, identity = {}) {
  const result = await memberApi(
    "profile",
    { city, state, profile, profilePatchScope: "full", ...identity },
    token
  );
  if (!result.ok) throw new Error(result.payload?.error || "profile sync failed");
  return result.payload;
}

const CERT_ONBOARDING_PROFILE = {
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
};

export function certificationOnboardingProfile(name, overrides = {}) {
  return {
    fullName: name,
    name,
    ...CERT_ONBOARDING_PROFILE,
    ...overrides
  };
}

export async function discoverProfiles(token, identity = {}) {
  const result = await memberApi("discover", { limit: 12, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "discover failed");
  return result.payload?.profiles || [];
}

export async function saveProfile(token, targetProfileId, identity = {}) {
  const result = await memberApi("save-profile", { targetProfileId, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "save-profile failed");
  return result.payload;
}

export async function unsaveProfile(token, targetProfileId, identity = {}) {
  const result = await memberApi("unsave-profile", { targetProfileId, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "unsave-profile failed");
  return result.payload;
}

export async function sendSignal(token, targetProfileId, identity = {}) {
  const result = await memberApi("signal", { targetProfileId, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "signal failed");
  return result.payload;
}

export async function acceptSignal(token, signalId, identity = {}) {
  const result = await memberApi("accept-signal", { signalId, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "accept-signal failed");
  return result.payload;
}

export async function declineSignal(token, signalId, identity = {}) {
  const result = await memberApi("decline-signal", { signalId, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "decline-signal failed");
  return result.payload;
}

export async function incomingSignals(token, identity = {}) {
  const result = await memberApi("incoming", identity, token);
  if (!result.ok) throw new Error(result.payload?.error || "incoming failed");
  return result.payload?.signals || [];
}

export async function persistMessage(token, { threadId, message, threadMeta }, identity = {}) {
  const result = await memberApi(
    "message",
    { threadId, message, threadMeta, ...identity },
    token
  );
  if (!result.ok) throw new Error(result.payload?.error || "message failed");
  return result.payload;
}

export async function initializePremium(token, identity = {}) {
  const result = await httpJson("/api/paystack/verify?action=initialize", {
    method: "POST",
    body: {
      email: identity.email,
      phone: identity.phone,
      productType: "premium",
      productId: "signal-pass-monthly",
      paymentReturnPath: "/subscription",
      sourcePage: "/subscription",
      ...identity
    },
    token
  });
  return result;
}

export async function submitVerificationSelfie({ email, phone, name, verificationSelfie }) {
  const result = await httpJson("/api/verify/submissions?action=submit-selfie", {
    method: "POST",
    body: { email, phone, name, verificationSelfie, profilePhoto: verificationSelfie }
  });
  if (!result.ok) throw new Error(result.payload?.error || "submit-selfie failed");
  return result.payload;
}

export async function reportMember(token, report, identity = {}) {
  const result = await memberApi("report", { report, ...identity }, token);
  if (!result.ok) throw new Error(result.payload?.error || "report failed");
  return result.payload;
}
