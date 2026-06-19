import { premiumPage } from "./pageBuilders";

export const PREMIUM_PAGES = [
  premiumPage(
    "signal-pass",
    "Signal Pass",
    "Signal Pass | BamSignal premium",
    "What Signal Pass includes — extra signals, visibility tools, and premium features for members who want more room to connect.",
    "Signal Pass is BamSignal's premium plan. The free experience stays fully usable — premium adds optional capacity and tools.",
    [
      {
        heading: "What Signal Pass includes",
        paragraphs: [
          "More daily signals and premium visibility options shown at checkout.",
          "Additional tools may vary by region — see the Premium screen for your plan."
        ]
      },
      {
        heading: "Who it suits",
        paragraphs: [
          "Members with a complete profile who want a bit more reach and flexibility.",
          "Not required to meet people or enjoy BamSignal."
        ]
      }
    ],
    [
      {
        question: "Is the free plan enough?",
        answer: "Yes for many members. Upgrade when extra tools would genuinely help you."
      },
      {
        question: "How is payment handled?",
        answer: "Secure checkout in Naira through our payment partner."
      }
    ],
    ["Signal Pass", "BamSignal premium plan", "dating subscription Nigeria"]
  ),
  premiumPage(
    "boost-visibility",
    "Boost visibility",
    "Boost visibility | BamSignal premium",
    "Premium visibility tools that help your profile reach more of the right people — subtly and on your terms.",
    "Visibility boosts are optional extras — not a promise of matches, just more chances to be seen when your profile is ready.",
    [
      {
        heading: "How it works",
        paragraphs: [
          "Premium visibility may prioritize your profile in Discover for periods defined in your plan.",
          "Works best alongside clear photos and answered prompts."
        ]
      },
      {
        heading: "Keep expectations realistic",
        paragraphs: [
          "Visibility helps people find you — signals and chat still drive real connection.",
          "Take breaks from premium anytime; the free app remains available."
        ]
      }
    ],
    [
      {
        question: "Is this the same as Boosts?",
        answer: "Related but separate. Boosts are often one-off purchases; Signal Pass may bundle visibility perks."
      },
      {
        question: "Can I turn visibility off?",
        answer: "Manage premium features from settings or by ending your plan."
      }
    ],
    ["boost visibility premium", "profile reach", "BamSignal premium visibility"]
  ),
  premiumPage(
    "priority-introduction",
    "Priority introduction",
    "Priority introduction | BamSignal premium",
    "How priority introduction helps your signals stand out — without pressure or guarantees.",
    "Priority introduction can surface your signals with added prominence. It supports intentional outreach, not spam.",
    [
      {
        heading: "What it means",
        paragraphs: [
          "Your signal may appear with emphasis when sent to compatible profiles.",
          "You still write a real note — quality matters more than volume."
        ]
      },
      {
        heading: "Using it well",
        paragraphs: [
          "Reference something specific from their profile.",
          "Send fewer, better signals rather than many generic ones."
        ]
      }
    ],
    [
      {
        question: "Does priority guarantee a reply?",
        answer: "No. It may increase noticeability — replies depend on mutual interest."
      },
      {
        question: "Is it included in Signal Pass?",
        answer: "Check your Premium screen for bundled features in your region."
      }
    ],
    ["priority introduction", "premium signals", "stand out dating app"]
  ),
  premiumPage(
    "featured-profile",
    "Featured profile",
    "Featured profile | BamSignal premium",
    "Occasional featured placement for premium members — gentle extra exposure in Discover.",
    "Featured placement highlights profiles that are complete and active. It is a nudge, not the centre of BamSignal.",
    [
      {
        heading: "Placement",
        paragraphs: [
          "Your profile may appear in featured sections during campaigns or boost windows.",
          "Eligibility can depend on profile quality and regional availability."
        ]
      },
      {
        heading: "Stay authentic",
        paragraphs: [
          "Featured slots work when your profile reflects the real you.",
          "Update photos and prompts before relying on premium reach."
        ]
      }
    ],
    [
      {
        question: "How long does featuring last?",
        answer: "Varies by campaign and plan — details show in-app."
      },
      {
        question: "Can free members be featured?",
        answer: "Featuring is a premium perk where offered."
      }
    ],
    ["featured profile dating", "premium spotlight", "BamSignal featured"]
  ),
  premiumPage(
    "quickie-pass",
    "Quickie Pass",
    "Quickie Pass | BamSignal premium",
    "Quickie Pass — premium access to Quickie, BamSignal's short-form connection feature.",
    "Quickie is for quick, light-hearted moments. Quickie Pass unlocks extended use where the feature is available.",
    [
      {
        heading: "What Quickie is",
        paragraphs: [
          "A playful way to engage beyond standard discovery — details in the app.",
          "Optional and separate from everyday signals and chat."
        ]
      },
      {
        heading: "Quickie Pass",
        paragraphs: [
          "Adds more Quickie sessions or perks shown at purchase.",
          "Try the free taste first; upgrade only if you enjoy the format."
        ]
      }
    ],
    [
      {
        question: "Do I need Quickie Pass to date on BamSignal?",
        answer: "No. Core dating features work without Quickie."
      },
      {
        question: "Where is Quickie available?",
        answer: "Rollout may vary by city. Check the app for availability."
      }
    ],
    ["Quickie Pass", "BamSignal Quickie premium", "quick dating feature"]
  )
];
