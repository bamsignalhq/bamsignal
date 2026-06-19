export type CityMeta = {
  slug: string;
  city: string;
  state: string;
  areaHint: string;
  connectNote: string;
  meetHint: string;
  chatHook: string;
};

export const NIGERIAN_CITIES: CityMeta[] = [
  {
    slug: "lagos",
    city: "Lagos",
    state: "Lagos",
    areaHint: "the Island, mainland, or wherever you actually spend your week",
    connectNote:
      "Discovery is tuned for Nigerian cities — filter by area, see prompts that reflect real life here, and send signals when someone genuinely stands out.",
    meetHint: "malls, cafés, and waterfront spots with steady foot traffic",
    chatHook: "a neighbourhood, a brunch spot, or how you survive Lagos traffic"
  },
  {
    slug: "abuja",
    city: "Abuja",
    state: "FCT",
    areaHint: "Wuse, Gwarinpa, Maitama, or the district you call home",
    connectNote:
      "Abuja's pace is different from Lagos — many people here value clear plans and relaxed first meetings. BamSignal lets you signal with context before chat opens.",
    meetHint: "cafés in Wuse 2, park-adjacent spots, or daytime restaurant meetups",
    chatHook: "weekend hikes, favourite Abuja cafés, or life in the capital"
  },
  {
    slug: "port-harcourt",
    city: "Port Harcourt",
    state: "Rivers",
    areaHint: "GRA, Trans Amadi, or your side of town",
    connectNote:
      "PH has a tight social scene and a strong professional crowd. Signals help you stand out with a real note instead of blending into a busy Discover feed.",
    meetHint: "well-lit restaurants and public lounges you can get to easily",
    chatHook: "Port Harcourt food spots, music taste, or what you do after work"
  },
  {
    slug: "enugu",
    city: "Enugu",
    state: "Enugu",
    areaHint: "Independence Layout, New Haven, or your usual corners",
    connectNote:
      "Enugu blends university energy with a growing professional scene. BamSignal works well when your profile mentions the city and what you enjoy locally.",
    meetHint: "central cafés and public spots around town",
    chatHook: "hill-city weekends, local food, or favourite hangout areas"
  },
  {
    slug: "owerri",
    city: "Owerri",
    state: "Imo",
    areaHint: "Ikenegbu, New Owerri, or where your people gather",
    connectNote:
      "Owerri is social by nature. A thoughtful signal — tied to something on their profile — beats a generic hello in a lively city.",
    meetHint: "busy restaurants and mall areas for comfortable first meetups",
    chatHook: "Owerri nightlife pace, food preferences, or weekend routines"
  },
  {
    slug: "benin",
    city: "Benin",
    state: "Edo",
    areaHint: "GRA, Sapele Road axis, or your part of the city",
    connectNote:
      "Benin City has deep culture and a young, connected crowd. Use prompts and signals to start conversations that feel grounded, not rushed.",
    meetHint: "public restaurants and daytime spots you know well",
    chatHook: "Benin culture, music, or how you like to spend slow weekends"
  },
  {
    slug: "ibadan",
    city: "Ibadan",
    state: "Oyo",
    areaHint: "Bodija, UI axis, or the area you move through daily",
    connectNote:
      "Ibadan is spread out — location and honest availability matter. BamSignal helps you match with people whose city and rhythm align with yours.",
    meetHint: "familiar cafés and central meetup points",
    chatHook: "Ibadan's pace, amala debates, or favourite quiet spots"
  },
  {
    slug: "uyo",
    city: "Uyo",
    state: "Akwa Ibom",
    areaHint: "Itiam, Ikot Ekpene Road areas, or your neighbourhood",
    connectNote:
      "Uyo is growing fast. Profiles that mention local life make signals easier — people want to know you fit the city's friendly, open vibe.",
    meetHint: "public eateries and well-known central locations",
    chatHook: "Akwa Ibom food, football, or weekend plans around Uyo"
  },
  {
    slug: "aba",
    city: "Aba",
    state: "Abia",
    areaHint: "Ariaria axis, GRA, or where you work and unwind",
    connectNote:
      "Aba is energetic and entrepreneurial. BamSignal suits people who value direct, respectful conversation — lead with something real from their profile.",
    meetHint: "busy public places where you feel comfortable arriving alone",
    chatHook: "business hustle, local markets, or how you recharge"
  },
  {
    slug: "asaba",
    city: "Asaba",
    state: "Delta",
    areaHint: "GRA, Okpanam Road corridor, or your side of town",
    connectNote:
      "Asaba connects regions — many members travel often. Update your city when you are here so discovery stays relevant.",
    meetHint: "restaurants and lounges along familiar routes",
    chatHook: "river-city evenings, travel, or favourite Asaba hangouts"
  },
  {
    slug: "kaduna",
    city: "Kaduna",
    state: "Kaduna",
    areaHint: "Barnawa, Malali, or the district you know best",
    connectNote:
      "Kaduna mixes institutions, creatives, and professionals. Signals let you show interest with a note — useful in a city where people value courtesy.",
    meetHint: "daytime public venues and established restaurant spots",
    chatHook: "Kaduna food scene, creative hobbies, or weekend routines"
  },
  {
    slug: "kano",
    city: "Kano",
    state: "Kano",
    areaHint: "Nasarawa GRA, Sabon Gari, or your everyday routes",
    connectNote:
      "Kano has its own dating culture and pace. BamSignal supports respectful discovery — clear profiles and polite signals go a long way here.",
    meetHint: "public family-friendly venues for first meetings",
    chatHook: "Kano traditions, food, or what you are looking for in a connection"
  },
  {
    slug: "jos",
    city: "Jos",
    state: "Plateau",
    areaHint: "Rayfield, Bukuru road areas, or cooler-plateau neighbourhoods",
    connectNote:
      "Jos feels distinct — climate, scenery, and a mixed community. Mention outdoor interests or local spots; they make great signal openers.",
    meetHint: "central cafés and public places with easy access",
    chatHook: "Jos weather, hikes, or favourite views around town"
  },
  {
    slug: "calabar",
    city: "Calabar",
    state: "Cross River",
    areaHint: "Marian, Watt Market axis, or your usual area",
    connectNote:
      "Calabar is welcoming and social. BamSignal helps you connect beyond your immediate circle — with signals that invite real reply.",
    meetHint: "waterfront-adjacent public spots and known restaurant areas",
    chatHook: "Calabar carnival season, seafood spots, or relaxed beach-town energy"
  },
  {
    slug: "warri",
    city: "Warri",
    state: "Delta",
    areaHint: "Effurun, GRA, or where your week centres",
    connectNote:
      "Warri has strong personality and loyal locals. Profiles with honest prompts attract better signals — show how you actually live here.",
    meetHint: "familiar public eateries and easy-to-find meetup points",
    chatHook: "Warri humour, food, or how you balance work and social life"
  },
  {
    slug: "onitsha",
    city: "Onitsha",
    state: "Anambra",
    areaHint: "GRA, Awka Road corridor, or your market-adjacent routine",
    connectNote:
      "Onitsha moves quickly. Short, specific signals work well — mention something from their profile and keep the tone warm.",
    meetHint: "central public venues on routes you know",
    chatHook: "commerce culture, Anambra food, or weekend trips to nearby towns"
  },
  {
    slug: "awka",
    city: "Awka",
    state: "Anambra",
    areaHint: "Amawbia axis, government layout areas, or campus-adjacent life",
    connectNote:
      "Awka blends student and professional energy. BamSignal fits people building connections alongside busy schedules.",
    meetHint: "daytime cafés and restaurants with steady visibility",
    chatHook: "Anambra life, politics-of-the-plate, or study-and-work balance"
  },
  {
    slug: "ilorin",
    city: "Ilorin",
    state: "Kwara",
    areaHint: "GRA, Tanke, or your side of the city",
    connectNote:
      "Ilorin is calm compared to mega-cities — conversations often grow slowly and sincerely. Signals reward patience and specificity.",
    meetHint: "quiet public restaurants and mall areas",
    chatHook: "Ilorin pace, university town energy, or local delicacies"
  },
  {
    slug: "akure",
    city: "Akure",
    state: "Ondo",
    areaHint: "Alagbaka, Oba-Ile axis, or where you spend weekends",
    connectNote:
      "Akure is close-knit. A clear profile and respectful signals help you connect without awkwardness in a smaller city feel.",
    meetHint: "known public spots downtown",
    chatHook: "Ondo heritage, road trips, or favourite low-key hangouts"
  },
  {
    slug: "osogbo",
    city: "Osogbo",
    state: "Osun",
    areaHint: "Dada estate, Oke-Baale axis, or cultural Osogbo life",
    connectNote:
      "Osogbo carries arts and tradition alongside everyday dating. Mention culture or creative interests — they spark better chats.",
    meetHint: "central public venues for unhurried first meetings",
    chatHook: "Osun culture, art scenes, or how you unwind after work"
  }
];
