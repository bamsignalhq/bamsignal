import { safetyPage } from "./pageBuilders";

export const SAFETY_PAGES = [
  safetyPage(
    "meeting-safely",
    "Meeting safely in person",
    "Meeting someone safely | BamSignal safety guide",
    "Practical tips for meeting matches in person — public places, sharing plans, and trusting your instincts in Nigeria.",
    "Moving from chat to a real meetup can be exciting. These steps help you stay in control without taking the fun out of dating.",
    [
      {
        heading: "Keep early meetups public",
        paragraphs: [
          "Choose a busy café, restaurant, or mall for first meetings.",
          "Avoid private homes or isolated locations until you have built trust over time."
        ]
      },
      {
        heading: "Tell someone your plans",
        paragraphs: [
          "Share the place, time, and who you are meeting with a friend or family member.",
          "Arrange your own transport so you can leave when you want."
        ]
      },
      {
        heading: "Trust your instincts",
        paragraphs: [
          "If something feels off, you can end the meetup, block, or report. You do not owe anyone a reason.",
          "Pressure, money requests, or refusal to meet in public are signs to pause."
        ]
      }
    ],
    [
      {
        question: "When should I share my phone number?",
        answer: "When you feel comfortable — many people keep chat on BamSignal until after a good in-person meeting."
      },
      {
        question: "What if I feel unsafe?",
        answer: "Leave if you can, contact someone you trust, use block/report, and contact local authorities in an emergency."
      }
    ],
    ["meet safely dating", "first date safety Nigeria", "in-person dating tips"]
  ),
  safetyPage(
    "avoid-romance-scams",
    "Avoid romance scams",
    "How to avoid romance scams | BamSignal safety",
    "Calm, practical signs of romance scams and how to protect yourself when dating online in Nigeria.",
    "Most people on dating apps are genuine — but scams exist. Knowing common patterns helps you stay clear-headed.",
    [
      {
        heading: "Common patterns",
        paragraphs: [
          "Fast emotional intensity, excuses to avoid video or public meetings, and stories that lead to money requests.",
          "Scammers may claim emergencies, travel problems, or investment opportunities."
        ]
      },
      {
        heading: "What to do",
        paragraphs: [
          "Never send money, gift cards, or crypto to someone you have not met reliably in person.",
          "Report suspicious profiles and stop engaging if pressure increases."
        ]
      }
    ],
    [
      {
        question: "Are verified profiles always safe?",
        answer: "Verification helps reduce fakes but is not a guarantee of intent. Still use judgment."
      },
      {
        question: "Can BamSignal refund money I sent someone?",
        answer: "No — BamSignal cannot recover funds sent outside the app. Contact your bank if you were scammed."
      }
    ],
    ["romance scams Nigeria", "dating scam signs", "online dating fraud"]
  ),
  safetyPage(
    "reporting-abuse",
    "Reporting abuse",
    "How to report abuse on BamSignal | Safety",
    "How to report harassment, threats, or inappropriate behaviour on BamSignal.",
    "Everyone deserves respect. If someone crosses a line, reporting helps our team review and take action.",
    [
      {
        heading: "When to report",
        paragraphs: [
          "Harassment, hate speech, threats, impersonation, or requests for money.",
          "Non-consensual content or someone who will not leave you alone after you said no."
        ]
      },
      {
        heading: "How to report",
        paragraphs: [
          "Use Report from their profile or chat. Add brief details — our team reviews reports.",
          "Block immediately if you want no further contact."
        ]
      }
    ],
    [
      {
        question: "Will the other person know I reported them?",
        answer: "Reports are confidential. They are not notified that you specifically reported them."
      },
      {
        question: "What happens after a report?",
        answer: "Our team reviews against community guidelines. Outcomes may include warnings, restrictions, or removal."
      }
    ],
    ["report abuse BamSignal", "harassment dating app", "report user"]
  ),
  safetyPage(
    "privacy",
    "Privacy on BamSignal",
    "Privacy and your data | BamSignal safety",
    "How to control visibility, who can contact you, and what you share on BamSignal.",
    "You control much of your experience — from discovery visibility to who can signal or message you.",
    [
      {
        heading: "Discovery controls",
        paragraphs: [
          "Pause or hide from discovery when you need a break without deleting your account.",
          "Adjust who can see you based on preferences in settings."
        ]
      },
      {
        heading: "Your data",
        paragraphs: [
          "Read our Privacy Policy for how we handle information.",
          "Delete your account anytime if you want your profile removed."
        ]
      }
    ],
    [
      {
        question: "Can I hide my profile temporarily?",
        answer: "Yes — use discovery or visibility controls in settings."
      },
      {
        question: "Who can see my photos?",
        answer: "Members in discovery and people you interact with. Do not upload anything you would not want seen on a dating app."
      }
    ],
    ["BamSignal privacy", "dating app privacy Nigeria", "hide profile"]
  ),
  safetyPage(
    "blocking-users",
    "Blocking users",
    "How to block someone on BamSignal | Safety",
    "Block users instantly — what happens and when to use it.",
    "Blocking is quick and reversible only by unblocking yourself. Use it whenever you want distance from someone.",
    [
      {
        heading: "What blocking does",
        paragraphs: [
          "They cannot message you or view your profile depending on current product rules.",
          "Existing chats may be hidden from your list."
        ]
      },
      {
        heading: "How to block",
        paragraphs: [
          "Open their profile or chat → Block. Confirm when prompted.",
          "Combine with report if behaviour violated guidelines."
        ]
      }
    ],
    [
      {
        question: "Can a blocked person tell I blocked them?",
        answer: "They may notice they cannot contact you. There is no separate notification."
      },
      {
        question: "Can I unblock someone?",
        answer: "Yes — manage blocked accounts in settings if you change your mind."
      }
    ],
    ["block user BamSignal", "stop messages dating app", "blocking help"]
  ),
  safetyPage(
    "contact-exchange",
    "Contact exchange safety",
    "Safe contact exchange | BamSignal safety",
    "When to move from in-app chat to phone or social media — calmly and on your terms.",
    "There is no rush to share WhatsApp or Instagram. Many good connections stay on BamSignal until trust builds.",
    [
      {
        heading: "Take your time",
        paragraphs: [
          "Several respectful conversations — or a public meetup — are reasonable milestones first.",
          "Early filtering of phone numbers in chat is there to protect you, not inconvenience you."
        ]
      },
      {
        heading: "Red flags",
        paragraphs: [
          "Pushing hard for off-platform chat immediately.",
          "Asking for money alongside contact exchange requests."
        ]
      }
    ],
    [
      {
        question: "Why are numbers blocked in chat?",
        answer: "To reduce scams and unwanted off-platform pressure early in conversation."
      },
      {
        question: "When is contact exchange allowed?",
        answer: "Rules relax as conversations mature. See Help → Contact exchange for product details."
      }
    ],
    ["safe contact exchange", "share WhatsApp dating", "chat safety Nigeria"]
  ),
  safetyPage(
    "never-send-money",
    "Never send money",
    "Never send money to matches | BamSignal safety",
    "Why you should never send money to someone you met on a dating app — and what to do instead.",
    "A genuine romantic interest will not ask you to wire money, buy airtime, or invest crypto early in knowing you.",
    [
      {
        heading: "Common requests",
        paragraphs: [
          "Medical emergencies, visa fees, business opportunities, or \"proof of trust\" transfers.",
          "Scammers exploit emotion — stay calm and say no."
        ]
      },
      {
        heading: "If you already sent money",
        paragraphs: [
          "Contact your bank or payment provider immediately.",
          "Report the profile on BamSignal and consider local authorities for significant losses."
        ]
      }
    ],
    [
      {
        question: "Does BamSignal ever ask for money outside the app?",
        answer: "Premium and boosts are paid through official in-app checkout only — not via chat requests."
      },
      {
        question: "What if they promise to pay me back?",
        answer: "Still decline. Repayment stories are a common scam pattern."
      }
    ],
    ["never send money dating", "dating app money scam", "romance fraud Nigeria"]
  ),
  safetyPage(
    "verification",
    "Verification and safety",
    "Verification and safety | BamSignal",
    "What profile verification does and does not mean for your safety.",
    "Verification helps show a profile is tied to a real person — it is one tool, not a substitute for your judgment.",
    [
      {
        heading: "What verification checks",
        paragraphs: [
          "Phone confirmation and a selfie match to profile photos in most flows.",
          "It does not include criminal background checks."
        ]
      },
      {
        heading: "Staying safe anyway",
        paragraphs: [
          "Meet in public, avoid money requests, and report concerns.",
          "Look for consistent behaviour over time, not just a badge."
        ]
      }
    ],
    [
      {
        question: "Should I only talk to verified users?",
        answer: "That is your choice. Many genuine members verify over time — politeness and consistency matter too."
      },
      {
        question: "Can fakes pass verification?",
        answer: "We work to prevent abuse, but no system is perfect. Report anything suspicious."
      }
    ],
    ["verification safety", "verified dating profile", "BamSignal verify"]
  )
];
