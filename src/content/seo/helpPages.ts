import type { SeoPage } from "./seoPages";

export const HELP_PAGES: SeoPage[] = [
  {
    slug: "create-profile",
    title: "How to create your BamSignal profile | Help",
    description:
      "Step-by-step guide to setting up your BamSignal profile — photos, prompts, and preferences that help you meet people who match your vibe.",
    h1: "Create your profile",
    intro:
      "Your profile is your introduction. A clear photo and honest answers help the right people notice you — without needing a perfect feed or exaggerated bio.",
    sections: [
      {
        heading: "Start with one strong photo",
        paragraphs: [
          "Choose a recent photo where your face is easy to see. Natural light works well — you do not need a studio shoot.",
          "Add more photos over time: something that shows a hobby, a favourite spot, or you with friends (with their consent)."
        ]
      },
      {
        heading: "Answer prompts honestly",
        paragraphs: [
          "Prompts give people something real to respond to. Share what you enjoy in Lagos or your city, what you are looking for, and a detail that feels like you.",
          "Skip vague lines like \"ask me anything\" — specifics make signals easier to send."
        ]
      },
      {
        heading: "Set your preferences",
        paragraphs: [
          "Choose who you would like to meet and the age range that makes sense for you. You can update these anytime in settings.",
          "Location helps surface people nearby. If you travel often, update your city when it changes."
        ]
      }
    ],
    faqs: [
      {
        question: "How many photos should I add?",
        answer:
          "Start with at least one clear face photo. Two to four photos total is a solid range — quality and variety matter more than quantity."
      },
      {
        question: "Can I edit my profile later?",
        answer:
          "Yes. Open Profile → Edit anytime to update photos, prompts, and preferences."
      }
    ],
    category: "Help",
    lastUpdated: "2026-06-19",
    canonicalPath: "/help/create-profile",
    keywords: ["create BamSignal profile", "dating profile tips Nigeria", "profile setup"],
    schemaType: "Article"
  }
];
