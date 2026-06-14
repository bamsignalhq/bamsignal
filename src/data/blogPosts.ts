import { SITE_URL } from "../constants/seo";
import { MOMENT_SETS } from "../constants/showcase";
import { CITY_SEO_META, cityPostSlug } from "./blog/cities";

export type BlogInlineImage = {
  src: string;
  alt: string;
  caption: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  image?: BlogInlineImage;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  city?: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  heroImage: string;
  heroAlt: string;
  sections: BlogSection[];
};

const PUBLISHED = "2026-06-01";
const UPDATED = "2026-06-14";

function buildCityPost(meta: (typeof CITY_SEO_META)[number]): BlogPost {
  const slug = cityPostSlug(meta.slug);
  const title = `How to Find Love in ${meta.name} in 2026 (Verified & Nearby)`;
  const description = `Looking for love in ${meta.name}? BamSignal helps ${meta.state} singles meet verified people nearby — real photos, safer chats, and signals that feel intentional.`;
  const signup = `${SITE_URL}/love/sign`;
  const blog = `${SITE_URL}/blog/${slug}`;

  return {
    slug,
    title,
    description,
    keywords: [
      ...meta.searchTerms,
      "Nigerian dating app",
      "verified dating Nigeria",
      "BamSignal",
      `${meta.name} relationship`
    ],
    city: meta.name,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    readMinutes: 8,
    heroImage: meta.heroImage,
    heroAlt: `Singles finding love in ${meta.name}, Nigeria`,
    sections: [
      {
        heading: `Why ${meta.name} singles are searching differently in 2026`,
        paragraphs: [
          `${meta.name} dating culture is shaped by ${meta.vibe}. Whether you are new to the city or tired of random DMs, the goal is the same: meet someone real, nearby, and aligned with your intent.`,
          `Search interest for "${meta.searchTerms[0]}" keeps rising because people want visibility without chaos — curated discovery, verified profiles, and conversations that start with respect.`,
          `That is exactly why BamSignal built city-aware discovery for Nigeria — so your next connection can start with a signal, not a screenshot forwarded in three group chats.`
        ],
        image: {
          src: meta.gallery[0],
          alt: `${meta.name} lifestyle connection`,
          caption: `Real ${meta.name} vibes — the kind of moments BamSignal is built around.`
        }
      },
      {
        heading: `Where connections actually happen in ${meta.name}`,
        paragraphs: [
          `Hotspots like ${meta.hotspots} are where social life concentrates — but showing up physically is only half the story. The other half is finding someone who matches your pace before you waste a Friday night on mismatched energy.`,
          `BamSignal lets you discover people near your area, filter by intent (friendship, dating, relationship), and see why a profile might fit — shared values, lifestyle, and city.`,
          `When a profile feels right, send a signal. If it is mutual, chat opens inside BamSignal with safety guardrails — no pressure to drop your number on day one.`
        ],
        image: {
          src: meta.gallery[1],
          alt: `Social life in ${meta.name}`,
          caption: `${meta.name} is social — your dating life should feel just as alive.`
        }
      },
      {
        heading: "Verified profiles beat random accounts every time",
        paragraphs: [
          `Fake profiles and catfish stories are why Nigerian singles ask for verification before they invest emotion. BamSignal prioritises phone-verified members and optional selfie verification so you know there is a real person behind the photo.`,
          `Look for active status cues — "Active now" and human-readable last-active labels — so you are signaling people who are actually online, not abandoned accounts from 2023.`,
          `Premium members can also prioritise "Online Now" discovery — useful in busy cities where response time matters.`
        ],
        image: {
          src: meta.gallery[2],
          alt: `Verified dating in ${meta.name}`,
          caption: "Visual, verified, intentional — dating should feel this clear."
        }
      },
      {
        heading: `A simple ${meta.name} dating playbook that works`,
        paragraphs: [
          `1. Build a complete profile with clear photos and honest intent. Profiles with photos get far more signals.`,
          `2. Use discovery filters that match your non-negotiables — city, age range, values, lifestyle.`,
          `3. Send thoughtful signals to people with strong compatibility reasons, not mass spam.`,
          `4. Keep early chats inside BamSignal until trust is established. Meet in public when you are ready.`,
          `5. Use block and report tools the moment something feels off. Your comfort comes first.`
        ]
      },
      {
        heading: `Start meeting ${meta.name} singles on BamSignal`,
        paragraphs: [
          `If you have been googling "${meta.searchTerms[1]}" or "${meta.searchTerms[2]}", skip the endless scroll and start with a platform designed for Nigeria.`,
          `Create your free profile at ${signup} — it takes minutes. Browse nearby signals, send your first signal this week, and let momentum build naturally.`,
          `This guide lives at ${blog}. Share it with friends in ${meta.name} who are serious about finding love without the noise.`
        ],
        image: {
          src: MOMENT_SETS.lagosRooftop[2],
          alt: "Join BamSignal Nigeria",
          caption: "Your next connection starts with a signal — join free on BamSignal."
        }
      }
    ]
  };
}

const PILLAR_POSTS: BlogPost[] = [
  {
    slug: "best-dating-apps-nigeria-2026",
    title: "Best Dating Apps in Nigeria in 2026 (Verified & Nigeria-First)",
    description:
      "Compare how Nigerian singles find love in 2026 — why city-aware, verified platforms like BamSignal beat generic global apps for Lagos, Abuja, PH, and beyond.",
    keywords: [
      "best dating apps Nigeria",
      "Nigerian dating app 2026",
      "verified dating Nigeria",
      "dating apps Lagos Abuja"
    ],
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    readMinutes: 10,
    heroImage: MOMENT_SETS.lagosRooftop[0],
    heroAlt: "Best dating apps in Nigeria 2026",
    sections: [
      {
        heading: "What Nigerian singles actually want from a dating app",
        paragraphs: [
          "Global apps were not built for Nigerian cities, time zones, or culture. You need verified profiles, sane chat safety, local discovery, and pricing that respects Naira reality.",
          "BamSignal is Nigeria-first: signals instead of mindless swipes, compatibility reasons on profiles, and city-aware discovery from Lagos to Maiduguri."
        ],
        image: {
          src: MOMENT_SETS.suyaChill[0],
          alt: "Nigerian dating culture",
          caption: "Dating in Nigeria is visual, social, and intent-driven."
        }
      },
      {
        heading: "Why verification and safety are non-negotiable",
        paragraphs: [
          "Phone verification, optional selfie checks, in-chat contact blocking, and report tools should be default — not premium upsells.",
          "BamSignal ships these guardrails on day one because trust is the product."
        ],
        image: {
          src: MOMENT_SETS.movieDate[0],
          alt: "Safe dating Nigeria",
          caption: "Safer chats, verified profiles, real connections."
        }
      },
      {
        heading: "Start free on BamSignal",
        paragraphs: [
          `Create your profile at ${SITE_URL}/love/sign and explore city guides for every major Nigerian city on ${SITE_URL}/blog.`
        ]
      }
    ]
  },
  {
    slug: "find-real-love-nigeria-guide",
    title: "How to Find Real Love in Nigeria (2026 Guide)",
    description:
      "A practical Nigeria-wide guide to finding genuine love — intent, verification, city discovery, and how BamSignal helps you meet the right person nearby.",
    keywords: ["find love Nigeria", "real love Nigeria", "Nigerian singles", "relationship Nigeria 2026"],
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    readMinutes: 9,
    heroImage: MOMENT_SETS.sundayHangout[0],
    heroAlt: "Find real love in Nigeria",
    sections: [
      {
        heading: "Clarity beats chaos",
        paragraphs: [
          "Know your intent before you download any app. Friendship, dating, and relationship goals attract different people — state yours honestly.",
          "BamSignal surfaces compatibility reasons so you can signal with context, not just a photo."
        ],
        image: {
          src: MOMENT_SETS.beachDay[1],
          alt: "Real love Nigeria",
          caption: "Real connections look like real life — beach days, hangouts, cinema nights."
        }
      },
      {
        heading: "City-by-city discovery",
        paragraphs: [
          `We publish local guides for Lagos, Abuja, Port Harcourt, Enugu, and 18+ more cities at ${SITE_URL}/blog — each with local hotspots and search-friendly advice.`,
          "Pick your city guide, optimise your profile, then send five thoughtful signals this week."
        ]
      }
    ]
  },
  {
    slug: "verified-dating-nigeria-safety",
    title: "Verified Dating in Nigeria: Safety Checklist for 2026",
    description:
      "Stay safe while dating online in Nigeria — verification, public meetups, red flags, and how BamSignal protects members.",
    keywords: ["verified dating Nigeria", "safe online dating Nigeria", "dating safety Nigeria", "BamSignal safety"],
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    readMinutes: 7,
    heroImage: MOMENT_SETS.sundayHangout[2],
    heroAlt: "Verified safe dating Nigeria",
    sections: [
      {
        heading: "Verify before you invest emotion",
        paragraphs: [
          "Prioritise platforms with phone verification and visible trust badges. BamSignal adds optional selfie verification for extra confidence.",
          "If someone pushes you off-platform immediately, that is a red flag — keep early conversations inside BamSignal."
        ],
        image: {
          src: MOMENT_SETS.roadTrip[1],
          alt: "Safe dating checklist Nigeria",
          caption: "Meet in public, stay verified, trust your instincts."
        }
      },
      {
        heading: "Use built-in safety tools",
        paragraphs: [
          "Block, report, and discovery controls are not optional extras — they are how you stay in charge.",
          `Read our Safety centre at ${SITE_URL}/safety and join at ${SITE_URL}/love/sign when you are ready.`
        ]
      }
    ]
  },
  {
    slug: "what-is-bamsignal-nigeria-dating",
    title: "What Is BamSignal? Nigeria's Signal-First Dating Platform",
    description:
      "BamSignal helps verified Nigerian singles discover meaningful connections nearby — signals, compatibility, city discovery, and premium tools explained.",
    keywords: ["what is BamSignal", "BamSignal dating", "signal dating app Nigeria", "bamsignal.com"],
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    readMinutes: 6,
    heroImage: MOMENT_SETS.lagosRooftop[1],
    heroAlt: "What is BamSignal",
    sections: [
      {
        heading: "Signals, not mindless swipes",
        paragraphs: [
          "Instead of endless left-right swipes, BamSignal uses signals — intentional interest with compatibility context.",
          "Mutual signals unlock chat. Premium adds visibility, online-now discovery, and deeper insight."
        ],
        image: {
          src: MOMENT_SETS.suyaChill[2],
          alt: "BamSignal signals",
          caption: "Send a signal when someone genuinely fits — not when you are bored."
        }
      },
      {
        heading: "Built for every Nigerian city",
        paragraphs: [
          `From Lagos rooftops to Calabar beach days, BamSignal is visual because Nigerian dating is visual. Explore ${SITE_URL}/blog for your city guide.`,
          `Join free: ${SITE_URL}/love/sign`
        ]
      }
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [...CITY_SEO_META.map(buildCityPost), ...PILLAR_POSTS];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export const BLOG_POST_COUNT = BLOG_POSTS.length;

export function getBlogPostsByCity(city: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.city === city);
}
