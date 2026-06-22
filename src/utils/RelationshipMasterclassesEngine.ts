import { PREPARED_MASTERCLASSES } from "../constants/relationshipMasterclasses";
import {
  listArchitectureMasterclasses,
  listArchitectureSpeakers,
  type MasterclassViewModel,
  type SpeakerViewModel
} from "./relationshipMasterclassesLogic";

export type RelationshipMasterclassesBundle = {
  masterclasses: MasterclassViewModel[];
  speakers: SpeakerViewModel[];
  masterclassCount: number;
};

export function getRelationshipMasterclassesBundle(): RelationshipMasterclassesBundle {
  return {
    masterclasses: listArchitectureMasterclasses(),
    speakers: listArchitectureSpeakers(),
    masterclassCount: PREPARED_MASTERCLASSES.length
  };
}
