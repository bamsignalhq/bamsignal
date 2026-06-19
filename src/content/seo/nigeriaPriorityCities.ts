import { buildCity } from "./nigeriaCityFactory";
import type { NigeriaCityLocation } from "./nigeriaLocationTypes";

const lagos = (slug: string, name: string, intro: string, nearby: string[], highlights: string[], meetHint: string): NigeriaCityLocation =>
  buildCity({
    slug,
    name,
    intro,
    nearby,
    highlights,
    meetHint,
    connectNote:
      "BamSignal is built for Nigerian city life — filter by area, read prompts, and send a signal when someone's profile feels like a real match."
  });

export const PRIORITY_CITIES_BY_STATE: Record<string, NigeriaCityLocation[]> = {
  lagos: [
    lagos(
      "ikeja",
      "Ikeja",
      "Ikeja is a practical meet-up hub — offices, malls, and food spots make first dates straightforward if you pick somewhere public you know.",
      ["yaba", "maryland", "surulere"],
      ["Computer Village energy", "Mall meetups on the mainland", "Easy BRT and ride-hail access"],
      "Ikeja City Mall area or a café on Allen Avenue"
    ),
    lagos(
      "lekki",
      "Lekki",
      "Lekki stretches long — being specific about your axis (Phase 1, Ajah corridor, or Lekki-Ikate) saves traffic stress when planning a meetup.",
      ["ajah", "victoria-island", "ikeja"],
      ["Waterfront cafés", "Weekend brunch culture", "Active young professional scene"],
      "a Lekki mall or beach-adjacent public restaurant"
    ),
    lagos(
      "victoria-island",
      "Victoria Island",
      "VI suits evening meetups when you want a central Island spot — share which end you mean so nobody crosses the bridge twice.",
      ["lekki", "surulere", "yaba"],
      ["After-work drinks culture", "Restaurant rows", "Short hops to mainland"],
      "a well-known VI restaurant or café with steady foot traffic"
    ),
    lagos(
      "yaba",
      "Yaba",
      "Yaba blends students, tech workers, and creatives — profiles that mention campus life or Tejuosho weekends tend to get better replies.",
      ["surulere", "ikeja", "maryland"],
      ["Tech and university crowd", "Affordable café dates", "Mainland central"],
      "a Yaba café or Sabo market-adjacent public spot"
    ),
    lagos(
      "surulere",
      "Surulere",
      "Surulere is classic Lagos — sports, food, and neighbourhood pride. Lead signals with local flavour, not generic lines.",
      ["yaba", "maryland", "ikeja"],
      ["National Stadium area", "Street food dates", "Mainland connector"],
      "a Surulere restaurant or mall you can reach independently"
    ),
    lagos(
      "ajah",
      "Ajah",
      "Ajah and the corridor toward Sangotedo carry heavy traffic — daytime meetups and clear location pins help everyone.",
      ["lekki", "festac", "victoria-island"],
      ["Growing residential belt", "Mall meetup options", "Commuter couples"],
      "Ajah mall or a café along the Lekki-Epe expressway"
    ),
    lagos(
      "maryland",
      "Maryland",
      "Maryland sits between mainland hubs — easy to suggest for people split between Ikeja and the Island.",
      ["ikeja", "yaba", "surulere"],
      ["MEND Mall meetups", "Keke and bus links", "Mid-mainland convenience"],
      "Maryland Mall or a nearby public restaurant"
    ),
    lagos(
      "festac",
      "Festac",
      "Festac has its own loyal community — mention your estate or axis so matches know the commute honestly.",
      ["surulere", "ajah", "ikeja"],
      ["Established neighbourhood feel", "Amuwo Odofin links", "Relaxed pace vs Island"],
      "Festac town centre eateries or mall spots"
    ),
    lagos(
      "epe",
      "Epe",
      "Epe is quieter than central Lagos — plan meetups with realistic travel time if you are matching across the state.",
      ["ikeja", "badagry", "festac"],
      ["Fish market culture", "Weekend day trips", "Coastal calm"],
      "a public Epe restaurant or waterfront-adjacent spot in daylight"
    ),
    lagos(
      "badagry",
      "Badagry",
      "Badagry's history and beach edges attract weekend explorers — be clear if you are based here or visiting.",
      ["epe", "festac", "ikeja"],
      ["Heritage sites", "Beach day meetups", "Border-town openness"],
      "a central Badagry public venue you know well"
    )
  ],
  fct: [
    buildCity({
      slug: "abuja",
      name: "Abuja",
      type: "city",
      intro:
        "Abuja spreads wide — from Kubwa to Asokoro. Profiles with a real area and weekend rhythm get better signals than a generic \"FCT\" tag.",
      nearby: ["wuse", "gwarinpa", "maitama"],
      highlights: ["Capital professional scene", "Planned district dating", "Mixed expat and local crowd"],
      meetHint: "Wuse 2 cafés or a Gwarinpa restaurant you trust",
      connectNote:
        "Discovery on BamSignal respects Nigerian cities — set Abuja, browse nearby, and signal with a note tied to their profile."
    }),
    buildCity({
      slug: "wuse",
      name: "Wuse",
      intro: "Wuse 2 is a default first-date zone for many Abuja daters — busy, familiar, and easy to leave.",
      nearby: ["garki", "maitama", "abuja"],
      highlights: ["Restaurant rows", "Evening meetup culture", "Central for many workers"],
      meetHint: "Wuse 2 public restaurant or café",
      connectNote: "Mention Wuse explicitly in chat so plans align with traffic from Gwarinpa or Kubwa."
    }),
    buildCity({
      slug: "gwarinpa",
      name: "Gwarinpa",
      intro: "Gwarinpa's estate grids suit people who prefer calmer meetups away from central Wuse noise.",
      nearby: ["kubwa", "jabi", "wuse"],
      highlights: ["Large residential belt", "Local bukas and lounges", "Young family and pro mix"],
      meetHint: "Gwarinpa plaza eateries or a known mall spot",
      connectNote: "Share your estate zone early — Gwarinpa is big and pins matter."
    }),
    buildCity({
      slug: "maitama",
      name: "Maitama",
      intro: "Maitama dates often skew upscale — match expectations in chat so nobody feels out of place.",
      nearby: ["asokoro", "wuse", "garki"],
      highlights: ["Diplomatic and corporate crowd", "Quiet evening spots", "Premium dining options"],
      meetHint: "a Maitama restaurant with public seating",
      connectNote: "Signals that reference neighbourhood taste land better than vague compliments."
    }),
    buildCity({
      slug: "asokoro",
      name: "Asokoro",
      intro: "Asokoro and adjacent hills attract civil servants and professionals — weekday evening slots work well.",
      nearby: ["maitama", "garki", "wuse"],
      highlights: ["Government quarter proximity", "Hill views", "Structured work-life dating"],
      meetHint: "Asokoro or adjacent central café",
      connectNote: "Be punctual — many Asokoro matches juggle strict office hours."
    }),
    buildCity({
      slug: "kubwa",
      name: "Kubwa",
      intro: "Kubwa's growth means longer commutes to central Abuja — honest location tags prevent mismatched expectations.",
      nearby: ["gwarinpa", "lugbe", "jabi"],
      highlights: ["Affordable dating scene", "BRT-linked commuters", "Young renters"],
      meetHint: "Kubwa market-adjacent restaurants or plazas",
      connectNote: "Suggest meetups near transport you both use — Kubwa to town can be heavy."
    }),
    buildCity({
      slug: "jabi",
      name: "Jabi",
      intro: "Jabi Lake and mall area is a familiar Abuja first-date pick — daytime works well for new matches.",
      nearby: ["gwarinpa", "wuse", "lugbe"],
      highlights: ["Lake-side walks", "Mall coffee dates", "Mixed crowd"],
      meetHint: "Jabi Lake Mall or lakeside public areas in daylight",
      connectNote: "Lake meetups are popular — propose a specific time and entrance point."
    }),
    buildCity({
      slug: "garki",
      name: "Garki",
      intro: "Garki balances old Abuja charm and central access — good for matches split across districts.",
      nearby: ["wuse", "asokoro", "maitama"],
      highlights: ["Area 11 social life", "Central location", "Mixed age range"],
      meetHint: "Garki II restaurant or shopping complex",
      connectNote: "Area numbers help — Garki is not one single pin."
    }),
    buildCity({
      slug: "lugbe",
      name: "Lugbe",
      intro: "Lugbe and airport road belt suit people who want mainland Abuja energy without full Wuse prices.",
      nearby: ["kubwa", "jabi", "gwarinpa"],
      highlights: ["Airport corridor commuters", "Growing mall scene", "Straightforward meetups"],
      meetHint: "Lugbe plaza or airport road restaurants",
      connectNote: "Traffic toward town peaks at rush hour — plan around it."
    })
  ],
  rivers: [
    buildCity({
      slug: "port-harcourt",
      name: "Port Harcourt",
      type: "city",
      intro:
        "PH city and Greater Port Harcourt span multiple LGAs — say whether you mean GRA, Trans Amadi, or another axis.",
      nearby: ["obio-akpor", "eleme", "oyigbo"],
      highlights: ["Oil city professional mix", "GRA dining", "Garden City social life"],
      meetHint: "GRA or mall restaurants with public seating",
      connectNote: "Port Harcourt daters value directness — specific signals beat empty hellos."
    }),
    buildCity({
      slug: "obio-akpor",
      name: "Obio-Akpor",
      intro: "Obio-Akpor wraps much of urban PH — Rumuola, Rumuomasi, and Rukpokwu daters often identify by neighbourhood.",
      nearby: ["port-harcourt", "oyigbo", "eleme"],
      highlights: ["Dense urban belt", "University-adjacent energy", "Local buka culture"],
      meetHint: "Rumuokoro or Mile 3 public spots you know",
      connectNote: "Name your Rumu axis — it helps matches gauge distance."
    }),
    buildCity({
      slug: "bonny",
      name: "Bonny",
      intro: "Bonny Island has a distinct rhythm from mainland PH — travel plans matter for matches across the water.",
      nearby: ["port-harcourt", "eleme", "obio-akpor"],
      highlights: ["Island community", "Weekend travel dating", "Tight-knit social circles"],
      meetHint: "Bonny town public venues in daylight",
      connectNote: "Be upfront about ferry or boat logistics when suggesting meetups."
    }),
    buildCity({
      slug: "eleme",
      name: "Eleme",
      intro: "Eleme industrial belt meets residential pockets — many daters work shifts; flexible timing helps.",
      nearby: ["port-harcourt", "obio-akpor", "oyigbo"],
      highlights: ["Industrial corridor", "Refinery community", "Practical dating pace"],
      meetHint: "Eleme junction eateries or PH-bound meetup points",
      connectNote: "Shift work is common — ask about free evenings early."
    }),
    buildCity({
      slug: "oyigbo",
      name: "Oyigbo",
      intro: "Oyigbo links PH to the east — Aba-road energy and market life shape how people socialise here.",
      nearby: ["obio-akpor", "port-harcourt", "eleme"],
      highlights: ["Transport hub", "Young trader and pro mix", "Affordable meetups"],
      meetHint: "Oyigbo main road restaurants or plazas",
      connectNote: "Cross-LGA matches work when you share realistic commute times."
    })
  ],
  enugu: [
    buildCity({
      slug: "enugu",
      name: "Enugu",
      type: "city",
      intro: "Enugu city balances coal-city heritage with a calm dating pace — prompts about hills and hangouts resonate.",
      nearby: ["independence-layout", "new-haven", "abakpa"],
      highlights: ["Hill city views", "Government and university mix", "Relaxed conversation culture"],
      meetHint: "Independence Layout or New Haven cafés",
      connectNote: "Enugu rewards polite, specific signals — mention what caught your eye on their profile."
    }),
    buildCity({
      slug: "abakpa",
      name: "Abakpa",
      intro: "Abakpa Nike and surrounding estates carry student and young pro energy — evening mall meetups are common.",
      nearby: ["enugu", "trans-ekulu", "new-haven"],
      highlights: ["Student-adjacent", "Affordable dates", "Lively weekends"],
      meetHint: "Abakpa plaza or campus-road public spots",
      connectNote: "If you are near UNEC axis, say so — it narrows discovery nicely."
    }),
    buildCity({
      slug: "independence-layout",
      name: "Independence Layout",
      intro: "Indy Layout is a go-to for unhurried coffee dates in Enugu — central and familiar to many locals.",
      nearby: ["new-haven", "enugu", "trans-ekulu"],
      highlights: ["Café culture", "Professional crowd", "Easy taxis"],
      meetHint: "Independence Layout restaurants you know",
      connectNote: "Layout matches often prefer daytime first meetups — suggest clearly."
    }),
    buildCity({
      slug: "new-haven",
      name: "New Haven",
      intro: "New Haven market and residential streets blend busy and residential — pick a public spot off the main market rush.",
      nearby: ["independence-layout", "enugu", "abakpa"],
      highlights: ["Market-adjacent social life", "Mixed demographics", "Central Enugu"],
      meetHint: "New Haven side-street cafés or lounges",
      connectNote: "Weekend market traffic is heavy — plan meetups with buffer time."
    }),
    buildCity({
      slug: "trans-ekulu",
      name: "Trans-Ekulu",
      intro: "Trans-Ekulu hill views attract couples who like quieter Enugu corners — share transport plans honestly.",
      nearby: ["enugu", "new-haven", "abakpa"],
      highlights: ["Scenic area", "Residential calm", "Sunset meetup potential"],
      meetHint: "Trans-Ekulu public restaurants in daylight",
      connectNote: "Hill roads can be slow — confirm arrival times in chat."
    }),
    buildCity({
      slug: "nsukka",
      name: "Nsukka",
      intro: "Nsukka's university town vibe is distinct from Enugu city — update your location when you are on campus.",
      nearby: ["enugu", "abakpa", "new-haven"],
      highlights: ["UNN community", "Academic calendar rhythm", "Tight social networks"],
      meetHint: "Nsukka campus-adjacent public cafés",
      connectNote: "Semester timing affects availability — ask gently about schedules."
    })
  ],
  oyo: [
    buildCity({
      slug: "ibadan",
      name: "Ibadan",
      type: "city",
      intro: "Ibadan is vast — Bodija, UI, Challenge, and Ring Road feel like different cities. Pin your area on BamSignal.",
      nearby: ["bodija", "challenge", "ring-road"],
      highlights: ["Nigeria's largest city by area", "University and pro mix", "Relaxed dating pace"],
      meetHint: "Bodija or Ring Road malls and cafés",
      connectNote: "Distance honesty matters in Ibadan — suggest meetups near both of you."
    }),
    buildCity({
      slug: "bodija",
      name: "Bodija",
      intro: "Bodija market energy meets student housing — casual daytime meetups work well here.",
      nearby: ["ibadan", "challenge", "ring-road"],
      highlights: ["UI proximity", "Market culture", "Affordable food dates"],
      meetHint: "Bodija public restaurants away from market crush",
      connectNote: "Reference UI or market life in signals if it fits their profile."
    }),
    buildCity({
      slug: "challenge",
      name: "Challenge",
      intro: "Challenge and Molete corridor suit south Ibadan daters — clear bus or ride plans help first meetings.",
      nearby: ["ibadan", "ring-road", "bodija"],
      highlights: ["South Ibadan hub", "Busy commercial strip", "Young renters"],
      meetHint: "Challenge junction eateries or plazas",
      connectNote: "Molete traffic peaks evenings — midday meetups can be easier."
    }),
    buildCity({
      slug: "ring-road",
      name: "Ring Road",
      intro: "Ring Road's malls anchor many Ibadan first dates — familiar, public, and easy to find.",
      nearby: ["ibadan", "bodija", "challenge"],
      highlights: ["Mall dating culture", "Central Ibadan", "Evening social scene"],
      meetHint: "Ring Road mall cafés or cinemas area",
      connectNote: "Mall meetups are popular — name the exact complex."
    }),
    buildCity({
      slug: "oyo-town",
      name: "Oyo Town",
      intro: "Oyo town carries historical weight near Ibadan — matches may commute between both.",
      nearby: ["ibadan", "ogbomoso", "ring-road"],
      highlights: ["Heritage pride", "Smaller-town pace", "Weekend visits"],
      meetHint: "Oyo town centre public venues",
      connectNote: "Say if you are Oyo-based vs Ibadan-commuting."
    }),
    buildCity({
      slug: "ogbomoso",
      name: "Ogbomoso",
      intro: "Ogbomoso's LAUTECH community adds student energy — academic calendars shape social life.",
      nearby: ["oyo-town", "ibadan", "challenge"],
      highlights: ["University town", "Faith and family influence", "Close-knit dating"],
      meetHint: "Ogbomoso main road restaurants",
      connectNote: "Respectful tone matters — many matches value family-aware conversation."
    })
  ],
  abia: [
    buildCity({
      slug: "aba",
      name: "Aba",
      type: "city",
      intro: "Aba's market hustle defines social energy — direct, warm signals fit the city's personality.",
      nearby: ["umuahia", "osisioma", "ohafia"],
      highlights: ["Commerce culture", "Fashion and trade pride", "Fast-paced chat"],
      meetHint: "Aba GRA or mall public spots",
      connectNote: "Mention Ariaria or GRA if relevant — locals appreciate specificity."
    }),
    buildCity({
      slug: "umuahia",
      name: "Umuahia",
      intro: "Umuahia's government town calm contrasts Aba's speed — many daters split time between both.",
      nearby: ["aba", "ohafia", "osisioma"],
      highlights: ["State capital pace", "Civil service crowd", "Quieter meetups"],
      meetHint: "Umuahia central restaurants",
      connectNote: "Capital matches often prefer planned weekday evenings."
    }),
    buildCity({
      slug: "osisioma",
      name: "Obingwa / Osisoma axis",
      intro: "Osisoma industrial belt links Aba suburbs — realistic pins help matches across Abia.",
      nearby: ["aba", "umuahia", "ohafia"],
      highlights: ["Industrial growth", "Commuter dating", "Young workforce"],
      meetHint: "Aba or Umuahia meetup points on shared routes",
      connectNote: "Suggest halfway venues when you are on opposite sides of Abia."
    }),
    buildCity({
      slug: "ohafia",
      name: "Ohafia",
      intro: "Ohafia heritage and hills attract proud locals — cultural respect in chat goes a long way.",
      nearby: ["aba", "umuahia", "arochukwu"],
      highlights: ["Strong identity", "Community introductions", "Weekend home trips"],
      meetHint: "Ohafia town public venues in daylight",
      connectNote: "Many Ohafia matches travel to Aba to meet — discuss transport early."
    }),
    buildCity({
      slug: "arochukwu",
      name: "Arochukwu",
      intro: "Arochukwu's history draws curious visitors — be honest if you are visiting vs based here.",
      nearby: ["ohafia", "aba", "umuahia"],
      highlights: ["Cultural tourism", "Tight community", "Scenic drives"],
      meetHint: "Arochukwu centre public spots",
      connectNote: "Road quality varies — flexible meetup timing helps."
    })
  ],
  "akwa-ibom": [
    buildCity({
      slug: "uyo",
      name: "Uyo",
      type: "city",
      intro: "Uyo's growing capital scene mixes civil service and nightlife — Ibom Plaza area meetups are familiar picks.",
      nearby: ["eket", "ikot-ekpene", "oron"],
      highlights: ["State capital energy", "Football and food culture", "Friendly open vibe"],
      meetHint: "Ibom Plaza or supermarket road cafés",
      connectNote: "Akwa Ibom daters often appreciate warm, food-led conversation openers."
    }),
    buildCity({
      slug: "eket",
      name: "Eket",
      intro: "Eket's oil community tempo differs from Uyo — shift workers may need flexible dating schedules.",
      nearby: ["uyo", "oron", "eastern-obolo"],
      highlights: ["Coastal industry town", "Port community", "Practical planners"],
      meetHint: "Eket town restaurants with public seating",
      connectNote: "Ask about offshore or shift schedules without prying — offer flexible times."
    }),
    buildCity({
      slug: "ikot-ekpene",
      name: "Ikot Ekpene",
      intro: "Ikot Ekpene market town links Akwa Ibom to Abia — cross-border matches happen often.",
      nearby: ["uyo", "aba", "eket"],
      highlights: ["Market hub", "Raffia city pride", "Interstate commuters"],
      meetHint: "Ikot Ekpene main road eateries",
      connectNote: "Mention if you commute toward Uyo or Aba regularly."
    }),
    buildCity({
      slug: "oron",
      name: "Oron",
      intro: "Oron waterfront culture is distinct — ferry and road logistics matter for PH or Calabar links.",
      nearby: ["uyo", "eket", "ikot-ekpene"],
      highlights: ["Waterfront town", "Fish market life", "Weekend travellers"],
      meetHint: "Oron public venues in daylight",
      connectNote: "Coastal weather can shift plans — communicate early if rain threatens."
    }),
    buildCity({
      slug: "eastern-obolo",
      name: "Eastern Obolo",
      intro: "Eastern Obolo coastal communities are quieter — matches may prefer unhurried chat before meeting.",
      nearby: ["eket", "uyo", "oron"],
      highlights: ["Coastal calm", "Community ties", "Patient dating pace"],
      meetHint: "Eket or Uyo meetup if coastal venues are limited",
      connectNote: "Offer to meet halfway when coastal transport is limited."
    })
  ],
  "cross-river": [
    buildCity({
      slug: "calabar",
      name: "Calabar",
      type: "city",
      intro: "Calabar hospitality is real — tourism, carnival season, and food culture give easy conversation hooks.",
      nearby: ["calabar-municipality", "calabar-south", "ikom"],
      highlights: ["Tourism city", "Carnival season buzz", "Seafood dates"],
      meetHint: "Marian Road or Tinapa-area public restaurants",
      connectNote: "Carnival weeks get busy — book meetup spots or choose quieter hours."
    }),
    buildCity({
      slug: "calabar-municipality",
      name: "Calabar Municipality",
      intro: "Municipality covers central Calabar government and business — many profiles simply say Calabar; narrow your area.",
      nearby: ["calabar", "calabar-south", "ikom"],
      highlights: ["Administrative centre", "Professional crowd", "Urban core"],
      meetHint: "Central Calabar cafés you trust",
      connectNote: "Clarify Municipality vs Watt Market axis when suggesting venues."
    }),
    buildCity({
      slug: "calabar-south",
      name: "Calabar South",
      intro: "Calabar South toward the port has its own rhythm — share landmarks matches will recognise.",
      nearby: ["calabar", "calabar-municipality", "ikom"],
      highlights: ["Port proximity", "Working-class energy", "Authentic local life"],
      meetHint: "Calabar South public eateries in daylight",
      connectNote: "Safety-first public venues matter — pick busy spots you know."
    }),
    buildCity({
      slug: "ikom",
      name: "Ikom",
      intro: "Ikom yam belt and border trade bring travellers — weekday vs weekend availability can differ.",
      nearby: ["calabar", "obudu", "calabar-municipality"],
      highlights: ["Agricultural hub", "Benue border links", "Road-trip dating"],
      meetHint: "Ikom town centre restaurants",
      connectNote: "Long drives to Calabar city — confirm willingness before planning."
    }),
    buildCity({
      slug: "obudu",
      name: "Obudu",
      intro: "Obudu plateau attracts resort visitors and locals — altitude weather can surprise lowland guests.",
      nearby: ["ikom", "calabar", "calabar-municipality"],
      highlights: ["Mountain resort", "Cool climate", "Weekend getaway dates"],
      meetHint: "Obudu ranch or town public venues in daylight",
      connectNote: "Resort seasonality affects crowds — mention if you are local staff vs tourist."
    })
  ],
  anambra: [
    buildCity({
      slug: "awka",
      name: "Awka",
      type: "city",
      intro: "Awka capital life mixes politics, students, and traders — evening Amawbia-road meetups are common.",
      nearby: ["onitsha", "nnewi", "ekwulobia"],
      highlights: ["State capital", "UNIZIK energy", "Government quarter"],
      meetHint: "Awka GRA or mall-area cafés",
      connectNote: "Capital traffic spikes at closing time — plan meetups with buffer."
    }),
    buildCity({
      slug: "onitsha",
      name: "Onitsha",
      intro: "Onitsha market intensity is legendary — daters often meet across the Niger in Asaba or quiet Awka spots.",
      nearby: ["nnewi", "awka", "ihiala"],
      highlights: ["Commerce capital", "Bridge commuters", "High-energy personality"],
      meetHint: "GRA Onitsha or mall restaurants away from main market",
      connectNote: "Market-area meetups can overwhelm — choose calmer GRA venues."
    }),
    buildCity({
      slug: "nnewi",
      name: "Nnewi",
      intro: "Nnewi industrial wealth shows in confident profiles — respect and directness work well in signals.",
      nearby: ["onitsha", "awka", "ihiala"],
      highlights: ["Industrial hometown", "Entrepreneur culture", "Strong family values"],
      meetHint: "Nnewi plaza or hotel lobby restaurants",
      connectNote: "Family name and reputation matter — keep first chats respectful."
    }),
    buildCity({
      slug: "ekwulobia",
      name: "Ekwulobia",
      intro: "Ekwulobia market town anchors south Anambra — Agulu and Ihiala links make cross-LGA dating normal.",
      nearby: ["awka", "ihiala", "onitsha"],
      highlights: ["Market town hub", "Agricultural trade", "Community dating"],
      meetHint: "Ekwulobia central public spots",
      connectNote: "Halfway meetups toward Awka help when you are on different LGAs."
    }),
    buildCity({
      slug: "ihiala",
      name: "Ihiala",
      intro: "Ihiala border proximity to Imo and Abia means matches may span states — say which direction you commute.",
      nearby: ["onitsha", "nnewi", "ekwulobia"],
      highlights: ["Border trade", "Interstate social life", "Practical commuters"],
      meetHint: "Ihiala main road eateries",
      connectNote: "Imo matches from Owerri corridor are common — discuss distance honestly."
    })
  ],
  imo: [
    buildCity({
      slug: "owerri",
      name: "Owerri",
      type: "city",
      intro: "Owerri nightlife and wedding culture are famous — daytime café meetups suit first dates better for many.",
      nearby: ["orlu", "okigwe", "mbaise"],
      highlights: ["Entertainment city", "Young professional scene", "Weekend social peak"],
      meetHint: "Douglas Road mall areas or Owerri GRA cafés",
      connectNote: "Reference Douglas, Ikenegbu, or New Owerri in chat for clarity."
    }),
    buildCity({
      slug: "orlu",
      name: "Orlu",
      intro: "Orlu's quieter pace suits people who prefer slower dating — family introductions still matter here.",
      nearby: ["owerri", "okigwe", "mbaise"],
      highlights: ["Hometown stability", "Community respect", "Less rushed chat"],
      meetHint: "Orlu town centre public restaurants",
      connectNote: "Signals that mention family values land better than flashy lines."
    }),
    buildCity({
      slug: "okigwe",
      name: "Okigwe",
      intro: "Okigwe corridor links Imo to Abia — truck-stop energy and traders shape the social mix.",
      nearby: ["owerri", "orlu", "umuahia"],
      highlights: ["Transport corridor", "Cross-state commuters", "Straightforward dating"],
      meetHint: "Okigwe junction eateries",
      connectNote: "Umuahia matches are plausible — discuss halfway meetups."
    }),
    buildCity({
      slug: "mbaise",
      name: "Mbaise",
      intro: "Mbaise cultural pride runs deep — respectful curiosity about heritage beats generic openers.",
      nearby: ["owerri", "orlu", "okigwe"],
      highlights: ["Strong identity", "Diaspora returnees", "Family-linked introductions"],
      meetHint: "Owerri meetups if hometown venues are limited",
      connectNote: "Many Mbaise professionals work in Owerri — clarify where you spend weekdays."
    })
  ],
  edo: [
    buildCity({
      slug: "benin",
      name: "Benin City",
      type: "city",
      intro: "Benin City's royal heritage and university crowd mix tradition with modern app dating — be culturally aware.",
      nearby: ["auchi", "ekpoma", "uromi"],
      highlights: ["Benin Kingdom culture", "UNIBEN students", "GRA social scene"],
      meetHint: "Sapele Road mall areas or GRA restaurants",
      connectNote: "Cultural respect in first messages matters — avoid clichés about royalty."
    }),
    buildCity({
      slug: "auchi",
      name: "Auchi",
      intro: "Auchi polytechnic energy keeps the town young — semester breaks change who is around.",
      nearby: ["benin", "ekpoma", "uromi"],
      highlights: ["Polytechnic town", "Student dating", "Affordable meetups"],
      meetHint: "Auchi main campus-road cafés",
      connectNote: "Ask about school schedule if they mention Auchi Poly."
    }),
    buildCity({
      slug: "ekpoma",
      name: "Ekpoma",
      intro: "Ekpoma's Ambrose Alli University shapes rhythms — campus events can make weekends busy.",
      nearby: ["benin", "auchi", "uromi"],
      highlights: ["University town", "Middle Belt Edo", "Road to Benin"],
      meetHint: "Ekpoma town public restaurants",
      connectNote: "Benin city meetups work for matches who commute for school."
    }),
    buildCity({
      slug: "uromi",
      name: "Uromi",
      intro: "Uromi hometown politics and community are tight — many daters connect via Owerri or Benin links.",
      nearby: ["benin", "ekpoma", "auchi"],
      highlights: ["Community leadership culture", "Hometown pride", "Inter-city commuting"],
      meetHint: "Uromi centre or Benin halfway venues",
      connectNote: "Offer Benin meetups when both commute for work."
    })
  ],
  delta: [
    buildCity({
      slug: "asaba",
      name: "Asaba",
      type: "city",
      intro: "Asaba capital life overlooks the Niger — Onitsha bridge traffic defines many cross-river dates.",
      nearby: ["warri", "ughelli", "sapele"],
      highlights: ["State capital", "Bridge commuters", "Government crowd"],
      meetHint: "Asaba mall or Okpanam Road restaurants",
      connectNote: "Onitsha matches across the bridge are common — plan crossing time."
    }),
    buildCity({
      slug: "warri",
      name: "Warri",
      intro: "Warri personality is bold and humorous — signals with warmth and wit match the city.",
      nearby: ["sapele", "ughelli", "asaba"],
      highlights: ["Oil city culture", "Waffi pride", "Active nightlife"],
      meetHint: "Effurun or Warri GRA public spots",
      connectNote: "Effurun vs Warri city pins matter — specify which side you mean."
    }),
    buildCity({
      slug: "ughelli",
      name: "Ughelli",
      intro: "Ughelli central Delta position links Warri and Benin routes — market town openness helps new matches.",
      nearby: ["warri", "sapele", "asaba"],
      highlights: ["Central Delta", "Market culture", "Commuter hub"],
      meetHint: "Ughelli main road eateries",
      connectNote: "Warri matches often meet halfway at Ughelli when traffic allows."
    }),
    buildCity({
      slug: "sapele",
      name: "Sapele",
      intro: "Sapele river town history and port life create a distinct vibe from Warri — do not lump them together.",
      nearby: ["warri", "ughelli", "asaba"],
      highlights: ["River port heritage", "Older residential charm", "Weekend travellers"],
      meetHint: "Sapele town public restaurants",
      connectNote: "Clarify Sapele vs Abraka axis if their profile mentions school."
    })
  ],
  kano: [
    buildCity({
      slug: "kano",
      name: "Kano",
      type: "city",
      intro: "Kano's ancient city and modern suburbs coexist — respect cultural norms in photos, chat, and meetup choices.",
      nearby: ["nasarawa-kano", "tarauni", "wudil"],
      highlights: ["Northern commercial capital", "Strong tradition", "Large young population"],
      meetHint: "public family-friendly restaurants in Nasarawa GRA or safe mall areas",
      connectNote: "Politeness and clarity matter — avoid pressure and dress respectfully for meetups."
    }),
    buildCity({
      slug: "wudil",
      name: "Wudil",
      intro: "Wudil's Bayero University axis adds student flow — semester timing affects availability.",
      nearby: ["kano", "nasarawa-kano", "gware"],
      highlights: ["University corridor", "Student dating", "Kano southern gateway"],
      meetHint: "Wudil campus-road public venues",
      connectNote: "Many students list Kano city — confirm if they are Wudil-based."
    }),
    buildCity({
      slug: "gware",
      name: "Gware",
      intro: "Gware expanding fringe suits people seeking quieter Kano suburbs — pins help across long distances.",
      nearby: ["kano", "nasarawa-kano", "tarauni"],
      highlights: ["Suburban growth", "Young families", "Mall-linked meetups"],
      meetHint: "Nearby Kano mall meetup points",
      connectNote: "Suggest central Kano venues if suburban spots are unfamiliar."
    }),
    buildCity({
      slug: "nasarawa-kano",
      name: "Nasarawa (Kano)",
      intro: "Nasarawa Kano LGA is not Nasarawa State — clarify in chat to avoid confusion with matches elsewhere.",
      nearby: ["kano", "tarauni", "gware"],
      highlights: ["Dense urban LGA", "GRA pockets", "Central Kano life"],
      meetHint: "Nasarawa GRA public restaurants",
      connectNote: "Name the LGA when discussing Nasarawa to avoid state mix-ups."
    }),
    buildCity({
      slug: "tarauni",
      name: "Tarauni",
      intro: "Tarauni's busy markets and residential sprawl need clear landmarks for first meetups.",
      nearby: ["kano", "nasarawa-kano", "gware"],
      highlights: ["Market energy", "Working-class heart", "Authentic Kano"],
      meetHint: "busy public eateries in Tarauni you know well",
      connectNote: "Pick venues you trust — busy does not mean uncomfortable."
    })
  ],
  kaduna: [
    buildCity({
      slug: "kaduna",
      name: "Kaduna",
      type: "city",
      intro: "Kaduna city blends military, academic, and creative communities — check comfort levels for evening meetups.",
      nearby: ["zaria", "kafanchan", "sabon-gari"],
      highlights: ["Northern creative hub", "Institution mix", "Cautious but social daters"],
      meetHint: "Barnawa or Malali public restaurants in daylight or early evening",
      connectNote: "Share plans with a friend and choose venues you both know — comfort first."
    }),
    buildCity({
      slug: "zaria",
      name: "Zaria",
      intro: "Zaria's ABU and military institutions define dating rhythms — academic calendars matter.",
      nearby: ["kaduna", "kafanchan", "sabon-gari"],
      highlights: ["University town", "Institutional crowd", "Student-friendly dates"],
      meetHint: "Samaru or Zaria city public cafés",
      connectNote: "ABU semester breaks change who is in town — ask gently."
    }),
    buildCity({
      slug: "kafanchan",
      name: "Kafanchan",
      intro: "Kafanchan southern Kaduna gateway links plateau edges — community ties run deep.",
      nearby: ["kaduna", "zaria", "jos"],
      highlights: ["Southern Kaduna hub", "Mining heritage", "Community-aware dating"],
      meetHint: "Kafanchan town centre public spots",
      connectNote: "Respect local sensitivities — keep first chats courteous."
    }),
    buildCity({
      slug: "sabon-gari",
      name: "Sabon Gari (Kaduna)",
      intro: "Sabon Gari's diverse community brings varied dating styles — public venues and courtesy go far.",
      nearby: ["kaduna", "zaria", "kafanchan"],
      highlights: ["Mixed community", "Market social life", "Central Kaduna access"],
      meetHint: "Sabon Gari public restaurants you trust",
      connectNote: "Choose well-known busy spots for first meetings."
    })
  ],
  plateau: [
    buildCity({
      slug: "jos",
      name: "Jos",
      type: "city",
      intro: "Jos cool climate and scenery invite outdoor-minded daters — Rayfield and Bukuru links span the city.",
      nearby: ["bukuru", "pankshin", "kafanchan"],
      highlights: ["Plateau weather", "Tourism and mines", "Mixed faith community"],
      meetHint: "Rayfield or Jos central cafés",
      connectNote: "Evenings can get cool — suggest venues with comfortable seating."
    }),
    buildCity({
      slug: "bukuru",
      name: "Bukuru",
      intro: "Bukuru mining heritage town sits below Jos plateau — many commute uphill for work and dates.",
      nearby: ["jos", "pankshin", "kafanchan"],
      highlights: ["Mining community", "Jos commuter belt", "Practical dating"],
      meetHint: "Jos city meetups or Bukuru public spots",
      connectNote: "Offer Jos venues if Bukuru options are limited."
    }),
    buildCity({
      slug: "pankshin",
      name: "Pankshin",
      intro: "Pankshin rural plateau life is community-first — matches may prefer patient chat before meeting.",
      nearby: ["jos", "bukuru", "kafanchan"],
      highlights: ["Agricultural centre", "Tight networks", "Slow-trust dating"],
      meetHint: "Pankshin town market-area restaurants in daylight",
      connectNote: "Halfway Jos meetups work when transport is easier."
    })
  ],
  ogun: [
    buildCity({
      slug: "abeokuta",
      name: "Abeokuta",
      type: "city",
      intro: "Abeokuta rock city pride and Lagos commuters mix — many profiles list both cities.",
      nearby: ["sagamu", "ota", "ijebu-ode"],
      highlights: ["State capital", "Lagos commuter belt", "OGUN cultural roots"],
      meetHint: "Abeokuta mall or Panseke-area cafés",
      connectNote: "Clarify if you commute to Lagos — it shapes weekend availability."
    }),
    buildCity({
      slug: "sagamu",
      name: "Sagamu",
      intro: "Sagamu intercepts Lagos-Ibadan traffic — convenient halfway meetups for cross-state matches.",
      nearby: ["abeokuta", "ijebu-ode", "ota"],
      highlights: ["Transport hub", "Interstate dating", "Market town energy"],
      meetHint: "Sagamu toll-area restaurants or plazas",
      connectNote: "Popular halfway point for Lagos and Ibadan matches."
    }),
    buildCity({
      slug: "ota",
      name: "Ota",
      intro: "Ota and Sango border Lagos — dating often spans Lagos and Ogun profiles on the same corridor.",
      nearby: ["abeokuta", "sagamu", "ijebu-ode"],
      highlights: ["Lagos border", "Factory and student mix", "Affordable meetups"],
      meetHint: "Sango Ota mall public spots",
      connectNote: "List Ota accurately — many use Lagos tags while living here."
    }),
    buildCity({
      slug: "ijebu-ode",
      name: "Ijebu Ode",
      intro: "Ijebu Ode traditional institutions influence dating — courtesy and family awareness help.",
      nearby: ["sagamu", "abeokuta", "ota"],
      highlights: ["Awujale heritage", "Ijebu identity", "Community respect"],
      meetHint: "Ijebu Ode central public restaurants",
      connectNote: "Avoid stereotypes — show genuine interest in their background."
    })
  ],
  ondo: [
    buildCity({
      slug: "akure",
      name: "Akure",
      type: "city",
      intro: "Akure capital calm suits unhurried dating — FUTA students and civil servants share the city.",
      nearby: ["owo", "ondo-town", "ore"],
      highlights: ["State capital", "University town", "Smaller-city feel"],
      meetHint: "Akure mall or Oba-Ile road cafés",
      connectNote: "Capital matches appreciate specific neighbourhood mentions."
    }),
    buildCity({
      slug: "owo",
      name: "Owo",
      intro: "Owo kingdom heritage and polytechnic life blend — respectful tone in signals matters.",
      nearby: ["akure", "ondo-town", "ore"],
      highlights: ["Traditional stool", "Student population", "Hometown pride"],
      meetHint: "Owo town public eateries",
      connectNote: "Akure meetups help when both work in the capital."
    }),
    buildCity({
      slug: "ondo-town",
      name: "Ondo Town",
      intro: "Ondo town is distinct from Ondo State capital Akure — clarify which you mean on your profile.",
      nearby: ["akure", "owo", "ore"],
      highlights: ["Historic town", "Agricultural belt", "Close community"],
      meetHint: "Ondo town centre restaurants",
      connectNote: "Do not confuse Ondo town with Akure — pins prevent awkward mix-ups."
    }),
    buildCity({
      slug: "ore",
      name: "Ore",
      intro: "Ore junction is Nigeria's famous stopover — travellers and traders create a transient social mix.",
      nearby: ["akure", "ondo-town", "owo"],
      highlights: ["Junction town", "Interstate traffic", "Brief meetup culture"],
      meetHint: "Ore expressway public restaurants",
      connectNote: "Matches may be passing through — confirm they are local before planning."
    })
  ],
  osun: [
    buildCity({
      slug: "osogbo",
      name: "Osogbo",
      type: "city",
      intro: "Osogbo arts and state capital life attract creatives — mention culture if it fits your profile.",
      nearby: ["ile-ife", "ilesa", "ede"],
      highlights: ["UNESCO heritage nearby", "State capital", "Creative scene"],
      meetHint: "Osogbo mall or station road cafés",
      connectNote: "Osun grove culture can be a thoughtful signal topic — keep it respectful."
    }),
    buildCity({
      slug: "ile-ife",
      name: "Ile-Ife",
      intro: "Ife's sacred city status and OAU students create unique dating etiquette — lead with respect.",
      nearby: ["osogbo", "ede", "ilesa"],
      highlights: ["OAU campus", "Yoruba heritage", "Student-heavy"],
      meetHint: "Ife campus-adjacent public cafés",
      connectNote: "Campus matches follow semester rhythms — ask about exams politely."
    }),
    buildCity({
      slug: "ilesa",
      name: "Ilesa",
      intro: "Ilesa mining history and Osun east life differ from Osogbo — hometown pride shows in profiles.",
      nearby: ["osogbo", "ile-ife", "ede"],
      highlights: ["Gold city heritage", "Eastern Osun", "Community dating"],
      meetHint: "Ilesa central public spots",
      connectNote: "Osogbo meetups work for capital commuters."
    }),
    buildCity({
      slug: "ede",
      name: "Ede",
      intro: "Ede's Islamic and traditional balance shapes social norms — modest respectful chat is appreciated.",
      nearby: ["osogbo", "ile-ife", "ilesa"],
      highlights: ["Historical town", "Faith-conscious community", "Osun west"],
      meetHint: "Ede or Osogbo public family venues",
      connectNote: "Choose meetup spots that respect local norms."
    })
  ],
  kwara: [
    buildCity({
      slug: "ilorin",
      name: "Ilorin",
      type: "city",
      intro: "Ilorin blends north and south influences — courtesy, faith, and family expectations vary by match.",
      nearby: ["offa", "oke-ero", "osogbo"],
      highlights: ["University of Ilorin", "Mixed culture", "Calm dating pace"],
      meetHint: "Tanke or GRA Ilorin public restaurants",
      connectNote: "Respect religious boundaries in chat and meetup choices."
    }),
    buildCity({
      slug: "offa",
      name: "Offa",
      intro: "Offa market town energy is welcoming — many Ilorin professionals have Offa roots.",
      nearby: ["ilorin", "oke-ero", "osogbo"],
      highlights: ["Market heritage", "Ilorin commuter", "Community pride"],
      meetHint: "Offa town centre eateries",
      connectNote: "Ilorin city meetups suit weekday workers based in the capital."
    }),
    buildCity({
      slug: "oke-ero",
      name: "Oke-Ero",
      intro: "Oke-Ero's rural Kwara character favours patient dating — family awareness matters.",
      nearby: ["ilorin", "offa", "osogbo"],
      highlights: ["Rural LGA", "Agricultural life", "Introduction culture"],
      meetHint: "Ilorin meetups when local venues are limited",
      connectNote: "Offer to meet in Ilorin if transport is easier for both."
    })
  ],
  benue: [
    buildCity({
      slug: "makurdi",
      name: "Makurdi",
      type: "city",
      intro: "Makurdi Benue River capital mixes civil service and BSU students — relaxed café dates work well.",
      nearby: ["gboko", "otukpo", "jos"],
      highlights: ["Middle Belt capital", "University crowd", "Food culture"],
      meetHint: "Makurdi Wurukum or High Level public spots",
      connectNote: "Middle Belt matches value straightforward honest signals."
    }),
    buildCity({
      slug: "gboko",
      name: "Gboko",
      intro: "Gboko Tiv heartland pride is strong — cultural sensitivity beats generic pickup lines.",
      nearby: ["makurdi", "otukpo", "jos"],
      highlights: ["Tiv homeland", "Yam culture", "Hometown networks"],
      meetHint: "Gboko town public restaurants",
      connectNote: "Many Gboko indigenes work in Makurdi — clarify weekday base."
    }),
    buildCity({
      slug: "otukpo",
      name: "Otukpo",
      intro: "Otukpo IDOMa identity and entertainment scene create confident profiles — humour welcome, disrespect not.",
      nearby: ["makurdi", "gboko", "jos"],
      highlights: ["Idoma nation", "Social nightlife", "Proud locals"],
      meetHint: "Otukpo main road eateries",
      connectNote: "Reference Idoma culture thoughtfully if it appears on their profile."
    })
  ],
  bayelsa: [
    buildCity({
      slug: "yenagoa",
      name: "Yenagoa",
      type: "city",
      intro: "Yenagoa state capital grew quickly — mall and waterfront areas anchor many first dates.",
      nearby: ["brass", "nembe", "port-harcourt"],
      highlights: ["State capital", "Government workers", "Creekside life"],
      meetHint: "Yenagoa mall or Ekeki public restaurants",
      connectNote: "Riverine logistics affect plans — communicate if boat travel is involved."
    }),
    buildCity({
      slug: "brass",
      name: "Brass",
      intro: "Brass island oil and fishing communities are tight — matches may prefer slow trust-building.",
      nearby: ["yenagoa", "nembe", "port-harcourt"],
      highlights: ["Island community", "Oil sector", "Water transport"],
      meetHint: "Brass public venues in daylight or Yenagoa meetups",
      connectNote: "Offer Yenagoa halfway when island access is hard."
    }),
    buildCity({
      slug: "nembe",
      name: "Nembe",
      intro: "Nembe kingdom heritage runs deep in Bayelsa east — respectful curiosity opens better chats.",
      nearby: ["yenagoa", "brass", "port-harcourt"],
      highlights: ["Historical kingdom", "Riverine culture", "Community ties"],
      meetHint: "Nembe town or Yenagoa public meetup points",
      connectNote: "Creek travel times vary — confirm schedules before meeting."
    })
  ],
  kogi: [
    buildCity({
      slug: "lokoja",
      name: "Lokoja",
      type: "city",
      intro: "Lokoja confluence town links north and south — interstate matches often meet here halfway.",
      nearby: ["okene", "idah", "abuja"],
      highlights: ["Confluence city", "Halfway meetups", "Civil service hub"],
      meetHint: "Lokoja mall or beach-road restaurants",
      connectNote: "Classic halfway city for Abuja and southern matches."
    }),
    buildCity({
      slug: "okene",
      name: "Okene",
      intro: "Okene Ebira hills and mining culture shape confident local identity — respect goes far.",
      nearby: ["lokoja", "idah", "abuja"],
      highlights: ["Ebira heartland", "Hill city", "Strong tradition"],
      meetHint: "Okene central public eateries",
      connectNote: "Lokoja meetups help when matches commute on A1."
    }),
    buildCity({
      slug: "idah",
      name: "Idah",
      intro: "Idah Igala kingdom seat carries royal heritage — avoid flippant references in first messages.",
      nearby: ["lokoja", "okene", "makurdi"],
      highlights: ["Igala culture", "Benue border", "River trade"],
      meetHint: "Idah town public spots",
      connectNote: "Makurdi and Lokoja links are common — discuss distance."
    })
  ],
  niger: [
    buildCity({
      slug: "minna",
      name: "Minna",
      type: "city",
      intro: "Minna capital and FUTMinna students mix mining-town pragmatism with calm dating.",
      nearby: ["suleja", "bida", "abuja"],
      highlights: ["State capital", "University town", "Abuja corridor"],
      meetHint: "Minna Bosso or GRA public cafés",
      connectNote: "Abuja commuters are common — clarify weekend vs weekday base."
    }),
    buildCity({
      slug: "suleja",
      name: "Suleja",
      intro: "Suleja Abuja spillover grows fast — many list Abuja while living here.",
      nearby: ["minna", "bida", "abuja"],
      highlights: ["Abuja commuter", "Market town", "Affordable dating"],
      meetHint: "Suleja or Abuja border mall meetups",
      connectNote: "Set location accurately — Suleja is not Abuja city proper."
    }),
    buildCity({
      slug: "bida",
      name: "Bida",
      intro: "Bida Nupe craft heritage and polytechnic students create a proud local scene.",
      nearby: ["minna", "suleja", "abuja"],
      highlights: ["Nupe kingdom", "Brass work fame", "Student dating"],
      meetHint: "Bida town centre restaurants",
      connectNote: "Minna city meetups suit professionals who relocated."
    })
  ]
};
