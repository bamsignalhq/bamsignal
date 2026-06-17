import type { DatingProfile, DiscoverProfile } from "../types";
import { isPreferNot } from "./profile";

export type ProfileDetailRow = { label: string; value: string };

type DetailSource = {
  ethnicity?: string;
  religion?: string;
  occupation?: string;
  occupations?: string[];
  stateOfOrigin?: string;
  statesOfOrigin?: string[];
  genotype?: string;
  genotypes?: string[];
  kidsPreference?: string;
  hasKidsOptions?: string[];
  wantsKidsOptions?: string[];
  lifestyle?: string;
  lifestyles?: string[];
  bodyTypes?: string[];
};

function pushIfFilled(rows: ProfileDetailRow[], label: string, value?: string): void {
  if (!value || isPreferNot(value)) return;
  rows.push({ label, value });
}

function pushList(rows: ProfileDetailRow[], label: string, values?: string[]): void {
  const clean = (values ?? []).filter((value) => value && !isPreferNot(value));
  if (!clean.length) return;
  rows.push({ label, value: clean.join(", ") });
}

/** Optional profile keys — only rows the member has filled in. */
export function getFilledProfileDetails(
  profile: DatingProfile | DiscoverProfile | DetailSource
): ProfileDetailRow[] {
  const rows: ProfileDetailRow[] = [];

  pushIfFilled(rows, "Tribe", profile.ethnicity);
  pushIfFilled(rows, "Religion", profile.religion);
  pushList(rows, "Occupation", profile.occupations ?? (profile.occupation ? [profile.occupation] : []));
  pushList(
    rows,
    "State of Origin",
    profile.statesOfOrigin ?? (profile.stateOfOrigin ? [profile.stateOfOrigin] : [])
  );
  pushList(rows, "Genotype", profile.genotypes ?? (profile.genotype ? [profile.genotype] : []));
  pushList(rows, "Lifestyle", profile.lifestyles ?? (profile.lifestyle ? [profile.lifestyle] : []));
  pushList(rows, "Body Type", profile.bodyTypes);
  if (profile.hasKidsOptions?.length) {
    pushList(rows, "Has Kids", profile.hasKidsOptions);
  } else if (profile.wantsKidsOptions?.length) {
    pushList(rows, "Wants Kids", profile.wantsKidsOptions);
  } else {
    pushIfFilled(rows, "Kids", profile.kidsPreference);
  }

  return rows;
}

export function hasFilledProfileDetails(
  profile: DatingProfile | DiscoverProfile | DetailSource
): boolean {
  return getFilledProfileDetails(profile).length > 0;
}
