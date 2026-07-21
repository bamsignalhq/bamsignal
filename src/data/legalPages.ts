import type { LegalPath } from "../constants/footer";
import { SHOWCASE } from "../constants/showcase";

export type LegalHighlight = {
  label: string;
  value: string;
  body?: string;
};

export type LegalSection = {
  heading: string;
  body: string;
  bullets?: string[];
  image?: { src: string; alt: string };
};

export type LegalPageConfig = {
  eyebrow: string;
  title: string;
  lede: string;
  heroImage: string;
  heroAlt: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  gallery?: { src: string; alt: string }[];
};

export const LEGAL_PAGES: Record<LegalPath, LegalPageConfig> = {
  "/about": {
    eyebrow: "Our story",
    title: "About BamSignal",
    lede: "Real people. Real vibes. Connections that start with a signal — built for how Nigerians actually meet.",
    heroImage: SHOWCASE.hero,
    heroAlt: "Young Nigerian professionals connecting in Lagos",
    highlights: [
      { label: "Verification", value: "ID checks available" },
      { label: "Coverage", value: "All states" },
      { label: "Free tier", value: "5 signals daily" }
    ],
    gallery: [
      { src: SHOWCASE.lagosRooftop, alt: "Friends at a Lagos rooftop hangout" },
      { src: SHOWCASE.suyaChill, alt: "Suya and chill with friends" },
      { src: SHOWCASE.sundayHangout, alt: "Sunday hangout vibes" }
    ],
    sections: [
      {
        heading: "Why we built BamSignal",
        body:
          "Dating and friendship apps often feel noisy, fake, or disconnected from Nigerian life. BamSignal is different — curated discovery, verified profiles, and conversations that start with respect.",
        image: { src: SHOWCASE.movieDate, alt: "Movie date night in Nigeria" }
      },
      {
        heading: "What we believe",
        body: "Great connections should feel intentional, not chaotic.",
        bullets: [
          "Verified people over endless swipes",
          "Safety tools you control from day one",
          "Local vibes — Lagos rooftops, Sunday hangouts, suya runs",
          "Friendship, dating, and everything in between"
        ]
      },
      {
        heading: "Built for Nigeria",
        body:
          "From state and city filters to intents that match how you actually move — BamSignal is designed around Nigerian cities, cultures, and real meet-up moments.",
        image: { src: SHOWCASE.roadTrip, alt: "Friends on a Nigerian road trip" }
      }
    ]
  },
  "/safety-policy": {
    eyebrow: "Safety centre",
    title: "Your comfort comes first",
    lede: "Report, block, and control who can signal or message you — with verification and chat protections built in.",
    heroImage: SHOWCASE.sundayHangout,
    heroAlt: "Safe Sunday hangout with friends",
    highlights: [
      {
        label: "Reports reviewed",
        value: "Reports reviewed",
        body: "We actively review reports to help keep BamSignal safe."
      },
      {
        label: "Contact blocking",
        value: "Contact blocking",
        body: "Phone numbers, links and external contacts are filtered in chat."
      },
      {
        label: "Your controls",
        value: "Your controls",
        body: "Block, report and manage your experience at any time."
      }
    ],
    gallery: [
      { src: SHOWCASE.beachDay, alt: "Beach day with friends" },
      { src: SHOWCASE.lagosRooftop, alt: "Public rooftop meetup" },
      { src: SHOWCASE.hero, alt: "Verified young professionals" }
    ],
    sections: [
      {
        heading: "Verified profiles",
        body:
          "Phone and selfie verification help reduce fake accounts. Look for the verified badge before you connect — and complete your own verification to build trust.",
        image: { src: SHOWCASE.hero, alt: "Verified BamSignal members" }
      },
      {
        heading: "You're in control",
        body: "Adjust who can signal you, who can message you, and whether you appear in discovery.",
        bullets: [
          "Pause DMs anytime without losing existing chats",
          "Restrict signals to verified members or preference matches",
          "Hide from discovery when you need a break",
          "Block and report with one tap from any profile or chat"
        ]
      },
      {
        heading: "Safer conversations",
        body:
          "Contact details like phone numbers and social handles are blocked in chat early on — reducing scams, pressure, and off-platform risks.",
        image: { src: SHOWCASE.suyaChill, alt: "Keep conversations inside BamSignal first" }
      },
      {
        heading: "Meet safely",
        body: "When you're ready to meet in person, choose public places and tell someone you trust.",
        bullets: [
          "Meet in busy, public locations for first dates",
          "Share your plans with a friend or family member",
          "Trust your instincts — leave if something feels off",
          "Use in-app report tools if behaviour crosses a line"
        ]
      },
      {
        heading: "Background checks",
        body:
          "BamSignal does not conduct criminal background checks on users. Users are responsible for exercising caution and making safe decisions when interacting with others online or offline. BamSignal is not responsible for the conduct of users outside the platform."
      }
    ]
  },
  "/privacy": {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    lede: "How BamSignal collects, uses, and protects your information — in plain language.",
    heroImage: SHOWCASE.lagosRooftop,
    heroAlt: "Private rooftop conversation",
    highlights: [
      { label: "Data control", value: "In settings" },
      { label: "Encryption", value: "In transit" },
      { label: "Age minimum", value: "18+" }
    ],
    sections: [
      {
        heading: "Overview",
        body:
          "BamSignal is a product of Stankings Legacy Ltd. This policy explains what we collect when you use BamSignal, why we need it, and the choices you have. We only collect what's needed to run a safe, useful dating and social discovery service."
      },
      {
        heading: "Information we collect",
        body: "Depending on how you use BamSignal, we may process:",
        bullets: [
          "Account details — name, username, email, phone, date of birth",
          "Profile content — photos, bio, city, preferences, and interests",
          "Messages and interactions — signals, matches, and chat history",
          "Device and usage data — app version, logs, and analytics to prevent abuse",
          "Payment metadata — subscription status via our payment partners (not full card numbers)"
        ]
      },
      {
        heading: "How we use your data",
        body: "We use your information to:",
        bullets: [
          "Show you relevant profiles and power matching",
          "Keep the community safe — verification, moderation, and fraud prevention",
          "Process subscriptions and in-app purchases",
          "Improve BamSignal with aggregated, anonymised insights",
          "Respond to support requests and legal obligations"
        ],
        image: { src: SHOWCASE.movieDate, alt: "Connecting through BamSignal" }
      },
      {
        heading: "Sharing & retention",
        body:
          "We do not sell your personal data. We share limited information with infrastructure providers (hosting, email, payments) under strict contracts. We retain data while your account is active and for a reasonable period after deletion where required by law or safety."
      },
      {
        heading: "Your choices",
        body:
          "Update your profile anytime, adjust safety and matching privacy in settings, or contact us to ask about access, correction, or deletion. Some records may be kept where needed for safety or legal compliance."
      }
    ]
  },
  "/terms": {
    eyebrow: "Legal",
    title: "Terms of Service",
    lede: "The rules for using BamSignal — please read before you join or subscribe.",
    heroImage: SHOWCASE.beachDay,
    heroAlt: "Friends enjoying a beach day",
    highlights: [
      { label: "Minimum age", value: "18 years" },
      { label: "Acceptable use", value: "Required" },
      { label: "Subscriptions", value: "Auto-renew" }
    ],
    sections: [
      {
        heading: "Agreement",
        body:
          "BamSignal is operated by Stankings Legacy Ltd. By creating an account or using BamSignal, you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the service."
      },
      {
        heading: "Eligibility",
        body: "You must be at least 18 years old and legally able to enter a contract. One person, one account — no impersonation or shared logins."
      },
      {
        heading: "Acceptable use",
        body: "You agree not to:",
        bullets: [
          "Harass, threaten, or abuse other members",
          "Post fake profiles, stolen photos, or misleading identity",
          "Solicit money, run scams, or share malicious links",
          "Share illegal content or exploit minors in any way",
          "Scrape, spam, or attempt to disrupt BamSignal systems"
        ],
        image: { src: SHOWCASE.sundayHangoutMosque, alt: "Respectful community hangout" }
      },
      {
        heading: "Subscriptions & payments",
        body:
          "Paid plans and boosts are billed through our payment partners. Prices are shown before checkout. Subscriptions renew until cancelled in your account or app store settings. Refunds follow applicable store and local consumer rules."
      },
      {
        heading: "Account termination",
        body:
          "You may delete your account anytime. We may suspend or terminate accounts that violate these Terms or harm the community, with or without notice where safety requires it."
      },
      {
        heading: "Disclaimer",
        body:
          "BamSignal is provided \"as is.\" We do not guarantee matches or outcomes. You are responsible for your offline interactions — meet safely and use your judgment."
      },
      {
        heading: "Background checks",
        body:
          "BamSignal does not conduct criminal background checks on users. Users are responsible for exercising caution and making safe decisions when interacting with others online or offline. BamSignal is not responsible for the conduct of users outside the platform."
      }
    ]
  },
  "/delete-account": {
    eyebrow: "Account",
    title: "Delete your BamSignal account",
    lede: "You can delete your BamSignal account in Settings. Your profile is hidden immediately and permanent deletion is scheduled within 30 days.",
    heroImage: SHOWCASE.sundayHangout,
    heroAlt: "Account settings",
    highlights: [
      { label: "In-app deletion", value: "Settings → Account" },
      { label: "Grace period", value: "30 days to restore" }
    ],
    sections: [
      {
        heading: "Delete in the app",
        body:
          "Open Settings → Account → Danger Zone → Permanently Delete Account. Confirm in two steps, including typing DELETE. Your profile is hidden from discovery immediately and messaging delivery stops.",
        bullets: [
          "Profile hidden right away",
          "Permanent deletion scheduled within 30 days",
          "Log in during the grace period to restore your account"
        ]
      },
      {
        heading: "What we may keep",
        body:
          "Some records may be retained where required for safety, fraud prevention, legal compliance, payment records, or dispute handling. We do not keep full private message bodies in audit logs unless needed for an active safety review."
      },
      {
        heading: "Need help?",
        body: "Email support@bamsignal.com from the address on your account if you cannot access the app."
      }
    ]
  }
};
