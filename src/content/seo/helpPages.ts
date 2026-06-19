import { helpPage } from "./pageBuilders";

export const HELP_PAGES = [
  helpPage(
    "create-profile",
    "Create your profile",
    "How to create your BamSignal profile | Help",
    "Step-by-step guide to setting up your BamSignal profile — photos, prompts, and preferences that help you meet people who match your vibe.",
    "Your profile is your introduction. A clear photo and honest answers help the right people notice you — without needing a perfect feed.",
    [
      {
        heading: "Start with one strong photo",
        paragraphs: [
          "Choose a recent photo where your face is easy to see. Natural light works well.",
          "Add more photos over time — a hobby, a favourite spot, or you with friends (with their consent)."
        ]
      },
      {
        heading: "Answer prompts honestly",
        paragraphs: [
          "Prompts give people something real to respond to. Share what you enjoy in your city and what you are looking for.",
          "Specifics make signals easier to send than vague lines like \"ask me anything.\""
        ]
      },
      {
        heading: "Set your preferences",
        paragraphs: [
          "Choose who you would like to meet and a sensible age range. Update anytime in settings.",
          "Keep your city current so discovery stays relevant when you travel or relocate."
        ]
      }
    ],
    [
      {
        question: "How many photos should I add?",
        answer: "Start with one clear face photo. Two to four total is a solid range."
      },
      {
        question: "Can I edit my profile later?",
        answer: "Yes — open Profile → Edit anytime."
      }
    ],
    ["create BamSignal profile", "profile setup Nigeria", "dating profile tips"]
  ),
  helpPage(
    "signals",
    "How signals work",
    "How signals work on BamSignal | Help",
    "Learn how to send and receive signals on BamSignal — intentional messages that start real conversations.",
    "Signals are how you show interest with context. Instead of a silent swipe, you send a short note tied to someone's profile.",
    [
      {
        heading: "Sending a signal",
        paragraphs: [
          "On Discover, open a profile and tap Signal. Write something specific — a prompt they answered, a shared interest, or a friendly question.",
          "Free members receive a daily signal allowance. Premium plans may include more — see Signal Pass for details."
        ]
      },
      {
        heading: "When someone signals you",
        paragraphs: [
          "You will see incoming signals in your Signals tab. Read the note, view their profile, and accept if you would like to chat.",
          "There is no obligation to accept. Ignoring or declining is normal."
        ]
      },
      {
        heading: "After a signal is accepted",
        paragraphs: [
          "Chat opens in the app. Take your time — good conversations build before you share personal contact details."
        ]
      }
    ],
    [
      {
        question: "What if my signal is not accepted?",
        answer: "That happens and it is okay. Focus on profiles where you feel genuine interest and keep your notes thoughtful."
      },
      {
        question: "Can I cancel a signal?",
        answer: "Once sent, a signal cannot be unsent. Double-check your message before confirming."
      }
    ],
    ["BamSignal signals help", "how to send a signal", "dating signals Nigeria"]
  ),
  helpPage(
    "messages",
    "Messages and chats",
    "How messaging works on BamSignal | Help",
    "Guide to chats on BamSignal — starting conversations, notifications, and staying comfortable in-app.",
    "After a signal is accepted, you can message in BamSignal. Chats stay in the app until you choose otherwise.",
    [
      {
        heading: "Starting a chat",
        paragraphs: [
          "Your opening message can reference the signal that connected you — it keeps context warm.",
          "Ask one question at a time. Long walls of text can feel overwhelming."
        ]
      },
      {
        heading: "Notifications",
        paragraphs: [
          "Enable push notifications if you want timely alerts for new messages and signals.",
          "You can mute or manage notification preferences in device and app settings."
        ]
      },
      {
        heading: "Chat protections",
        paragraphs: [
          "Phone numbers and external links may be filtered early in conversation to reduce pressure and scams.",
          "Report or block from any chat if behaviour crosses a line."
        ]
      }
    ],
    [
      {
        question: "Why was my message blocked?",
        answer: "Contact details and certain links are filtered for safety. Keep conversation on BamSignal until you trust someone."
      },
      {
        question: "Can I delete a chat?",
        answer: "You can remove conversations from your list. If you need help with harassment, use report as well."
      }
    ],
    ["BamSignal messages", "chat help", "dating app messaging"]
  ),
  helpPage(
    "verification",
    "Profile verification",
    "How verification works on BamSignal | Help",
    "Steps to verify your BamSignal profile and what the verified badge means.",
    "Verification is optional. It shows you took an extra step to confirm your account — which can help others feel comfortable replying.",
    [
      {
        heading: "What verification includes",
        paragraphs: [
          "Verification typically involves confirming your phone number and completing a selfie check that matches your photos.",
          "Steps appear in the app when you are ready — follow the on-screen prompts."
        ]
      },
      {
        heading: "Why verify",
        paragraphs: [
          "Verified profiles can feel more trustworthy in Discover. Some members prefer signalling verified accounts.",
          "Verification is not a background check — always use your own judgment when meeting people."
        ]
      }
    ],
    [
      {
        question: "Is verification required?",
        answer: "No. You can use BamSignal without verifying, though completing verification may improve trust."
      },
      {
        question: "My verification failed — what now?",
        answer: "Retry in good lighting with a clear face match to your photos. Contact support if issues persist."
      }
    ],
    ["BamSignal verification", "verify dating profile", "selfie verification"]
  ),
  helpPage(
    "signal-pass",
    "Signal Pass help",
    "Signal Pass premium help | BamSignal",
    "What Signal Pass includes, how billing works, and how to manage your premium plan.",
    "Signal Pass is BamSignal's premium subscription. Core features remain free — premium adds capacity and convenience.",
    [
      {
        heading: "What you get",
        paragraphs: [
          "More daily signals, premium visibility options, and additional tools shown on the Premium screen.",
          "Exact limits and pricing appear in-app in Naira at checkout."
        ]
      },
      {
        heading: "Managing your plan",
        paragraphs: [
          "View or change your plan from Profile → Premium or Settings.",
          "Payment is processed securely through our payment partner."
        ]
      }
    ],
    [
      {
        question: "Can I use BamSignal without Signal Pass?",
        answer: "Yes. Discovery, signals, and chat work on the free plan."
      },
      {
        question: "How do I cancel?",
        answer: "Follow the cancellation steps shown in your plan details or payment provider receipt."
      }
    ],
    ["Signal Pass help", "BamSignal premium", "cancel subscription"]
  ),
  helpPage(
    "boosts",
    "Boosts help",
    "How boosts work on BamSignal | Help",
    "Learn about profile boosts — temporary visibility when you want a little extra reach.",
    "Boosts briefly increase how often your profile appears in Discover. They are optional and separate from everyday swiping and signals.",
    [
      {
        heading: "Using a boost",
        paragraphs: [
          "Purchase a boost from the Premium or Boost screen when available in your city.",
          "While active, your profile may be shown more prominently for a limited window."
        ]
      },
      {
        heading: "Tips",
        paragraphs: [
          "Boosts work best when your profile is complete — clear photos and answered prompts.",
          "They do not guarantee matches — they simply add visibility."
        ]
      }
    ],
    [
      {
        question: "Do boosts replace signals?",
        answer: "No. Boosts affect visibility; signals are still how you start intentional conversations."
      },
      {
        question: "How long does a boost last?",
        answer: "Duration is shown at purchase. Check the Boost screen for current timings."
      }
    ],
    ["BamSignal boosts", "profile boost help", "dating app visibility"]
  ),
  helpPage(
    "delete-account",
    "Delete your account",
    "How to delete your BamSignal account | Help",
    "Steps to permanently delete your BamSignal account and what happens to your data.",
    "You can leave BamSignal anytime. Account deletion is permanent after the processing period shown in-app.",
    [
      {
        heading: "Before you delete",
        paragraphs: [
          "Download anything you want to keep — chats are not available after deletion.",
          "Cancel an active premium plan first if applicable."
        ]
      },
      {
        heading: "How to delete",
        paragraphs: [
          "Go to Settings → Account → Delete account and follow the confirmation steps.",
          "You may also use the delete-account page linked from our footer for web requests."
        ]
      }
    ],
    [
      {
        question: "Can I recover a deleted account?",
        answer: "No. Deletion is permanent once processed."
      },
      {
        question: "How long does deletion take?",
        answer: "Timing is shown during the flow. Some data is removed immediately; full processing may take a short period."
      }
    ],
    ["delete BamSignal account", "close dating account", "account removal"]
  ),
  helpPage(
    "reset-pin",
    "Reset your PIN",
    "How to reset your BamSignal PIN | Help",
    "Forgot your login PIN? Steps to reset securely and get back into your account.",
    "Your PIN protects your account on top of your username. If you forget it, use the reset flow — never share your PIN with anyone.",
    [
      {
        heading: "Start a reset",
        paragraphs: [
          "On the login screen, tap Forgot PIN and follow verification steps sent to your registered email or phone.",
          "Choose a new PIN you have not used elsewhere."
        ]
      },
      {
        heading: "Stay secure",
        paragraphs: [
          "BamSignal staff will never ask for your PIN.",
          "If you suspect someone accessed your account, reset your PIN and review active sessions."
        ]
      }
    ],
    [
      {
        question: "I am not receiving reset codes",
        answer: "Check spam folders and confirm your registered contact details. Contact support if needed."
      },
      {
        question: "Can I change my PIN without forgetting it?",
        answer: "Yes — use Security settings in the app when logged in."
      }
    ],
    ["reset BamSignal PIN", "forgot login PIN", "account security"]
  ),
  helpPage(
    "photos",
    "Profile photos",
    "Profile photo help on BamSignal | Help",
    "Tips for uploading photos, cropping, and meeting BamSignal photo guidelines.",
    "Photos are the first thing people see. Clear, recent images help you make a good impression without over-editing.",
    [
      {
        heading: "Uploading",
        paragraphs: [
          "Tap Add photo on your profile and choose from your gallery or camera.",
          "Use the crop tool to centre your face. HEIC images are supported on most devices."
        ]
      },
      {
        heading: "Guidelines",
        paragraphs: [
          "No nudity, hate symbols, or images of people without their consent.",
          "Photos should represent you — heavy filters or misleading angles may be removed."
        ]
      }
    ],
    [
      {
        question: "Why was my photo rejected?",
        answer: "It may violate guidelines or fail automated safety checks. Try a clearer, well-lit alternative."
      },
      {
        question: "How many photos can I add?",
        answer: "Limits are shown in the app. Focus on quality over quantity."
      }
    ],
    ["BamSignal photos", "upload profile picture", "dating photo tips"]
  ),
  helpPage(
    "contact-exchange",
    "Contact exchange",
    "Contact exchange on BamSignal | Help",
    "When and how to share phone numbers or social handles — and why in-app chat comes first.",
    "BamSignal keeps early chats in-app on purpose. Contact filters reduce scams and pressure to move off-platform too quickly.",
    [
      {
        heading: "Why chat stays in-app first",
        paragraphs: [
          "Filtering phone numbers and links early helps you focus on conversation before sharing personal details.",
          "When you are comfortable, you can exchange contacts — there is no fixed timeline."
        ]
      },
      {
        heading: "Sharing safely",
        paragraphs: [
          "Wait until you have had several respectful exchanges or met in public.",
          "Use block and report if someone pushes for money or off-platform contact aggressively."
        ]
      }
    ],
    [
      {
        question: "Can I send my WhatsApp in chat?",
        answer: "External contact details may be blocked until the conversation matures. This is intentional for safety."
      },
      {
        question: "Is contact exchange a premium feature?",
        answer: "Contact exchange rules apply to all members. See Features for how Contact Exchange works when enabled."
      }
    ],
    ["contact exchange BamSignal", "share phone number dating app", "chat safety"]
  )
];
