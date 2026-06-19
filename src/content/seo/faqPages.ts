import type { SeoPage } from "./seoPages";

export const FAQ_PAGES: SeoPage[] = [
  {
    slug: "getting-started",
    title: "Getting started with BamSignal | FAQ",
    description:
      "Answers about signing up, profiles, and how BamSignal works for new members in Nigeria.",
    h1: "Getting started",
    intro:
      "New to BamSignal? These are the questions people ask first — from account setup to sending a signal.",
    sections: [],
    faqs: [
      {
        question: "Is BamSignal free to use?",
        answer:
          "Yes. You can create a profile, discover people, send signals, and chat on the free plan. Premium plans add extra tools for members who want them."
      },
      {
        question: "Who can join BamSignal?",
        answer:
          "BamSignal is built for adults in Nigeria who want to meet people for dating and meaningful connections. You must meet the minimum age shown at signup."
      },
      {
        question: "How do signals work?",
        answer:
          "Browse Discover, tap someone who interests you, and send a signal with a short note. If they accept, you can chat in the app."
      },
      {
        question: "Do I need to verify my profile?",
        answer:
          "Verification is optional but encouraged. It helps others know you put care into your profile. Steps are shown in the app when you are ready."
      },
      {
        question: "Can I change my city?",
        answer:
          "Yes. Update your location in profile settings when you move or travel so discovery stays relevant."
      }
    ],
    category: "FAQ",
    lastUpdated: "2026-06-19",
    canonicalPath: "/faq/getting-started",
    keywords: ["BamSignal FAQ", "how to use BamSignal", "dating app Nigeria"],
    schemaType: "FAQPage"
  }
];
