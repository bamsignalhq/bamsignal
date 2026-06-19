export type NigeriaCityLocation = {
  slug: string;
  name: string;
  type: "city" | "lga";
  intro: string;
  nearby: string[];
  highlights: string[];
  meetHint: string;
  connectNote: string;
  /** Only true when intro, highlights, meetHint, and FAQs meet quality bar. Default false. */
  indexable: boolean;
};

export type NigeriaStateLocation = {
  slug: string;
  name: string;
  region: string;
  intro: string;
  nearbyStates: string[];
  cities: NigeriaCityLocation[];
  indexable: boolean;
};

export const NIGERIA_DIRECTORY_PATH = "/nigeria";
