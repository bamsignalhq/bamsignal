/** Nigerian states and major cities/LGAs per state — 36 states + FCT */
export const NIGERIA_STATE_CITIES: Record<string, readonly string[]> = {
  Abia: ["Aba", "Umuahia", "Arochukwu", "Ohafia", "Obingwa", "Isiala Ngwa", "Osisioma", "Umudike", "Bende", "Akwete"],
  Adamawa: ["Yola", "Mubi", "Numan", "Jimeta", "Gombi", "Michika", "Hong"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Ikot Abasi", "Ekparakwa"],
  Anambra: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Aguata", "Ihiala", "Ogbaru"],
  Bauchi: ["Bauchi", "Azare", "Misau", "Jama'are", "Katagum", "Ningi", "Tafawa Balewa"],
  Bayelsa: ["Yenagoa", "Brass", "Ogbia", "Sagbama", "Nembe", "Ekeremor", "Amassoma"],
  Benue: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Vandeikya", "Adikpo", "Wukari Road"],
  Borno: ["Maiduguri", "Biu", "Bama", "Dikwa", "Monguno", "Gwoza", "Bama"],
  "Cross River": ["Calabar", "Ikom", "Ogoja", "Obudu", "Akamkpa", "Ugep", "Odukpani"],
  Delta: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor", "Ozoro", "Effurun"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ezza", "Ishielu", "Uburu", "Ikwo"],
  Edo: ["Benin", "Auchi", "Ekpoma", "Uromi", "Irrua", "Agenebode", "Ugbowo"],
  Ekiti: ["Ado-Ekiti", "Ikere-Ekiti", "Ijero-Ekiti", "Oye-Ekiti", "Ikole", "Emure", "Ise-Ekiti"],
  Enugu: ["Enugu", "Nsukka", "Agbani", "Oji River", "Udi", "Awgu", "Coal Camp"],
  FCT: [
    "Abuja",
    "Garki",
    "Wuse",
    "Maitama",
    "Asokoro",
    "Kubwa",
    "Lugbe",
    "Gwarinpa",
    "Gwagwalada",
    "Kuje",
    "Bwari",
    "Abaji",
    "Kwali"
  ],
  Gombe: ["Gombe", "Kaltungo", "Billiri", "Dukku", "Deba", "Kumo", "Bajoga"],
  Imo: ["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta", "Nkwerre", "Orsu"],
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Birnin Kudu", "Kazaure", "Ringim", "Babura"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Soba", "Ikara", "Kachia", "Jema'a"],
  Kano: ["Kano", "Wudil", "Gwarzo", "Rano", "Bichi", "Dambatta", "Ungogo"],
  Katsina: ["Katsina", "Daura", "Funtua", "Malumfashi", "Dutsin-Ma", "Kankia", "Jibia"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Jega", "Bagudo", "Koko"],
  Kogi: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa", "Ajaokuta", "Anyigba"],
  Kwara: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi", "Patigi", "Jebba", "Ilorin South"],
  Lagos: [
    "Lagos",
    "Ikeja",
    "Lekki",
    "Victoria Island",
    "Ikorodu",
    "Epe",
    "Badagry",
    "Surulere",
    "Yaba",
    "Ajah",
    "Apapa",
    "Maryland",
    "Festac",
    "Ikoyi",
    "Banana Island",
    "Magodo",
    "Gbagada",
    "Oshodi",
    "Mushin",
    "Alimosho"
  ],
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Doma", "Karu", "Masaka"],
  Niger: ["Minna", "Bida", "Suleja", "Kontagora", "New Bussa", "Mokwa", "Sabon Wuse"],
  Ogun: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ilaro", "Agbara", "Mowe"],
  Ondo: ["Akure", "Ondo", "Owo", "Ikare", "Ore", "Okitipupa", "Idanre"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Ikire", "Ejigbo"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki", "Eruwa", "Moniya"],
  Plateau: ["Jos", "Bukuru", "Pankshin", "Shendam", "Langtang", "Mangu", "Vom"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme", "Okrika", "Bonny", "Degema", "Omoku", "Buguma"],
  Sokoto: ["Sokoto", "Tambuwal", "Gwadabawa", "Wurno", "Illela", "Rabah", "Bodinga"],
  Taraba: ["Jalingo", "Wukari", "Bali", "Takum", "Gembu", "Ibi", "Mutum Biyu"],
  Yobe: ["Damaturu", "Potiskum", "Nguru", "Gashua", "Geidam", "Buni Yadi", "Nguru"],
  Zamfara: ["Gusau", "Kaura Namoda", "Anka", "Talata Mafara", "Shinkafi", "Maru", "Tsafe"]
};

const SORTED_STATES = Object.keys(NIGERIA_STATE_CITIES).sort((a, b) =>
  a.localeCompare(b, "en", { sensitivity: "base" })
);

/** Abia first (home state), then remaining states A–Z */
export const NIGERIAN_STATES = [
  "Abia",
  ...SORTED_STATES.filter((s) => s !== "Abia")
] as readonly string[];

export function citiesForState(state: string): string[] {
  if (!state) return [];
  return [...(NIGERIA_STATE_CITIES[state] ?? [])];
}

export function stateForCity(city: string): string | undefined {
  if (!city) return undefined;
  const needle = city.trim().toLowerCase();
  for (const [state, cities] of Object.entries(NIGERIA_STATE_CITIES)) {
    if (cities.some((c) => c.toLowerCase() === needle)) return state;
  }
  return undefined;
}

export function searchCitiesInState(state: string, query: string): string[] {
  const cities = citiesForState(state);
  const q = query.trim().toLowerCase();
  if (!q) return cities;
  return cities.filter((city) => city.toLowerCase().includes(q));
}

export const ALL_NIGERIAN_CITIES = [
  ...new Set(Object.values(NIGERIA_STATE_CITIES).flat())
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

/** Map LGA/local city to nearest launch metro for discovery proximity */
export function metroForCity(city: string): string {
  const state = stateForCity(city);
  if (state === "FCT") return "Abuja";
  if (state === "Rivers") return "Port Harcourt";
  if (state === "Lagos") return "Lagos";
  if (city === "Ibadan" || city === "Abeokuta" || city === "Sagamu") return "Lagos";
  return city;
}
