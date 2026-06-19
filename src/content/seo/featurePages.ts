import { featurePage } from "./pageBuilders";

export const FEATURE_PAGES = [
  featurePage(
    "signals",
    "Signals",
    "Signals on BamSignal | How signals work",
    "Learn how BamSignal signals work — a thoughtful way to start conversations with people who match your vibe.",
    "A signal is more than a swipe. It shows you read someone's profile and want a real conversation.",
    [
      {
        heading: "What is a signal?",
        paragraphs: [
          "Send a short note tied to someone's profile — a prompt, interest, or friendly question.",
          "Good conversations often begin with a signal."
        ]
      },
      {
        heading: "Why signals matter",
        paragraphs: [
          "They slow discovery in a helpful way — you reach out to people you actually want to talk to.",
          "Not every signal gets a reply, and that is normal."
        ]
      }
    ],
    [
      {
        question: "Do signals cost money?",
        answer: "Free members get a daily allowance. Premium can include more."
      },
      {
        question: "What happens when accepted?",
        answer: "Chat opens in the app."
      }
    ],
    ["BamSignal signals", "dating signals Nigeria", "how signals work"]
  ),
  featurePage(
    "discover",
    "Discover",
    "Discover on BamSignal | Features",
    "How Discover works — browsing profiles, filters, and finding people in your city.",
    "Discover is where you browse people near you. Filters and prompts help you find profiles that feel relevant.",
    [
      {
        heading: "Browsing",
        paragraphs: [
          "Swipe or tap through profiles in your city. Read prompts before deciding to signal.",
          "Update your location when you travel so results stay accurate."
        ]
      },
      {
        heading: "Filters",
        paragraphs: [
          "Adjust age, distance, and preferences in settings or the filters screen.",
          "Filters narrow your feed — they do not guarantee chemistry."
        ]
      }
    ],
    [
      {
        question: "Why do I see the same people again?",
        answer: "Discovery refreshes as new members join and as you adjust filters."
      },
      {
        question: "Can I hide from Discover?",
        answer: "Yes — use visibility controls in settings."
      }
    ],
    ["BamSignal discover", "browse dating profiles", "find people Nigeria"]
  ),
  featurePage(
    "chats",
    "Chats",
    "Chats on BamSignal | Features",
    "In-app messaging after signals connect — how chats work on BamSignal.",
    "Chats open when a signal is accepted. Keep conversation respectful and in-app until you are ready for more.",
    [
      {
        heading: "Messaging basics",
        paragraphs: [
          "Text messages, read states, and notifications keep you in sync.",
          "Report or block from any conversation if needed."
        ]
      },
      {
        heading: "Safety in chat",
        paragraphs: [
          "Early contact filters reduce off-platform pressure.",
          "Never share financial details with matches."
        ]
      }
    ],
    [
      {
        question: "Can I send photos in chat?",
        answer: "Product rules may limit media early. Check the app for current options."
      },
      {
        question: "Are chats encrypted?",
        answer: "We protect messages in transit. See our Privacy Policy for details."
      }
    ],
    ["BamSignal chat", "dating messages", "in-app messaging"]
  ),
  featurePage(
    "profile",
    "Profile",
    "Your BamSignal profile | Features",
    "Photos, prompts, and preferences — how your profile represents you on BamSignal.",
    "Your profile is your story in compact form. Honesty and clarity attract better signals.",
    [
      {
        heading: "Core sections",
        paragraphs: [
          "Photos, prompts, basics (age, city), and what you are looking for.",
          "Edit anytime from the Profile tab."
        ]
      },
      {
        heading: "Standing out",
        paragraphs: [
          "Answer prompts with specifics — neighbourhood, hobbies, weekend rituals.",
          "Meet people who match your vibe by showing how you actually live."
        ]
      }
    ],
    [
      {
        question: "Who sees my profile?",
        answer: "Members in discovery and people you interact with, subject to your visibility settings."
      },
      {
        question: "Can I preview my profile?",
        answer: "Yes — use profile preview in the app before saving changes."
      }
    ],
    ["BamSignal profile", "dating profile features", "edit profile"]
  ),
  featurePage(
    "verification",
    "Verification",
    "Profile verification | BamSignal features",
    "Optional verification — phone and selfie checks and what the badge means.",
    "Verification is optional. It signals you took an extra step to confirm your account.",
    [
      {
        heading: "The process",
        paragraphs: [
          "Follow in-app steps for phone and selfie verification.",
          "Match your selfie to your profile photos in good lighting."
        ]
      },
      {
        heading: "Limits",
        paragraphs: [
          "Verification is not a background check.",
          "Always use judgment when meeting people."
        ]
      }
    ],
    [
      {
        question: "Is verification required to chat?",
        answer: "No — though some members prefer signalling verified profiles."
      },
      {
        question: "How long does verification take?",
        answer: "Usually minutes if photos are clear."
      }
    ],
    ["BamSignal verification feature", "verified badge", "selfie check"]
  ),
  featurePage(
    "filters",
    "Filters",
    "Discovery filters | BamSignal features",
    "Age, distance, and preference filters — refine who you see on Discover.",
    "Filters help you focus on people who fit your basic criteria. They work best alongside an honest profile.",
    [
      {
        heading: "Available filters",
        paragraphs: [
          "Age range, distance, gender preferences, and other options shown in-app.",
          "Reset filters anytime if your feed feels too narrow."
        ]
      },
      {
        heading: "Tips",
        paragraphs: [
          "Very tight filters can hide good matches — experiment with reasonable ranges.",
          "Update your city when you relocate."
        ]
      }
    ],
    [
      {
        question: "Do filters affect who sees me?",
        answer: "Your visibility to others depends on their filters and your profile settings."
      },
      {
        question: "Can premium unlock more filters?",
        answer: "Check Premium for any advanced filter options in your region."
      }
    ],
    ["BamSignal filters", "dating preferences", "discover settings"]
  ),
  featurePage(
    "voice-intro",
    "Voice intro",
    "Voice intro on BamSignal | Features",
    "Add a short voice note to your profile — hear someone's tone before you signal.",
    "Voice intros add personality beyond photos. Keep them short, clear, and friendly.",
    [
      {
        heading: "Recording",
        paragraphs: [
          "Tap Voice intro on your profile and record in a quiet space.",
          "Introduce yourself in a few sentences — hobbies, vibe, what you enjoy."
        ]
      },
      {
        heading: "Listening",
        paragraphs: [
          "Play intros on profiles in Discover when available.",
          "Use what you hear as inspiration for a thoughtful signal."
        ]
      }
    ],
    [
      {
        question: "Is voice intro required?",
        answer: "No — it is optional."
      },
      {
        question: "Can I re-record?",
        answer: "Yes — replace your intro anytime from profile edit."
      }
    ],
    ["voice intro dating", "BamSignal voice profile", "audio dating profile"]
  ),
  featurePage(
    "contact-exchange",
    "Contact exchange",
    "Contact exchange feature | BamSignal",
    "How controlled contact exchange works when conversations mature.",
    "BamSignal stages contact sharing so you can chat comfortably before moving to WhatsApp or phone.",
    [
      {
        heading: "Staged sharing",
        paragraphs: [
          "Early chats filter raw phone numbers and links.",
          "As trust builds, exchange may unlock per product rules."
        ]
      },
      {
        heading: "Your choice",
        paragraphs: [
          "You decide when — and if — to share personal contact details.",
          "Report pressure to move off-platform immediately."
        ]
      }
    ],
    [
      {
        question: "Why filter contacts at all?",
        answer: "To reduce scams and unwanted pressure early in conversation."
      },
      {
        question: "Is this premium-only?",
        answer: "Safety rules apply to everyone. See Help for details."
      }
    ],
    ["contact exchange feature", "share phone BamSignal", "safe messaging"]
  ),
  featurePage(
    "people-interested-in-you",
    "People interested in you",
    "See who is interested | BamSignal features",
    "Understand signals and interest — who reached out and how to respond.",
    "Incoming signals show who noticed your profile. Review notes and profiles at your pace.",
    [
      {
        heading: "Signals tab",
        paragraphs: [
          "See pending signals with the message they sent.",
          "Accept to open chat or decline without guilt."
        ]
      },
      {
        heading: "Premium visibility",
        paragraphs: [
          "Some premium tools may show additional interest insights — check Signal Pass.",
          "Free members still receive and manage signals fully."
        ]
      }
    ],
    [
      {
        question: "Will they know if I decline?",
        answer: "They are not notified explicitly. Focus on connections you are excited about."
      },
      {
        question: "Can I see who viewed my profile?",
        answer: "Profile views may be available in premium features where offered."
      }
    ],
    ["who likes you BamSignal", "incoming signals", "dating interest"]
  ),
  featurePage(
    "boosts",
    "Boosts",
    "Profile boosts | BamSignal features",
    "Temporary visibility boosts when you want more profile reach in Discover.",
    "Boosts highlight your profile for a limited time. They complement — not replace — good photos and signals.",
    [
      {
        heading: "How boosts work",
        paragraphs: [
          "Activate from the Boost or Premium area when available.",
          "Your profile may appear more often during the boost window."
        ]
      },
      {
        heading: "Best practices",
        paragraphs: [
          "Complete your profile first — boosts amplify what is already there.",
          "Follow up with thoughtful signals to interested viewers."
        ]
      }
    ],
    [
      {
        question: "Do boosts guarantee matches?",
        answer: "No — they increase visibility only."
      },
      {
        question: "Can I boost in any city?",
        answer: "Availability may depend on your member city. Check the app."
      }
    ],
    ["profile boost", "BamSignal boost feature", "dating visibility"]
  )
];
