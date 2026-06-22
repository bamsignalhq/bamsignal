import { PREPARED_MEMBERSHIP_LEVELS } from "../constants/houseMembership";
import {
  listArchitectureHousePrivileges,
  listArchitectureMembershipTiers,
  type HousePrivilegesCardViewModel,
  type MembershipTierCardViewModel
} from "./houseMembershipLogic";

export type HouseMembershipBundle = {
  membershipTiers: MembershipTierCardViewModel[];
  housePrivileges: HousePrivilegesCardViewModel[];
  levelCount: number;
};

export function getHouseMembershipBundle(): HouseMembershipBundle {
  return {
    membershipTiers: listArchitectureMembershipTiers(),
    housePrivileges: listArchitectureHousePrivileges(),
    levelCount: PREPARED_MEMBERSHIP_LEVELS.length
  };
}
