/** Nigerian states and major cities/LGAs per state */
export const NIGERIA_STATE_CITIES: Record<string, readonly string[]> = {
  Abia: ["Aba", "Umuahia", "Arochukwu", "Ohafia", "Obingwa", "Isiala Ngwa"],
  Adamawa: ["Yola", "Mubi", "Numan", "Jimeta", "Gombi", "Michika"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Ikot Abasi"],
  Anambra: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Aguata", "Ihiala"],
  Bauchi: ["Bauchi", "Azare", "Misau", "Jama'are", "Katagum", "Ningi"],
  Bayelsa: ["Yenagoa", "Brass", "Ogbia", "Sagbama", "Nembe", "Ekeremor"],
  Benue: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Vandeikya", "Adikpo"],
  Borno: ["Maiduguri", "Biu", "Bama", "Dikwa", "Monguno", "Gwoza"],
  "Cross River": ["Calabar", "Ikom", "Ogoja", "Obudu", "Akamkpa", "Ugep"],
  Delta: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor", "Ozoro"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ezza", "Ishielu", "Uburu"],
  Edo: ["Benin", "Auchi", "Ekpoma", "Uromi", "Irrua", "Agenebode"],
  Ekiti: ["Ado-Ekiti", "Ikere-Ekiti", "Ijero-Ekiti", "Oye-Ekiti", "Ikole", "Emure"],
  Enugu: ["Enugu", "Nsukka", "Agbani", "Oji River", "Udi", "Awgu"],
  FCT: ["Abuja", "Gwagwalada", "Kuje", "Bwari", "Abaji", "Kwali"],
  Gombe: ["Gombe", "Kaltungo", "Billiri", "Dukku", "Deba", "Kumo"],
  Imo: ["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta", "Nkwerre"],
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Birnin Kudu", "Kazaure", "Ringim"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Soba", "Ikara", "Kachia"],
  Kano: ["Kano", "Wudil", "Gwarzo", "Rano", "Bichi", "Dambatta"],
  Katsina: ["Katsina", "Daura", "Funtua", "Malumfashi", "Dutsin-Ma", "Kankia"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Jega", "Bagudo"],
  Kogi: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa", "Ajaokuta"],
  Kwara: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi", "Patigi", "Jebba"],
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
    "Ajah"
  ],
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Doma", "Karu"],
  Niger: ["Minna", "Bida", "Suleja", "Kontagora", "New Bussa", "Mokwa"],
  Ogun: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ilaro", "Agbara"],
  Ondo: ["Akure", "Ondo", "Owo", "Ikare", "Ore", "Okitipupa"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Ikire"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki", "Eruwa"],
  Plateau: ["Jos", "Bukuru", "Pankshin", "Shendam", "Langtang", "Mangu"],
  Rivers: ["Port Harcourt", "Bonny", "Degema", "Eleme", "Omoku", "Buguma"],
  Sokoto: ["Sokoto", "Tambuwal", "Gwadabawa", "Wurno", "Illela", "Rabah"],
  Taraba: ["Jalingo", "Wukari", "Bali", "Takum", "Gembu", "Ibi"],
  Yobe: ["Damaturu", "Potiskum", "Nguru", "Gashua", "Geidam", "Buni Yadi"],
  Zamfara: ["Gusau", "Kaura Namoda", "Anka", "Talata Mafara", "Shinkafi", "Maru"]
};

export const NIGERIAN_STATES = Object.keys(NIGERIA_STATE_CITIES).sort((a, b) =>
  a.localeCompare(b, "en", { sensitivity: "base" })
) as readonly string[];

export function citiesForState(state: string): string[] {
  if (!state) return [];
  return [...(NIGERIA_STATE_CITIES[state] ?? [])];
}

export function stateForCity(city: string): string | undefined {
  if (!city) return undefined;
  for (const [state, cities] of Object.entries(NIGERIA_STATE_CITIES)) {
    if (cities.includes(city)) return state;
  }
  return undefined;
}

export const ALL_NIGERIAN_CITIES = [
  ...new Set(Object.values(NIGERIA_STATE_CITIES).flat())
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
