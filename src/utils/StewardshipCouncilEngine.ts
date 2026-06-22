import { COUNCIL_ROLES } from "../constants/stewardshipCouncil";
import type { StewardshipCouncilBundle } from "../types/stewardshipCouncil";
import {
  buildStewardshipOathViewModel,
  listArchitectureCouncilMembers,
  listArchitectureCouncilResponsibilities,
  listArchitectureCouncilRoles,
  listArchitectureCouncilTimeline
} from "./stewardshipCouncilLogic";

export function getStewardshipCouncilBundle(): StewardshipCouncilBundle {
  return {
    roles: listArchitectureCouncilRoles(),
    members: listArchitectureCouncilMembers(),
    timeline: listArchitectureCouncilTimeline(),
    oath: buildStewardshipOathViewModel(),
    responsibilities: listArchitectureCouncilResponsibilities(),
    roleCount: COUNCIL_ROLES.length
  };
}
