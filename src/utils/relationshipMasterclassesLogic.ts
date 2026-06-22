import type {
  PreparedMasterclassDefinition,
  PreparedMasterclassId,
  PreparedSpeakerDefinition
} from "../constants/relationshipMasterclasses";
import { PREPARED_MASTERCLASSES, PREPARED_SPEAKERS } from "../constants/relationshipMasterclasses";

export type MasterclassViewModel = {
  id: PreparedMasterclassId;
  title: string;
  description: string;
  speakerName: string;
  statusLabel: string;
};

export type SpeakerViewModel = {
  id: string;
  name: string;
  title: string;
  focus: string;
  masterclassTitle: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildMasterclassViewModel(
  masterclass: PreparedMasterclassDefinition
): MasterclassViewModel {
  const speaker = PREPARED_SPEAKERS.find((item) => item.id === masterclass.speakerId);
  return {
    id: masterclass.id,
    title: masterclass.title,
    description: masterclass.description,
    speakerName: speaker?.name ?? "Reserved speaker",
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSpeakerViewModel(speaker: PreparedSpeakerDefinition): SpeakerViewModel {
  const masterclass = PREPARED_MASTERCLASSES.find((item) => item.id === speaker.masterclassId);
  return {
    id: speaker.id,
    name: speaker.name,
    title: speaker.title,
    focus: speaker.focus,
    masterclassTitle: masterclass?.title ?? speaker.masterclassId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureMasterclasses(): MasterclassViewModel[] {
  return [...PREPARED_MASTERCLASSES.map(buildMasterclassViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureSpeakers(): SpeakerViewModel[] {
  return [...PREPARED_SPEAKERS.map(buildSpeakerViewModel)].sort((a, b) =>
    a.masterclassTitle.localeCompare(b.masterclassTitle)
  );
}
