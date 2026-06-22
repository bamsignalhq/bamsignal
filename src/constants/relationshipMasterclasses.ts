/** Relationship Masterclasses™ — deep-dive learning architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_MASTERCLASSES_TITLE = "Relationship Masterclasses™";
export const RELATIONSHIP_MASTERCLASSES_LABEL = "Relationship Masterclasses";
export const MASTERCLASS_LABEL = "Masterclass";

export const RELATIONSHIP_MASTERCLASSES_SUBCOPY =
  "Deep-dive relationship learning — architecture prepared, never training or course catalogs.";
export const RELATIONSHIP_MASTERCLASSES_PURPOSE_COPY =
  "Prepare relationship masterclasses — relationship wisdom with dignity, not live events yet.";
export const RELATIONSHIP_MASTERCLASSES_RESERVED_COPY =
  "Architecture prepared. Live events and recordings are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedMasterclassId =
  | "communication"
  | "conflict-resolution"
  | "money-marriage"
  | "faith-relationships"
  | "building-intimacy"
  | "parenting-together"
  | "diaspora-relationships"
  | "second-marriages";

export type PreparedMasterclassDefinition = {
  id: PreparedMasterclassId;
  title: string;
  description: string;
  speakerId: string;
};

export const PREPARED_MASTERCLASSES: PreparedMasterclassDefinition[] = [
  {
    id: "communication",
    title: "Communication Masterclass",
    description: "Communication deep-dive — growing together with dignity.",
    speakerId: "rmc_speaker_communication"
  },
  {
    id: "conflict-resolution",
    title: "Conflict Resolution",
    description: "Conflict resolution masterclass — relationship wisdom first.",
    speakerId: "rmc_speaker_conflict"
  },
  {
    id: "money-marriage",
    title: "Money & Marriage",
    description: "Money and marriage — practical learning, not lessons.",
    speakerId: "rmc_speaker_money"
  },
  {
    id: "faith-relationships",
    title: "Faith & Relationships",
    description: "Faith and relationships — respectful masterclass framing.",
    speakerId: "rmc_speaker_faith"
  },
  {
    id: "building-intimacy",
    title: "Building Intimacy",
    description: "Building intimacy — dignity-first deep-dive learning.",
    speakerId: "rmc_speaker_intimacy"
  },
  {
    id: "parenting-together",
    title: "Parenting Together",
    description: "Parenting together — growing together as a family.",
    speakerId: "rmc_speaker_parenting"
  },
  {
    id: "diaspora-relationships",
    title: "Diaspora Relationships",
    description: "Diaspora relationships — Journey Across Borders masterclass.",
    speakerId: "rmc_speaker_diaspora"
  },
  {
    id: "second-marriages",
    title: "Second Marriages",
    description: "Second marriages — relationship wisdom with care.",
    speakerId: "rmc_speaker_second_marriage"
  }
];

export type PreparedSpeakerDefinition = {
  id: string;
  name: string;
  title: string;
  focus: string;
  masterclassId: PreparedMasterclassId;
};

export const PREPARED_SPEAKERS: PreparedSpeakerDefinition[] = PREPARED_MASTERCLASSES.map(
  (masterclass) => ({
    id: masterclass.speakerId,
    name: "Reserved speaker",
    title: `${masterclass.title} facilitator`,
    focus: masterclass.description,
    masterclassId: masterclass.id
  })
);

export type RelationshipMasterclassesFutureCapabilityId = "live-events" | "recordings";

export const RELATIONSHIP_MASTERCLASSES_FUTURE_CAPABILITIES: {
  id: RelationshipMasterclassesFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "live-events",
    label: "Live events",
    description: "Reserved — live masterclass events with dignity-first design."
  },
  {
    id: "recordings",
    label: "Recordings",
    description: "Reserved — masterclass recordings — never a course catalog."
  }
];

export function getPreparedMasterclass(
  masterclassId: PreparedMasterclassId
): PreparedMasterclassDefinition | undefined {
  return PREPARED_MASTERCLASSES.find((masterclass) => masterclass.id === masterclassId);
}
