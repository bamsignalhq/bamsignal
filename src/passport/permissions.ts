import { getPassportIdentity } from "./session";
import type { IdentityPermission } from "./types";

/**
 * Client-side identity permission checks.
 * Server authorization remains unchanged.
 */
export function identityCan(permission: IdentityPermission): boolean {
  const identity = getPassportIdentity();
  if (!identity) return permission === "identity.view";
  if (permission === "identity.view") return true;
  if (permission === "identity.edit.username") return identity.securityStatus !== "restricted";
  if (permission === "identity.edit.contact") return identity.securityStatus !== "restricted";
  if (permission === "identity.verify") return identity.verificationStatus !== "verified";
  if (permission === "identity.security") return true;
  return false;
}
