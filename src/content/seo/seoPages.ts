export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoFAQ = {
  question: string;
  answer: string;
};

export type SeoSchemaType = "Article" | "FAQPage" | "WebPage" | "Place";

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFAQ[];
  category: string;
  lastUpdated: string;
  canonicalPath: string;
  keywords: string[];
  schemaType: SeoSchemaType;
  city?: string;
  state?: string;
};

export type SeoHubId =
  | "cities"
  | "help"
  | "safety"
  | "features"
  | "premium"
  | "faq"
  | "guides"
  | "compare";

export type SeoHubConfig = {
  id: SeoHubId;
  basePath: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  category: string;
  lastUpdated: string;
  keywords: string[];
};

export const SEO_HUBS: Record<SeoHubId, SeoHubConfig> = {
  cities: {
    id: "cities",
    basePath: "/cities",
    title: "Dating in Nigerian cities | BamSignal",
    description:
      "City guides for meeting people in Lagos, Abuja, Port Harcourt, and across Nigeria — practical tips for real conversations.",
    h1: "Meet people in your city",
    intro:
      "Every Nigerian city has its own rhythm. These guides help you show up with confidence — whether you are new in town or ready to meet someone who fits your vibe.",
    category: "Cities",
    lastUpdated: "2026-06-19",
    keywords: ["dating in Nigeria", "Lagos dating", "Abuja dating", "Nigerian cities"]
  },
  help: {
    id: "help",
    basePath: "/help",
    title: "Help centre | BamSignal",
    description:
      "Step-by-step help for profiles, signals, chats, and account settings on BamSignal.",
    h1: "How can we help?",
    intro:
      "Clear answers for getting started, building your profile, and making the most of BamSignal — no jargon, just practical guidance.",
    category: "Help",
    lastUpdated: "2026-06-19",
    keywords: ["BamSignal help", "dating app help Nigeria", "profile tips"]
  },
  safety: {
    id: "safety",
    basePath: "/safety",
    title: "Safety centre | BamSignal",
    description:
      "Practical safety tips for online dating and meeting in person — built for Nigerian daters.",
    h1: "Date with confidence",
    intro:
      "Your comfort matters. Learn how to stay in control, meet thoughtfully, and use BamSignal's safety tools when something does not feel right.",
    category: "Safety",
    lastUpdated: "2026-06-19",
    keywords: ["dating safety Nigeria", "meet safely", "online dating safety"]
  },
  features: {
    id: "features",
    basePath: "/features",
    title: "Features | BamSignal",
    description:
      "Discover how signals, discovery, chats, and verification work on BamSignal.",
    h1: "Built for better conversations",
    intro:
      "Good conversations often begin with a signal. Explore the features that help you connect at your own pace.",
    category: "Features",
    lastUpdated: "2026-06-19",
    keywords: ["BamSignal features", "dating signals", "Nigeria dating app"]
  },
  premium: {
    id: "premium",
    basePath: "/premium",
    title: "Premium | BamSignal",
    description:
      "Learn about Signal Pass and premium tools that help you connect with more clarity.",
    h1: "More room to connect",
    intro:
      "Premium is optional — the core BamSignal experience stays free. When you are ready, Signal Pass adds tools that make discovery and conversation easier.",
    category: "Premium",
    lastUpdated: "2026-06-19",
    keywords: ["BamSignal premium", "Signal Pass", "dating app subscription Nigeria"]
  },
  faq: {
    id: "faq",
    basePath: "/faq",
    title: "Frequently asked questions | BamSignal",
    description:
      "Quick answers about BamSignal — accounts, signals, privacy, and how the app works in Nigeria.",
    h1: "Questions, answered",
    intro:
      "The most common questions from new and returning members — answered plainly.",
    category: "FAQ",
    lastUpdated: "2026-06-19",
    keywords: ["BamSignal FAQ", "dating app questions Nigeria"]
  },
  guides: {
    id: "guides",
    basePath: "/guides",
    title: "Dating guides | BamSignal",
    description:
      "Practical guides for starting conversations, planning dates, and building connections in Nigeria.",
    h1: "Guides for real connections",
    intro:
      "Warm, practical advice for people who want meaningful conversations — not pickup lines or pressure.",
    category: "Guides",
    lastUpdated: "2026-06-19",
    keywords: ["dating guides Nigeria", "conversation starters", "first date tips"]
  },
  compare: {
    id: "compare",
    basePath: "/compare",
    title: "Compare dating apps | BamSignal",
    description:
      "Honest comparisons between BamSignal and other dating apps — what fits Nigerian daters.",
    h1: "How BamSignal compares",
    intro:
      "Choosing a dating app is personal. These comparisons explain what BamSignal offers — without exaggerated claims.",
    category: "Compare",
    lastUpdated: "2026-06-19",
    keywords: ["BamSignal vs Tinder", "best dating app Nigeria", "dating app comparison"]
  }
};

export const SEO_HUB_LIST = Object.values(SEO_HUBS);
