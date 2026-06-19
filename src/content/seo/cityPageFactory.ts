import type { SeoPage } from "./seoPages";
import type { CityMeta } from "./cityData";
import { SEO_LAST_UPDATED } from "./pageBuilders";

export function buildCityPage(meta: CityMeta): SeoPage {
  const { slug, city, state, areaHint, connectNote, meetHint, chatHook } = meta;

  return {
    slug,
    title: `Meet people in ${city} | BamSignal city guide`,
    description: `How to meet people in ${city}, ${state} — conversation ideas, local tips, and calm safety reminders for dating on BamSignal.`,
    h1: `Meet people in ${city}`,
    intro: `${city} has its own rhythm — whether you live around ${areaHint}. Meet people who match your vibe and let good conversations begin with a signal.`,
    sections: [
      {
        heading: `How BamSignal helps in ${city}`,
        paragraphs: [
          connectNote,
          "Browse Discover, read prompts, and send a signal when someone feels like a real match — not just another profile in the feed."
        ]
      },
      {
        heading: "Conversation ideas",
        paragraphs: [
          `Reference something specific: ${chatHook}. One clear question beats a long generic message.`,
          "Good conversations often begin with a signal. Give people something easy and genuine to respond to."
        ]
      },
      {
        heading: "A calm safety reminder",
        paragraphs: [
          `For first meetups in ${city}, choose ${meetHint}. Share your plans with someone you trust and keep your own transport sorted.`,
          "If a chat feels off, you can pause, block, or report — you never owe anyone a meeting or personal details."
        ]
      },
      {
        heading: "Ready when you are",
        paragraphs: [
          "Create your profile, set your city, and explore at your pace. There is no rush — the right connection is worth taking seriously."
        ]
      }
    ],
    faqs: [
      {
        question: `Is BamSignal used in ${city}?`,
        answer: `Yes — BamSignal is built for Nigerian cities including ${city}. A complete profile and honest location help you discover people nearby.`
      },
      {
        question: `Where should I meet someone for the first time in ${city}?`,
        answer: `Pick a public place you know — ${meetHint}. Choose a time that works with your schedule and leave when you want.`
      },
      {
        question: "Do I need premium to meet people?",
        answer:
          "No. You can create a profile, send signals, and chat on the free plan. Premium adds optional tools when you want them."
      }
    ],
    category: "Cities",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/cities/${slug}`,
    keywords: [`meet people ${city}`, `dating ${city}`, `${city} singles`, `BamSignal ${city}`],
    schemaType: "Place",
    city,
    state
  };
}
