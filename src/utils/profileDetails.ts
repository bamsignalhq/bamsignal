import type { DatingProfile, DiscoverProfile } from "../types";
import { isPreferNot } from "./profile";

export type ProfileDetailRow = { label: string; value: string };

type DetailSource = Pick<
  DatingProfile | DiscoverProfile,
  "ethnicity" | "religion" | "occupation" | "stateOfOrigin" | "genotype" | "kidsPreference"
>;

function pushIfFilled(rows: ProfileDetailRow[], label: string, value?: string): void {
  if (!value || isPreferNot(value)) return;
  rows.push({ label, value });
}

/** Optional profile keys — only rows the member has filled in. */
export function getFilledProfileDetails(profile: DetailSource): ProfileDetailRow[] {
  const rows: ProfileDetailRow[] = [];

  pushIfFilled(rows, "Tribe", profile.ethnicity);
  pushIfFilled(rows, "Religion", profile.religion);
  pushIfFilled(rows, "Occupation", profile.occupation);
  pushIfFilled(rows, "State of origin", profile.stateOfOrigin);
  pushIfFilled(rows, "Genotype", profile.genotype);
  pushIfFilled(rows, "Kids", profile.kidsPreference);

  return rows;
}

export function hasFilledProfileDetails(profile: DetailSource): boolean {
  return getFilledProfileDetails(profile).length > 0;
}
