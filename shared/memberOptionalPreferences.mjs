export const MAX_OPTIONAL_PREFERENCE_SELECTIONS = 3;

const VALID_OCCUPATIONS = new Set([
  "Healthcare",
  "Education",
  "Business",
  "Tech",
  "Engineering",
  "Finance",
  "Government",
  "Law",
  "Media",
  "Creative",
  "Student",
  "Entrepreneur",
  "Other"
]);

const VALID_GENOTYPES = new Set(["AA", "AS", "SS", "AC", "SC", "CC"]);

const VALID_BODY_TYPES = new Set([
  "Slim",
  "Average",
  "Athletic",
  "Curvy",
  "Plus-size",
  "Thick",
  "Petite"
]);

const VALID_HAS_KIDS = new Set(["Has kids", "No kids"]);
const VALID_WANTS_KIDS = new Set(["Wants kids", "Doesn't want kids", "Open to kids"]);

const VALID_TRIBES = new Set([
  "Igbo",
  "Yoruba",
  "Hausa",
  "Fulani",
  "Kanuri",
  "Ijaw",
  "Edo",
  "Tiv",
  "Nupe",
  "Igala",
  "Ibibio",
  "Efik",
  "Urhobo",
  "Isoko",
  "Itsekiri",
  "Idoma",
  "Ebira",
  "Esan",
  "Angas",
  "Berom",
  "Gbagyi",
  "Jukun",
  "Ogoni",
  "Tarok",
  "Bachama",
  "Egun",
  "Ekoi",
  "Gwari",
  "Igede",
  "Ikwerre",
  "Kataf",
  "Mumuye",
  "Ron",
  "Ukwuani",
  "Bura",
  "Chokwe",
  "Kalabari",
  "Kambari",
  "Koro",
  "Kuteb",
  "Mada",
  "Margi",
  "Hausa-Fulani",
  "Ndola",
  "Ogori",
  "Okun",
  "Other"
]);

function normalizeAllowedList(raw, allowed, legacySingle, max = MAX_OPTIONAL_PREFERENCE_SELECTIONS) {
  const seen = new Set();
  const out = [];
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const sources = list.length > 0 ? list : legacySingle != null && legacySingle !== "" ? [legacySingle] : [];

  for (const item of sources) {
    const value = String(item || "").trim();
    if (!value || value === "Prefer not to say" || !allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

function normalizeStateList(raw, legacySingle, max = MAX_OPTIONAL_PREFERENCE_SELECTIONS) {
  const seen = new Set();
  const out = [];
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const sources = list.length > 0 ? list : legacySingle != null && legacySingle !== "" ? [legacySingle] : [];

  for (const item of sources) {
    const value = String(item || "").trim();
    if (!value || value === "Prefer not to say" || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

/** Server-side profile JSON — trim optional preference arrays to max three. */
export function normalizeProfileOptionalPreferences(profile = {}) {
  const next = { ...profile };

  const ethnicities = normalizeAllowedList(next.ethnicities, VALID_TRIBES, next.ethnicity);
  next.ethnicities = ethnicities;
  next.ethnicity = ethnicities[0];

  const occupations = normalizeAllowedList(next.occupations, VALID_OCCUPATIONS, next.occupation);
  next.occupations = occupations;
  next.occupation = occupations[0];

  const statesOfOrigin = normalizeStateList(next.statesOfOrigin, next.stateOfOrigin);
  next.statesOfOrigin = statesOfOrigin;
  next.stateOfOrigin = statesOfOrigin[0];

  const genotypes = normalizeAllowedList(next.genotypes, VALID_GENOTYPES, next.genotype);
  next.genotypes = genotypes;
  next.genotype = genotypes[0];

  next.hasKidsOptions = normalizeAllowedList(next.hasKidsOptions, VALID_HAS_KIDS);
  next.wantsKidsOptions = normalizeAllowedList(next.wantsKidsOptions, VALID_WANTS_KIDS);
  next.bodyTypes = normalizeAllowedList(next.bodyTypes, VALID_BODY_TYPES);

  return next;
}

export function normalizeSearchOccupations(raw) {
  return normalizeAllowedList(raw, VALID_OCCUPATIONS);
}

export function normalizeSearchStatesOfOrigin(raw) {
  return normalizeStateList(raw);
}

export function normalizeSearchGenotypes(raw) {
  return normalizeAllowedList(raw, VALID_GENOTYPES);
}

export function normalizeSearchBodyTypes(raw) {
  return normalizeAllowedList(raw, VALID_BODY_TYPES);
}

export function normalizeSearchTribes(raw) {
  return normalizeAllowedList(raw, VALID_TRIBES);
}

export function normalizeSearchHasKids(raw) {
  return normalizeAllowedList(raw, VALID_HAS_KIDS);
}

export function normalizeSearchWantsKids(raw) {
  return normalizeAllowedList(raw, VALID_WANTS_KIDS);
}
