import type { NigeriaCityLocation } from "./nigeriaLocationTypes";

type CitySeed = {
  slug: string;
  name: string;
  type?: "city" | "lga";
  intro: string;
  nearby: string[];
  highlights: string[];
  meetHint: string;
  connectNote: string;
  indexable?: boolean;
};

function hasMinimumQuality(seed: CitySeed): boolean {
  return (
    seed.intro.trim().length >= 80 &&
    seed.highlights.length >= 2 &&
    seed.highlights.every((h) => h.trim().length >= 8) &&
    seed.meetHint.trim().length >= 20 &&
    seed.connectNote.trim().length >= 40
  );
}

export function buildCity(seed: CitySeed): NigeriaCityLocation {
  const indexable = seed.indexable === true && hasMinimumQuality(seed);
  return {
    slug: seed.slug,
    name: seed.name,
    type: seed.type ?? "lga",
    intro: seed.intro,
    nearby: seed.nearby,
    highlights: seed.highlights,
    meetHint: seed.meetHint,
    connectNote: seed.connectNote,
    indexable
  };
}

/** Curated city/LGA with reviewed copy — still must pass minimum quality checks. */
export function buildIndexableCity(seed: Omit<CitySeed, "indexable">): NigeriaCityLocation {
  return buildCity({ ...seed, indexable: true });
}
