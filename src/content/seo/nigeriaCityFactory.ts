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

export function buildCity(seed: CitySeed): NigeriaCityLocation {
  return {
    slug: seed.slug,
    name: seed.name,
    type: seed.type ?? "lga",
    intro: seed.intro,
    nearby: seed.nearby,
    highlights: seed.highlights,
    meetHint: seed.meetHint,
    connectNote: seed.connectNote,
    indexable: seed.indexable ?? true
  };
}
