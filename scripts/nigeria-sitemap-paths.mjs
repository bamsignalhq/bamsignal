/** Indexable Nigeria SEO paths — keep in sync with src/content/seo/nigeriaPriorityCities.ts */
export const NIGERIA_INDEXABLE_STATE_SLUGS = [
  "lagos",
  "fct",
  "rivers",
  "enugu",
  "oyo",
  "abia",
  "akwa-ibom",
  "cross-river",
  "anambra",
  "imo",
  "edo",
  "delta",
  "kano",
  "kaduna",
  "plateau",
  "ogun",
  "ondo",
  "osun",
  "kwara",
  "benue",
  "bayelsa",
  "kogi",
  "niger"
];

export const NIGERIA_INDEXABLE_CITY_SLUGS = {
  lagos: [
    "ikeja",
    "lekki",
    "victoria-island",
    "yaba",
    "surulere",
    "ajah",
    "maryland",
    "festac",
    "epe",
    "badagry"
  ],
  fct: ["abuja", "wuse", "gwarinpa", "maitama", "asokoro", "kubwa", "jabi", "garki", "lugbe"],
  rivers: ["port-harcourt", "obio-akpor", "bonny", "eleme", "oyigbo"],
  enugu: ["enugu", "abakpa", "independence-layout", "new-haven", "trans-ekulu", "nsukka"],
  oyo: ["ibadan", "bodija", "challenge", "ring-road", "oyo-town", "ogbomoso"],
  abia: ["aba", "umuahia", "osisioma", "ohafia", "arochukwu"],
  "akwa-ibom": ["uyo", "eket", "ikot-ekpene", "oron", "eastern-obolo"],
  "cross-river": ["calabar", "calabar-municipality", "calabar-south", "ikom", "obudu"],
  anambra: ["awka", "onitsha", "nnewi", "ekwulobia", "ihiala"],
  imo: ["owerri", "orlu", "okigwe", "mbaise"],
  edo: ["benin", "auchi", "ekpoma", "uromi"],
  delta: ["asaba", "warri", "ughelli", "sapele"],
  kano: ["kano", "wudil", "gware", "nasarawa-kano", "tarauni"],
  kaduna: ["kaduna", "zaria", "kafanchan", "sabon-gari"],
  plateau: ["jos", "bukuru", "pankshin"],
  ogun: ["abeokuta", "sagamu", "ota", "ijebu-ode"],
  ondo: ["akure", "owo", "ondo-town", "ore"],
  osun: ["osogbo", "ile-ife", "ilesa", "ede"],
  kwara: ["ilorin", "offa", "oke-ero"],
  benue: ["makurdi", "gboko", "otukpo"],
  bayelsa: ["yenagoa", "brass", "nembe"],
  kogi: ["lokoja", "okene", "idah"],
  niger: ["minna", "suleja", "bida"]
};

export function getNigeriaIndexablePaths() {
  const paths = ["/nigeria"];
  for (const stateSlug of NIGERIA_INDEXABLE_STATE_SLUGS) {
    paths.push(`/nigeria/${stateSlug}`);
    const cities = NIGERIA_INDEXABLE_CITY_SLUGS[stateSlug] ?? [];
    for (const citySlug of cities) {
      paths.push(`/nigeria/${stateSlug}/${citySlug}`);
    }
  }
  return paths;
}
