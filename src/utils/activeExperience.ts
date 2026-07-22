/**
 * Compatibility facade — prefer `src/passport` for new code.
 */

import {
  getAvailableWorkspaceIds,
  getSelectedWorkspaceId,
  markWorkspaceAvailable,
  selectWorkspace,
  type WorkspaceId
} from "../workspaces";

export {
  getRememberedConciergeUsername,
  setRememberedConciergeUsername
} from "./conciergeRemember";

export type ActiveExperience = Extract<WorkspaceId, "member" | "concierge">;

export function getActiveExperience(): ActiveExperience {
  const selected = getSelectedWorkspaceId();
  return selected === "concierge" ? "concierge" : "member";
}

export function setActiveExperience(experience: ActiveExperience): void {
  selectWorkspace(experience, { setPreferred: true });
}

export function markExperienceRole(role: ActiveExperience): void {
  markWorkspaceAvailable(role);
}

export function hasExperienceRole(role: ActiveExperience): boolean {
  return getAvailableWorkspaceIds().includes(role);
}

export function hasDualExperienceRoles(): boolean {
  const available = getAvailableWorkspaceIds();
  return available.includes("member") && available.includes("concierge");
}
