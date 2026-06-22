/** Legacy Families™ — privacy-first family metadata architecture. */

export const LEGACY_FAMILIES_ARCHITECTURE_TITLE = "Legacy Families™";
export const LEGACY_FAMILIES_ARCHITECTURE_SUBCOPY =
  "Growing Together — family legacy preserved with dignity and privacy.";
export const LEGACY_FAMILY_LABEL = "Legacy Family";
export const GROWING_TOGETHER_LABEL = "Growing Together";
export const FAMILY_LABEL = "Family";

export const LEGACY_FAMILIES_PRIVACY_COPY =
  "No child names. No sensitive information. Privacy first.";
export const LEGACY_FAMILIES_CHILDREN_COPY =
  "Children count only — never names or identifying details.";
export const LEGACY_FAMILIES_RESERVED_COPY =
  "Architecture prepared. Family celebrations and legacy services are not enabled yet.";

export type LegacyFamilyStatusId =
  | "legacy-family"
  | "growing-family"
  | "diaspora-family"
  | "golden-legacy-family";

export type LegacyFamilyStatusDefinition = {
  id: LegacyFamilyStatusId;
  label: string;
  description: string;
};

export const LEGACY_FAMILY_STATUS_DEFINITIONS: LegacyFamilyStatusDefinition[] = [
  {
    id: "legacy-family",
    label: "Legacy Family",
    description: "A legacy family journey — children and country recorded with care."
  },
  {
    id: "growing-family",
    label: "Growing Family",
    description: "Family growth recorded — children count may increase, never decrease."
  },
  {
    id: "diaspora-family",
    label: "Diaspora Family",
    description: "Legacy family abroad — current country preserved without sensitive data."
  },
  {
    id: "golden-legacy-family",
    label: "Golden Legacy Family",
    description: "Enduring golden legacy — family milestones honored across generations."
  }
];

export const LEGACY_FAMILY_STATUS_LABELS: Record<LegacyFamilyStatusId, string> = Object.fromEntries(
  LEGACY_FAMILY_STATUS_DEFINITIONS.map((item) => [item.id, item.label])
) as Record<LegacyFamilyStatusId, string>;

export type LegacyFamilyDisplayId =
  | "journey-id"
  | "marriage-year"
  | "children-count"
  | "current-country"
  | "family-milestones"
  | "legacy-status";

export type LegacyFamilyDisplayField = {
  id: LegacyFamilyDisplayId;
  label: string;
};

export const LEGACY_FAMILY_DISPLAY_FIELDS: LegacyFamilyDisplayField[] = [
  { id: "journey-id", label: "Journey ID" },
  { id: "marriage-year", label: "Marriage Year" },
  { id: "children-count", label: "Children Count" },
  { id: "current-country", label: "Current Country" },
  { id: "family-milestones", label: "Family Milestones" },
  { id: "legacy-status", label: "Legacy Status" }
];

export function legacyFamilyStatusLabel(status: LegacyFamilyStatusId): string {
  return LEGACY_FAMILY_STATUS_LABELS[status];
}

export function getLegacyFamilyStatusDefinition(
  status: LegacyFamilyStatusId
): LegacyFamilyStatusDefinition | undefined {
  return LEGACY_FAMILY_STATUS_DEFINITIONS.find((item) => item.id === status);
}
