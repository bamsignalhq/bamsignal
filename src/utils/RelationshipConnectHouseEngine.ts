import {
  PREPARED_CONNECT_HOUSE_ACTIVITIES,
  PREPARED_CONNECT_HOUSE_PROGRAMS
} from "../constants/relationshipConnectHouse";
import {
  listArchitectureConnectHouseConferences,
  listArchitectureConnectHouseNetworking,
  listArchitectureConnectHouseWorkshops,
  type ConnectHouseConferenceCardViewModel,
  type ConnectHouseNetworkingCardViewModel,
  type ConnectHouseWorkshopCardViewModel
} from "./relationshipConnectHouseLogic";

export type RelationshipConnectHouseBundle = {
  conferences: ConnectHouseConferenceCardViewModel[];
  workshops: ConnectHouseWorkshopCardViewModel[];
  networking: ConnectHouseNetworkingCardViewModel[];
  programCount: number;
  activityCount: number;
};

export function getRelationshipConnectHouseBundle(): RelationshipConnectHouseBundle {
  return {
    conferences: listArchitectureConnectHouseConferences(),
    workshops: listArchitectureConnectHouseWorkshops(),
    networking: listArchitectureConnectHouseNetworking(),
    programCount: PREPARED_CONNECT_HOUSE_PROGRAMS.length,
    activityCount: PREPARED_CONNECT_HOUSE_ACTIVITIES.length
  };
}
