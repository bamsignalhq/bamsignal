/** African Relationship Curriculum™ — cultural preservation architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const AFRICAN_RELATIONSHIP_CURRICULUM_TITLE = "African Relationship Curriculum™";
export const AFRICAN_RELATIONSHIP_CURRICULUM_LABEL = "African Relationship Curriculum";
export const CULTURE_MODULE_LABEL = "Culture Module";
export const FAITH_MODULE_LABEL = "Faith Module";
export const DIASPORA_MODULE_LABEL = "Diaspora Module";

export const AFRICAN_RELATIONSHIP_CURRICULUM_SUBCOPY =
  "Preserving African relationship wisdom — values, traditions, and diaspora experiences with dignity.";
export const AFRICAN_RELATIONSHIP_CURRICULUM_PURPOSE_COPY =
  "Prepare African relationship curriculum — cultural modules reserved, not institutional delivery yet.";
export const AFRICAN_RELATIONSHIP_CURRICULUM_RESERVED_COPY =
  "Architecture prepared. University, church, mosque, and school partnerships are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type CurriculumPreserveThemeId =
  | "african-values"
  | "courtship-traditions"
  | "family-structures"
  | "intertribal-marriages"
  | "faith-influences"
  | "diaspora-experiences";

export type CurriculumModuleKind = "culture" | "faith" | "diaspora";

export type PreparedCurriculumThemeDefinition = {
  id: CurriculumPreserveThemeId;
  title: string;
  description: string;
  moduleKind: CurriculumModuleKind;
};

export const PRESERVED_CURRICULUM_THEMES: PreparedCurriculumThemeDefinition[] = [
  {
    id: "african-values",
    title: "African Values",
    description: "African values — relationship wisdom rooted in heritage and dignity.",
    moduleKind: "culture"
  },
  {
    id: "courtship-traditions",
    title: "Courtship Traditions",
    description: "Courtship traditions — respectful pathways preserved for future generations.",
    moduleKind: "culture"
  },
  {
    id: "family-structures",
    title: "Family Structures",
    description: "Family structures — household wisdom honored across communities.",
    moduleKind: "culture"
  },
  {
    id: "intertribal-marriages",
    title: "Intertribal Marriages",
    description: "Intertribal marriages — unity and respect across cultural lines.",
    moduleKind: "culture"
  },
  {
    id: "faith-influences",
    title: "Faith Influences",
    description: "Faith influences — spiritual foundations in relationship life.",
    moduleKind: "faith"
  },
  {
    id: "diaspora-experiences",
    title: "Diaspora Experiences",
    description: "Diaspora experiences — Journey Across Borders wisdom preserved.",
    moduleKind: "diaspora"
  }
];

export type AfricanRelationshipCurriculumFuturePartnerId =
  | "universities"
  | "churches"
  | "mosques"
  | "schools";

export const AFRICAN_RELATIONSHIP_CURRICULUM_FUTURE_PARTNERS: {
  id: AfricanRelationshipCurriculumFuturePartnerId;
  label: string;
  description: string;
}[] = [
  {
    id: "universities",
    label: "Universities",
    description: "Reserved — university partnerships with dignity-first curriculum framing."
  },
  {
    id: "churches",
    label: "Churches",
    description: "Reserved — church partnerships — respectful faith-informed delivery."
  },
  {
    id: "mosques",
    label: "Mosques",
    description: "Reserved — mosque partnerships — community wisdom with care."
  },
  {
    id: "schools",
    label: "Schools",
    description: "Reserved — school partnerships — never surveillance or training catalogs."
  }
];

export function getPreservedCurriculumTheme(
  themeId: CurriculumPreserveThemeId
): PreparedCurriculumThemeDefinition | undefined {
  return PRESERVED_CURRICULUM_THEMES.find((theme) => theme.id === themeId);
}
