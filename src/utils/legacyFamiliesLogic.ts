import {
  LEGACY_FAMILY_DISPLAY_FIELDS,
  legacyFamilyStatusLabel,
  type LegacyFamilyDisplayId,
  type LegacyFamilyStatusId
} from "../constants/legacyFamilies";
import type { LegacyFamilyChange } from "../types/relationshipLegacyIndex";
import type { LegacyStatusId } from "../constants/relationshipLegacyIndex";

export type LegacyFamiliesViewModel = {
  journeyId: string;
  marriageYear?: string;
  childrenCount: number;
  currentCountry: string;
  registrationCountry: string;
  familyStatus: LegacyFamilyStatusId;
  growthHistory: LegacyFamilyChange[];
  familyMilestonesCount: number;
};

export type LegacyFamilyDisplayRow = {
  id: LegacyFamilyDisplayId;
  label: string;
  value?: string;
  reached: boolean;
};

export function deriveLegacyFamilyStatus(input: {
  childrenCount: number;
  currentCountry: string;
  registrationCountry: string;
  legacyIndexStatus: LegacyStatusId;
  growthHistory: LegacyFamilyChange[];
}): LegacyFamilyStatusId {
  if (input.legacyIndexStatus === "golden-legacy") {
    return "golden-legacy-family";
  }
  if (
    input.currentCountry &&
    input.registrationCountry &&
    input.currentCountry.trim().toLowerCase() !== input.registrationCountry.trim().toLowerCase()
  ) {
    return "diaspora-family";
  }
  if (input.growthHistory.length > 1 || input.childrenCount > 1) {
    return "growing-family";
  }
  return "legacy-family";
}

export function buildLegacyFamiliesViewModel(input: {
  journeyId: string;
  marriageYear?: string;
  childrenCount: number;
  currentCountry: string;
  registrationCountry: string;
  legacyIndexStatus: LegacyStatusId;
  growthHistory: LegacyFamilyChange[];
  familyMilestonesCount?: number;
}): LegacyFamiliesViewModel {
  const growthHistory = input.growthHistory ?? [];
  return {
    journeyId: input.journeyId,
    marriageYear: input.marriageYear,
    childrenCount: input.childrenCount,
    currentCountry: input.currentCountry,
    registrationCountry: input.registrationCountry,
    familyStatus: deriveLegacyFamilyStatus({
      childrenCount: input.childrenCount,
      currentCountry: input.currentCountry,
      registrationCountry: input.registrationCountry,
      legacyIndexStatus: input.legacyIndexStatus,
      growthHistory
    }),
    growthHistory,
    familyMilestonesCount: input.familyMilestonesCount ?? 0
  };
}

export function buildLegacyFamilyDisplayRows(
  family: LegacyFamiliesViewModel
): LegacyFamilyDisplayRow[] {
  const milestonesSummary = family.familyMilestonesCount
    ? `${family.familyMilestonesCount} family milestone${
        family.familyMilestonesCount === 1 ? "" : "s"
      }`
    : undefined;

  const values: Partial<Record<LegacyFamilyDisplayId, string>> = {
    "journey-id": family.journeyId,
    "marriage-year": family.marriageYear,
    "children-count": String(family.childrenCount),
    "current-country": family.currentCountry,
    "family-milestones": milestonesSummary,
    "legacy-status": legacyFamilyStatusLabel(family.familyStatus)
  };

  return LEGACY_FAMILY_DISPLAY_FIELDS.map((field) => ({
    id: field.id,
    label: field.label,
    value: values[field.id],
    reached: Boolean(values[field.id])
  }));
}
