import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Goal,
  Home,
  Instagram,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  Twitter,
  UserPlus,
  Users,
  X,
  Youtube
} from "lucide-react";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const demoOtpEnabled = import.meta.env.DEV;
const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;

type Theme = "dark" | "light";
type Page =
  | { kind: "home" }
  | { kind: "app" }
  | { kind: "tips" }
  | { kind: "markets" }
  | { kind: "leagues" }
  | { kind: "market"; slug: string }
  | { kind: "league"; slug: string }
  | { kind: "contact" }
  | { kind: "legal"; slug: string }
  | { kind: "admin" };
type AdminTab = "overview" | "games" | "login" | "content" | "payments" | "otp" | "support";
type AuthMode = "login" | "signup" | "verify" | "loginOtp" | "pinSetup" | "unlock" | "reset";
type AuthIntent = "login" | "signup" | "reset" | null;
type DashboardTab = "home" | "vip" | "profile";
type BookmakerKey =
  | "sportybet"
  | "bet9ja"
  | "betking"
  | "onexbet"
  | "betway"
  | "merrybet"
  | "nairabet"
  | "msport"
  | "paripesa"
  | "bangbet"
  | "betano"
  | "accessbet"
  | "melbet";
type BookingCodeEntry = {
  id: number;
  bookmaker: BookmakerKey;
  code: string;
  regularApp: boolean;
  premiumApp: boolean;
  regularTelegram: boolean;
  premiumTelegram: boolean;
};
type LoginBanner = {
  headline: string;
  body: string;
  imageUrl: string;
  actionText: string;
  actionUrl: string;
  active?: boolean;
};
type UserProfile = {
  name: string;
  email: string;
  phone: string;
};
type DeviceBinding = UserProfile & {
  pin: string;
  deviceId: string;
};
type AdminGame = {
  id: number;
  match: string;
  league: string;
  pick: string;
  odds: number;
  confidence: number;
  tier: "freemium" | "vip";
  showBookingCodes: boolean;
  bookingCodes: BookingCodeEntry[];
  pushApp: boolean;
  pushTelegram: boolean;
  pushWhatsApp: boolean;
  pushVipTelegram: boolean;
};
type ApiTip = {
  id?: string | number;
  match_name: string;
  league?: string;
  prediction: string;
  odds: string | number;
  confidence?: number;
  is_vip: boolean;
  booking_codes?: Record<string, string>;
};
type DailyGamesApiResponse = {
  ok: boolean;
  date: string;
  freemium: ApiTip[];
  vip: ApiTip[];
};
const apiTipToAdminGame = (tip: ApiTip, index: number): AdminGame => {
  const bookingCodes = Object.entries(tip.booking_codes || {}).map(([bookmaker, code], codeIndex) => ({
    ...makeBookingCode(bookmakerKeyFromName(bookmaker), String(code), tip.is_vip),
    id: Number(`${Date.now()}${index}${codeIndex}`.slice(-9))
  }));
  return {
    id: typeof tip.id === "number" ? tip.id : Date.now() + index,
    match: tip.match_name,
    league: tip.league || "Football",
    pick: tip.prediction,
    odds: Number(tip.odds),
    confidence: Number(tip.confidence || (tip.is_vip ? 76 : 82)),
    tier: tip.is_vip ? "vip" : "freemium",
    showBookingCodes: !tip.is_vip && bookingCodes.length > 0,
    bookingCodes,
    pushApp: true,
    pushTelegram: true,
    pushWhatsApp: false,
    pushVipTelegram: tip.is_vip
  };
};
type AdminContent = {
  newsTitle: string;
  newsSummary: string;
  newsSource: string;
  newsUrl: string;
  adLinks: string[];
  sendchampDefaultChannel: "whatsapp" | "sms";
  sendchampWhatsappTemplate: string;
  sendchampSmsSender: string;
  bookingButtonText: string;
  vipWeeklyPrice: number;
  vipMonthlyPrice: number;
  vipWeeklyLink: string;
  vipMonthlyLink: string;
  loginBanners: {
    firstTimer: LoginBanner;
    returning: LoginBanner;
    weekendSpecial: LoginBanner & { active: boolean };
  };
  games: AdminGame[];
};
type SupportMessage = {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  to: string;
  createdAt: string;
};

const bookmakers: { key: BookmakerKey; label: string }[] = [
  { key: "sportybet", label: "SportyBet" },
  { key: "bet9ja", label: "Bet9ja" },
  { key: "betking", label: "BetKing" },
  { key: "onexbet", label: "1xBet" },
  { key: "betway", label: "Betway" },
  { key: "merrybet", label: "MerryBet" },
  { key: "nairabet", label: "NairaBet" },
  { key: "msport", label: "MSport" },
  { key: "paripesa", label: "PariPesa" },
  { key: "bangbet", label: "Bangbet" },
  { key: "betano", label: "Betano" },
  { key: "accessbet", label: "AccessBET" },
  { key: "melbet", label: "Melbet" }
];

const bookmakerLabel = (key: BookmakerKey) => bookmakers.find((bookmaker) => bookmaker.key === key)?.label ?? key;
const bookmakerKeyFromName = (value: string): BookmakerKey => {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return bookmakers.find((bookmaker) => bookmaker.key.replace(/[^a-z0-9]/g, "") === normalized || bookmaker.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized)?.key ?? "sportybet";
};
const makeBookingCode = (bookmaker: BookmakerKey, code: string, premium = false): BookingCodeEntry => ({
  id: Date.now() + Math.floor(Math.random() * 10000),
  bookmaker,
  code,
  regularApp: !premium,
  premiumApp: premium,
  regularTelegram: !premium,
  premiumTelegram: premium
});

const getTimedTheme = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
};

type Fixture = {
  id: number;
  league: string;
  country: string;
  time: string;
  home: string;
  away: string;
  pick: string;
  confidence: number;
  result: string;
  btts: number;
  over25: number;
  corners: number;
  score: string;
  status: "Live" | "Today" | "Tomorrow";
};

type Evidence = {
  match: string;
  pick: string;
  odds: string;
  result: string;
  status: "Won" | "Lost";
  tier: "Free" | "VIP";
};

const fixtures: Fixture[] = [
  {
    id: 1,
    league: "Champions League",
    country: "Europe",
    time: "19:00",
    home: "Paris SG",
    away: "Bayern Munich",
    pick: "Over 1.5 goals",
    confidence: 86,
    result: "Away or draw",
    btts: 65,
    over25: 61,
    corners: 88,
    score: "1-2",
    status: "Today"
  },
  {
    id: 2,
    league: "Championship",
    country: "England",
    time: "18:45",
    home: "Southampton",
    away: "Ipswich Town",
    pick: "Home over 0.5",
    confidence: 73,
    result: "Home win",
    btts: 54,
    over25: 49,
    corners: 95,
    score: "2-1",
    status: "Today"
  },
  {
    id: 3,
    league: "La Liga",
    country: "Spain",
    time: "20:00",
    home: "Espanyol",
    away: "Real Madrid",
    pick: "Away double chance",
    confidence: 77,
    result: "Away win",
    btts: 51,
    over25: 52,
    corners: 91,
    score: "1-2",
    status: "Tomorrow"
  },
  {
    id: 4,
    league: "Serie A",
    country: "Italy",
    time: "16:30",
    home: "Roma",
    away: "Atalanta",
    pick: "Both teams to score",
    confidence: 68,
    result: "Draw",
    btts: 71,
    over25: 58,
    corners: 79,
    score: "1-1",
    status: "Live"
  },
  {
    id: 5,
    league: "Bundesliga",
    country: "Germany",
    time: "14:30",
    home: "Dortmund",
    away: "Leipzig",
    pick: "Over 2.5 goals",
    confidence: 74,
    result: "Home or draw",
    btts: 69,
    over25: 76,
    corners: 83,
    score: "2-2",
    status: "Tomorrow"
  }
];

const dailySureSignals: Fixture[] = [
  fixtures[0],
  {
    id: 101,
    league: "Premier League",
    country: "England",
    time: "17:30",
    home: "Man City",
    away: "Tottenham",
    pick: "Home win + over 1.5 goals",
    confidence: 84,
    result: "Home win",
    btts: 57,
    over25: 68,
    corners: 82,
    score: "2-1",
    status: "Today"
  },
  {
    id: 102,
    league: "La Liga",
    country: "Spain",
    time: "20:00",
    home: "Barcelona",
    away: "Villarreal",
    pick: "Barcelona team over 1.5",
    confidence: 82,
    result: "Home win",
    btts: 61,
    over25: 64,
    corners: 76,
    score: "3-1",
    status: "Today"
  },
  {
    id: 103,
    league: "Bundesliga",
    country: "Germany",
    time: "14:30",
    home: "Bayer Leverkusen",
    away: "Mainz",
    pick: "Home win and BTTS",
    confidence: 80,
    result: "Home win",
    btts: 66,
    over25: 63,
    corners: 79,
    score: "2-1",
    status: "Today"
  }
];

const getDailyKey = () => new Date().toLocaleDateString("en-CA");

const getDailySureSignal = (dailyKey: string) => {
  const dayNumber = dailyKey.split("-").reduce((total, part) => total + Number(part), 0);
  const dailyPool = dailySureSignals
    .filter((fixture) => fixture.status === "Today" && fixture.confidence >= 80)
    .sort((left, right) => right.confidence - left.confidence);
  const candidates = dailyPool.length ? dailyPool : fixtures;
  return candidates[dayNumber % candidates.length];
};

const evidenceBoard: Evidence[] = [
  {
    match: "Arsenal vs Wolves",
    pick: "Arsenal over 1.5 team goals",
    odds: "1.62",
    result: "2-0",
    status: "Won",
    tier: "Free"
  },
  {
    match: "Inter Milan vs Torino",
    pick: "Inter win or draw + over 1.5",
    odds: "1.78",
    result: "3-1",
    status: "Won",
    tier: "VIP"
  },
  {
    match: "Real Sociedad vs Valencia",
    pick: "Under 3.5 goals",
    odds: "1.39",
    result: "1-1",
    status: "Won",
    tier: "Free"
  },
  {
    match: "Dortmund vs Freiburg",
    pick: "Both teams to score",
    odds: "1.71",
    result: "1-0",
    status: "Lost",
    tier: "VIP"
  },
  {
    match: "PSG vs Lille",
    pick: "PSG over 0.5 first half",
    odds: "1.55",
    result: "2-1",
    status: "Won",
    tier: "VIP"
  }
];

const defaultAdminGames: AdminGame[] = [
  {
    id: 1,
    match: "Paris SG vs Bayern Munich",
    league: "Champions League",
    pick: "Over 1.5 goals",
    odds: 1.42,
    confidence: 86,
    tier: "freemium",
    showBookingCodes: true,
    bookingCodes: [
      { ...makeBookingCode("sportybet", "SB-186"), id: 101 },
      { ...makeBookingCode("bet9ja", "B9-142"), id: 102 },
      { ...makeBookingCode("betking", "BK-186"), id: 103 }
    ],
    pushApp: true,
    pushTelegram: true,
    pushWhatsApp: true,
    pushVipTelegram: false
  },
  {
    id: 2,
    match: "Southampton vs Ipswich Town",
    league: "Championship",
    pick: "Home over 0.5",
    odds: 1.36,
    confidence: 73,
    tier: "freemium",
    showBookingCodes: false,
    bookingCodes: [
      { ...makeBookingCode("sportybet", "SB-273"), id: 201 },
      { ...makeBookingCode("bet9ja", "B9-136"), id: 202 }
    ],
    pushApp: true,
    pushTelegram: true,
    pushWhatsApp: true,
    pushVipTelegram: false
  },
  {
    id: 3,
    match: "Man City vs Tottenham",
    league: "Premier League",
    pick: "Home win + over 1.5",
    odds: 2.18,
    confidence: 82,
    tier: "vip",
    showBookingCodes: true,
    bookingCodes: [
      { ...makeBookingCode("sportybet", "VIP-SB218", true), id: 301 },
      { ...makeBookingCode("bet9ja", "VIP-B9218", true), id: 302 },
      { ...makeBookingCode("onexbet", "VIP-1X218", true), id: 303 }
    ],
    pushApp: true,
    pushTelegram: false,
    pushWhatsApp: false,
    pushVipTelegram: true
  },
  {
    id: 4,
    match: "Barcelona vs Villarreal",
    league: "La Liga",
    pick: "Barcelona team over 1.5",
    odds: 1.94,
    confidence: 79,
    tier: "vip",
    showBookingCodes: true,
    bookingCodes: [
      { ...makeBookingCode("betking", "VIP-BK194", true), id: 401 },
      { ...makeBookingCode("betway", "VIP-BW194", true), id: 402 }
    ],
    pushApp: true,
    pushTelegram: false,
    pushWhatsApp: false,
    pushVipTelegram: true
  },
  {
    id: 5,
    match: "Bayer Leverkusen vs Mainz",
    league: "Bundesliga",
    pick: "Home win and BTTS",
    odds: 2.42,
    confidence: 76,
    tier: "vip",
    showBookingCodes: true,
    bookingCodes: [
      { ...makeBookingCode("sportybet", "VIP-SB242", true), id: 501 },
      { ...makeBookingCode("msport", "VIP-MS242", true), id: 502 }
    ],
    pushApp: true,
    pushTelegram: false,
    pushWhatsApp: false,
    pushVipTelegram: true
  }
];

const profileGameHistory = [
  { teams: "Paris SG vs Bayern Munich", league: "Champions League", play: "Over 1.5 goals", status: "Won" },
  { teams: "Southampton vs Ipswich Town", league: "Championship", play: "Home over 0.5", status: "Won" },
  { teams: "Roma vs Atalanta", league: "Serie A", play: "Both teams to score", status: "Lost" },
  { teams: "Dortmund vs Leipzig", league: "Bundesliga", play: "Over 2.5 goals", status: "Won" },
  { teams: "Espanyol vs Real Madrid", league: "La Liga", play: "Away double chance", status: "Won" }
];

const adminPlan = [
  "Publish Free Sure Game to app, Telegram channel, and WhatsApp channel",
  "Publish VIP high-odd games to premium app room and Telegram VIP group",
  "Schedule match reminders and result proof updates",
  "Track affiliate booking-code clicks and channel delivery status"
];

const defaultAdminContent: AdminContent = {
  newsTitle: "",
  newsSummary: "",
  newsSource: "",
  newsUrl: "",
  adLinks: ["", "", "", "", ""],
  sendchampDefaultChannel: "whatsapp",
  sendchampWhatsappTemplate: "bamsignal_login_otp",
  sendchampSmsSender: "BamSignal",
  bookingButtonText: "Get SportyBet Code",
  vipWeeklyPrice: 950,
  vipMonthlyPrice: 2950,
  vipWeeklyLink: "https://paystack.com/pay/bamsignal-vip-weekly",
  vipMonthlyLink: "https://paystack.com/pay/bamsignal-vip-monthly",
  loginBanners: {
    firstTimer: {
      headline: "Start with 2 free low-risk signals",
      body: "Create your account, verify once, then compare free picks before deciding if VIP is for you.",
      imageUrl: "",
      actionText: "Create secure account",
      actionUrl: "signup"
    },
    returning: {
      headline: "This week's value code is ready",
      body: "Check the app for available booking codes, partner offers, and the latest free signal before kickoff.",
      imageUrl: "",
      actionText: "Open member room",
      actionUrl: "login"
    },
    weekendSpecial: {
      active: false,
      headline: "Weekend banker board opens Friday",
      body: "Turn this on from admin when the Friday-to-Sunday push is live for VIP and regular channels.",
      imageUrl: "",
      actionText: "View weekend signal",
      actionUrl: "vip"
    }
  },
  games: defaultAdminGames
};

const legalPages = [
  {
    slug: "terms",
    title: "Terms of Use",
    intro: "These terms explain how visitors, free members, and VIP members should use BamSignal responsibly.",
    sections: [
      "BamSignal provides sports information, market education, football prediction analysis, and app-based member features. The platform does not accept wagers, process bets, or act as a bookmaker.",
      "Predictions, percentages, booking-code references, and market notes are informational only. Users remain fully responsible for any betting decisions they make outside BamSignal.",
      "You must be 18 years or older, or the legal betting age in your jurisdiction, before using any betting-related information on BamSignal.",
      "We may update content, app features, pricing, VIP access, and delivery channels as the product grows. Continued use of BamSignal means you accept the current version of these terms."
    ]
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro: "This policy explains the type of information BamSignal may collect when users contact us, create accounts, or use our app.",
    sections: [
      "We may collect account details such as name, email address, phone number, payment verification status, and support messages when users choose to provide them.",
      "Payment confirmation is expected to be handled through Paystack or another secure provider. BamSignal should not store full card details inside the app.",
      "Contact messages are routed to support@bamsignal.com so the support team can respond. We use this information only for service, safety, and account support.",
      "Operational tools such as Firebase, Telegram, WhatsApp Business providers, analytics, and hosting services may process limited data needed to deliver notifications and product features.",
      "Users can request account and associated data deletion from the profile area inside the app or from the public account deletion page at /legal/account-deletion."
    ]
  },
  {
    slug: "account-deletion",
    title: "Account Deletion",
    intro: "This page explains how BamSignal users can request deletion of their account and associated account data.",
    sections: [
      "Inside the app, open Profile and choose Request account deletion. Outside the app, email support@bamsignal.com with the subject Account deletion request.",
      "Include the email address or phone number connected to your BamSignal account so support can identify the account safely.",
      "When deletion is confirmed, BamSignal will remove or anonymize account details such as name, email, phone number, membership status, and support records unless retention is required for fraud prevention, tax, payment dispute, legal, or security reasons.",
      "Deletion requests are reviewed manually to protect users from accidental or unauthorized account removal. You may be asked to verify ownership before deletion is completed."
    ]
  },
  {
    slug: "responsible-gambling",
    title: "Responsible Gambling",
    intro: "BamSignal is built for adults who understand that football outcomes are uncertain and betting can carry financial risk.",
    sections: [
      "BamSignal is 18+ only. Do not use our prediction content if you are below the legal betting age in your country or region.",
      "Never bet money you cannot afford to lose. Set limits, avoid chasing losses, and take breaks when betting stops feeling controlled.",
      "No prediction is guaranteed. A high percentage does not mean a match cannot lose, and a strong analysis does not remove football uncertainty.",
      "If betting is causing stress, debt, secrecy, or harm, stop immediately and seek help from a trusted person or a professional responsible-gambling support service."
    ]
  },
  {
    slug: "disclaimer",
    title: "Prediction Disclaimer",
    intro: "This disclaimer makes the limits of BamSignal analysis clear before anyone uses our football content.",
    sections: [
      "Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.",
      "All percentages, tips, odds references, scores, and market angles are estimates based on available information and can be wrong.",
      "Team news, lineup changes, injuries, weather, red cards, bookmaker changes, and live match events can affect any prediction.",
      "BamSignal is not liable for betting losses, missed profits, account restrictions, bookmaker decisions, or any action taken after reading our content."
    ]
  },
  {
    slug: "cookies",
    title: "Cookie Notice",
    intro: "This notice explains how BamSignal may use basic browser storage and similar technologies.",
    sections: [
      "BamSignal may use browser storage for theme preference, app routing, admin preview fields, and future product settings.",
      "Analytics, hosting, payment, and notification providers may use cookies or similar tools to keep services secure and reliable.",
      "You can control cookies through your browser settings. Blocking some storage may affect saved preferences or future account features.",
      "As BamSignal adds production services, this notice should be reviewed and updated to match the exact tools used."
    ]
  }
];

const formatNaira = (amount: number) => `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount)}`;

const markets = [
  "Fulltime result",
  "First half winner",
  "Double chance",
  "Correct score",
  "Both teams to score",
  "Over/under goals",
  "Team goals",
  "Corners"
];

const leagues = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Champions League",
  "Europa League"
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const marketDetails = [
  {
    name: "Fulltime result",
    slug: "fulltime-result",
    intro: "Fulltime result predictions explain the classic 1X2 market: home win, draw, or away win after 90 minutes plus stoppage time.",
    sections: [
      "What it means: this is the simplest football market. If Arsenal play Chelsea, a fulltime result pick asks whether Arsenal win, Chelsea win, or the game ends level. It does not care about goals, corners, cards, or who scores first.",
      "How to read it: beginners should compare team quality, recent form, home advantage, injuries, motivation, and fixture pressure. A strong favorite with fresh players at home is different from a famous club rotating after a European night.",
      "How BamSignal applies it: the model weighs form, venue strength, table pressure, head-to-head context, scoring and conceding trends, and price movement. Use it when the match story is clear and the odds still offer reasonable value."
    ]
  },
  {
    name: "First half winner",
    slug: "first-half-winner",
    intro: "First half winner predictions focus only on which team leads at halftime, making early tempo and starting intensity more important than the final score.",
    sections: [
      "What it means: the bet is settled after the first 45 minutes plus first-half stoppage time. A team can win the first half and still fail to win the match, so this market needs a different mindset from fulltime result.",
      "How to read it: look for teams that start fast, press early, score many first-half goals, or face opponents that concede early. Also check whether a favorite may manage energy slowly before growing into the game.",
      "How BamSignal applies it: the signal studies first-half goal timing, early shot pressure, lineup strength, schedule fatigue, and home crowd effect. It is useful for aggressive teams, derby momentum, and mismatches where the favorite usually begins quickly."
    ]
  },
  {
    name: "Double chance",
    slug: "double-chance",
    intro: "Double chance predictions reduce risk by covering two of the three possible fulltime outcomes: home or draw, away or draw, or home or away.",
    sections: [
      "What it means: instead of needing one exact match result, you protect two outcomes. Home or draw means the home team must avoid defeat. Away or draw means the away team must avoid defeat. Home or away means there must be no draw.",
      "How to read it: beginners use double chance when a team has a strong chance not to lose but the win price feels risky. It is common for away favorites, evenly matched games, and fixtures where a draw is very possible.",
      "How BamSignal applies it: the model checks defensive reliability, match control, recent losses, travel context, injury news, and draw frequency. It is one of the safest educational markets because it teaches probability management instead of chasing high odds."
    ]
  },
  {
    name: "Correct score",
    slug: "correct-score",
    intro: "Correct score predictions estimate the exact final score, such as 1-0, 1-1, 2-1, or 3-0. It is high risk and should be treated carefully.",
    sections: [
      "What it means: the final score must match your pick exactly. If the prediction is 2-1 and the game ends 2-0 or 3-1, the pick loses even if the stronger team wins.",
      "How to read it: beginners should first understand likely goal range. Low-event games often point toward 0-0, 1-0, or 1-1. Open games with attacking teams may support 2-1, 2-2, or 3-1 scorelines.",
      "How BamSignal applies it: the model studies expected goal bands, finishing form, defensive gaps, goalkeeper reliability, tactical style, and match importance. Correct score is best used as a small-stake value angle, not as the main plan."
    ]
  },
  {
    name: "Both teams to score",
    slug: "both-teams-to-score",
    intro: "Both teams to score predictions ask whether each side will score at least one goal before fulltime.",
    sections: [
      "What it means: BTTS Yes wins if both teams score. BTTS No wins if one or both teams fail to score. The final winner does not matter; a 1-1, 2-1, or 4-2 all count as Yes.",
      "How to read it: beginners should check whether both teams create chances regularly and whether either defense is unreliable. A strong attack facing a weak defense helps, but you still need the other team to score too.",
      "How BamSignal applies it: the model compares goal frequency, clean sheets, away scoring, defensive injuries, tactical openness, and game state. BTTS is especially useful in leagues and matchups where both teams attack rather than sit deep."
    ]
  },
  {
    name: "Over/under goals",
    slug: "over-under-goals",
    intro: "Over/under goals predictions estimate whether a match finishes above or below a goal line such as 1.5, 2.5, or 3.5 goals.",
    sections: [
      "What it means: Over 2.5 needs at least three goals. Under 2.5 needs two goals or fewer. The winning team does not matter; only the total number of goals matters.",
      "How to read it: beginners should check attacking form, defensive weakness, pace, fixture importance, and whether either team is likely to protect a result. Cup ties, relegation pressure, and second-leg situations can change the goal pattern.",
      "How BamSignal applies it: the model studies recent total goals, expected scoring range, shot volume, conversion quality, and tactical pressure. Lower lines like over 1.5 are usually safer than over 3.5, but the odds will normally be smaller."
    ]
  },
  {
    name: "Team goals",
    slug: "team-goals",
    intro: "Team goals predictions focus on how many goals one specific team is likely to score, independent of the opponent's total.",
    sections: [
      "What it means: a team over 0.5 goal pick means that team must score at least once. Team over 1.5 means the team must score two or more. Team under 1.5 means the team scores zero or one.",
      "How to read it: beginners should ask whether the team creates chances, whether key attackers start, and whether the opponent regularly concedes. A dominant favorite at home may be better for team goals than fulltime result if the win price is too low.",
      "How BamSignal applies it: the model checks team shot volume, striker availability, home scoring, opponent clean sheets, set-piece threat, and tactical mismatch. It is useful when one team's attack is clear but the final result has draw risk."
    ]
  },
  {
    name: "Corners",
    slug: "corners",
    intro: "Corners predictions estimate corner volume, often based on attacking pressure, wide play, blocked shots, and how teams defend their box.",
    sections: [
      "What it means: corner markets can cover total corners, team corners, first-half corners, or corner handicap. A corner happens when the defending team last touches the ball before it crosses the goal line outside the goal.",
      "How to read it: beginners should look for teams that cross often, attack through wide players, force saves, or dominate territory. Underdogs can also win corners if they counter quickly or chase the game late.",
      "How BamSignal applies it: the model studies average corners for and against, wing usage, shot pressure, possession territory, game state, and opponent defensive style. Corners can be valuable because they are driven by pressure, not only goals."
    ]
  }
];

const leagueDetails = [
  {
    name: "Premier League",
    slug: "premier-league",
    intro: "Premier League predictions need context because England's top division is fast, physical, commercially powerful, and packed with clubs that carry major domestic and European history.",
    sections: [
      "What makes it unique: the Premier League is known for speed, pressing, deep squads, intense crowds, and a high level of week-to-week competition. Smaller clubs can still trouble title contenders because the league has strong money, strong coaching, and very little room for lazy performances.",
      "Major clubs and trophies: Manchester United, Liverpool, Arsenal, Chelsea, Manchester City, Tottenham Hotspur, Aston Villa, Everton, Newcastle United, and others shape the league's history. Liverpool and Manchester United are giants domestically and in Europe. Chelsea and Manchester City have lifted the Champions League. Arsenal are famous for league titles and cup tradition. Aston Villa and Nottingham Forest are historic European champions, which matters when reading club culture and pressure.",
      "How beginners should apply it: do not judge Premier League games only by name value. Check injuries, rotation after Europe, home and away form, manager style, and whether the underdog has a set-piece or counterattack route. For betting education, double chance, over/under goals, both teams to score, and team goals are often easier to understand than chasing a famous club at short odds.",
      "BamSignal angle: Premier League predictions work best when data and match context agree. A top club may dominate possession, but if it faces schedule fatigue or a compact defensive side, the smarter signal may be corners, team goals, or over 1.5 rather than a risky fulltime result."
    ]
  },
  {
    name: "La Liga",
    slug: "la-liga",
    intro: "La Liga predictions require patience because Spanish football often mixes elite technical quality, tactical control, strong defensive structure, and moments of individual brilliance.",
    sections: [
      "What makes it unique: La Liga is historically technical and tactical. Many teams are comfortable slowing the tempo, protecting space, and controlling possession. That means some matches can be lower scoring than casual bettors expect, especially when mid-table or relegation teams prioritize defensive shape.",
      "Major clubs and trophies: Real Madrid are the record Champions League force and one of football's biggest trophy machines. Barcelona are famous for La Liga dominance, Champions League wins, and a possession identity that shaped modern football. Atletico Madrid have built a powerful domestic and European reputation through organization, intensity, and defensive discipline. Sevilla are deeply associated with Europa League success, while Valencia, Villarreal, Athletic Club, and Real Sociedad bring major domestic and European history.",
      "How beginners should apply it: separate reputation from match rhythm. Real Madrid and Barcelona may have star power, but a tight away match after Europe can become tactical. Atletico matches often require reading defensive discipline and game state. For novices, under/over goals, double chance, and team goals can be clearer than correct score unless the goal pattern is very obvious.",
      "BamSignal angle: La Liga signals should respect tempo, venue, squad rotation, and defensive quality. If a team controls games but does not always score heavily, a safer team goal line or double chance may be more useful than forcing a big-margin prediction."
    ]
  },
  {
    name: "Serie A",
    slug: "serie-a",
    intro: "Serie A predictions are about tactical detail, defensive organization, coaching matchups, and understanding when Italian games open up or stay controlled.",
    sections: [
      "What makes it unique: Serie A has a reputation for tactical intelligence. Teams often adjust shape carefully, protect central areas, and use set pieces, wing-backs, and structured pressing. Modern Serie A can still be high scoring, but the best reads come from understanding the tactical matchup.",
      "Major clubs and trophies: Juventus, AC Milan, Inter Milan, Roma, Lazio, Napoli, Fiorentina, Atalanta, and others define the league's identity. AC Milan and Inter Milan are European giants with Champions League tradition. Juventus are historically dominant domestically. Napoli have become a modern force with league-title prestige. Roma, Lazio, Parma, Sampdoria, and Fiorentina also carry important domestic or European stories that influence expectation and pressure.",
      "How beginners should apply it: look beyond the table. A team may be lower in the standings but tactically difficult. Check whether a side uses three centre-backs, wing-backs, direct transitions, or heavy possession. Both teams to score and over/under goals require careful attention to match style, not just attacking names.",
      "BamSignal angle: Serie A predictions should combine numbers with tactical sense. If two teams are organized and cautious, under goals or double chance may be more sensible. If both sides use aggressive wing play or concede from transitions, corners and BTTS become more interesting."
    ]
  },
  {
    name: "Bundesliga",
    slug: "bundesliga",
    intro: "Bundesliga predictions often involve tempo, transitions, attacking football, pressing, and goal-friendly patterns that can create strong over-goals and BTTS signals.",
    sections: [
      "What makes it unique: Germany's Bundesliga is known for attacking intent, pressing, vertical passing, and quick transitions. Many teams are brave with the ball, which can create open games, quick swings, and late goals. This makes goal markets very important for beginners to understand.",
      "Major clubs and trophies: Bayern Munich are the dominant German powerhouse and Champions League winners. Borussia Dortmund are famous for elite talent development, league titles, and European prestige. Bayer Leverkusen, RB Leipzig, Werder Bremen, Stuttgart, Hamburg, Borussia Monchengladbach, Schalke, and Eintracht Frankfurt all carry important domestic or European history. Frankfurt and Leverkusen have major European moments, while Dortmund and Bayern are globally recognized.",
      "How beginners should apply it: do not assume every Bundesliga game is automatically over 2.5, but do respect the league's attacking patterns. Check whether both teams press high, concede chances, and have available forwards. If a favorite is too short to back directly, team goals, over 1.5, BTTS, or corners may explain the game better.",
      "BamSignal angle: Bundesliga predictions are strongest when tempo data supports the eye test. High shot volume, aggressive full-backs, defensive injuries, and transition-heavy matchups often produce useful goal and corner signals."
    ]
  },
  {
    name: "Champions League",
    slug: "champions-league",
    intro: "Champions League predictions must respect elite quality, two-leg strategy, travel, rotation, and the pressure of Europe's biggest club competition.",
    sections: [
      "What makes it unique: the Champions League brings together Europe's strongest clubs, but the market is not only about famous names. Group stage matches, knockout first legs, second legs, away goals context no longer applying, travel, and squad depth all change how teams approach risk.",
      "Major clubs and trophies: Real Madrid are the competition's defining dynasty. AC Milan, Liverpool, Bayern Munich, Barcelona, Ajax, Inter Milan, Manchester United, Chelsea, Manchester City, Juventus, Benfica, Porto, Nottingham Forest, Aston Villa, Borussia Dortmund, Marseille, and others are part of European Cup and Champions League history. These clubs carry different levels of pressure, experience, and expectation when the anthem plays.",
      "How beginners should apply it: check the tie situation before picking. In a first leg, a team may avoid risk. In a second leg, the team behind may attack early, which can affect goals, corners, cards, and BTTS. Domestic league schedule also matters because elite clubs manage minutes carefully.",
      "BamSignal angle: Champions League predictions should combine club strength with competition behavior. The best signals often come from identifying whether a match will be controlled, chaotic, rotated, or desperate. That context can point to safer picks like double chance, over 1.5, team goals, or corners."
    ]
  },
  {
    name: "Europa League",
    slug: "europa-league",
    intro: "Europa League predictions are rich for value because the competition includes strong clubs, ambitious underdogs, difficult travel, and different levels of motivation.",
    sections: [
      "What makes it unique: the Europa League sits below the Champions League but often creates more unpredictable betting conditions. Clubs from major leagues meet teams from smaller leagues, and motivation can vary depending on domestic priorities, squad depth, and knockout position.",
      "Major clubs and trophies: Sevilla are the competition's modern kings and deeply associated with Europa League success. Atletico Madrid, Chelsea, Manchester United, Villarreal, Porto, Inter Milan, Juventus, Liverpool, Tottenham Hotspur, Eintracht Frankfurt, Bayer Leverkusen, Shakhtar Donetsk, Zenit, Feyenoord, Ajax, and others have important UEFA Cup or Europa League history. Knowing which clubs value European nights helps a beginner read motivation.",
      "How beginners should apply it: always check travel distance, rotation, league schedule, and whether the club needs the Europa League as a route to Champions League qualification. A famous team may rest players, while a smaller club may treat the match as the biggest night of the season.",
      "BamSignal angle: Europa League predictions often reward patient research. Look at lineup strength, venue difficulty, and tactical mismatch. Markets like double chance, team goals, over/under goals, and corners can be more practical than trusting reputation alone."
    ]
  }
];

const globalLeagueRegions = [
  {
    region: "England",
    competitions: "Premier League, Championship, FA Cup, EFL Cup",
    clubs: "Manchester United, Liverpool, Arsenal, Chelsea, Manchester City, Tottenham, Aston Villa, Newcastle, Everton, West Ham, Leeds, Leicester, Sunderland",
    notes: "English football is useful for betting education because it has deep data, intense schedules, strong home crowds, cup rotation, and clubs with major European and domestic trophies."
  },
  {
    region: "Spain",
    competitions: "La Liga, Segunda Division, Copa del Rey, Supercopa",
    clubs: "Real Madrid, Barcelona, Atletico Madrid, Sevilla, Valencia, Villarreal, Athletic Club, Real Sociedad, Real Betis, Celta Vigo",
    notes: "Spanish matches often reward tactical patience. Beginners should watch possession control, away tempo, defensive blocks, and whether a club is managing minutes around Europe."
  },
  {
    region: "Italy",
    competitions: "Serie A, Serie B, Coppa Italia, Supercoppa",
    clubs: "Juventus, Inter Milan, AC Milan, Napoli, Roma, Lazio, Atalanta, Fiorentina, Torino, Bologna, Parma, Sampdoria",
    notes: "Italy is rich for tactical matchups, set pieces, wing-back systems, defensive organization, and BTTS or under/over reads that depend on game state."
  },
  {
    region: "Germany",
    competitions: "Bundesliga, 2. Bundesliga, DFB-Pokal, Supercup",
    clubs: "Bayern Munich, Borussia Dortmund, Bayer Leverkusen, RB Leipzig, Eintracht Frankfurt, Stuttgart, Werder Bremen, Schalke, Hamburg, Borussia Monchengladbach",
    notes: "German football is usually strong for goals, transitions, pressing, and corners. The main discipline is avoiding automatic over-picks when matchup tempo is slower than the league reputation."
  },
  {
    region: "France",
    competitions: "Ligue 1, Ligue 2, Coupe de France, Trophee des Champions",
    clubs: "Paris Saint-Germain, Marseille, Lyon, Monaco, Lille, Lens, Rennes, Nice, Nantes, Saint-Etienne, Bordeaux",
    notes: "French football can mix elite attacking talent with compact defensive teams. PSG fixtures need different treatment from mid-table tactical matches."
  },
  {
    region: "Portugal and Netherlands",
    competitions: "Primeira Liga, Eredivisie, domestic cups, European qualifiers",
    clubs: "Benfica, Porto, Sporting CP, Braga, Ajax, PSV, Feyenoord, AZ Alkmaar, Twente, Utrecht",
    notes: "These leagues are important for European value, youth-heavy squads, attacking styles, and club motivation around Champions League or Europa League qualification."
  },
  {
    region: "Africa and Nigeria watchlist",
    competitions: "NPFL, CAF Champions League, CAF Confederation Cup, national cups",
    clubs: "Enyimba, Rivers United, Remo Stars, Rangers International, Shooting Stars, Kano Pillars, Al Ahly, Zamalek, Esperance, Wydad, Mamelodi Sundowns",
    notes: "African football needs extra care because team news, travel, pitch conditions, and fixture confirmation can affect reliability. BamSignal should expand here carefully with verified data sources."
  }
];

const bettingTipPrinciples = [
  {
    title: "Start from probability, not emotion",
    text: "A good football tip is not a guess based on club popularity. It should explain why the percentage is strong, what can make it fail, and whether the odds are worth the risk. Nigerian punters should be especially careful with famous teams at very short prices because reputation does not always equal value."
  },
  {
    title: "Separate low-risk picks from high-odd picks",
    text: "Free picks should usually stay around safer lines such as over 1.5 goals, double chance, team over 0.5, or carefully selected fulltime results. VIP picks can carry higher odds, but they still need logic, staking discipline, and clear market reasoning."
  },
  {
    title: "Use booking codes as convenience, not pressure",
    text: "Booking codes help users play faster on SportyBet, Bet9ja, BetKing, 1xBet, Betway, and other bookies, but users should still read the match note. BamSignal should always make the analysis visible enough for trust and never act like a guaranteed outcome."
  },
  {
    title: "Read the fixture calendar",
    text: "A club playing after Champions League travel, a derby, or a long injury list can behave differently from its normal level. Friday nights, Saturday mornings, and Sunday evening fixtures often have different betting behavior in Nigeria, so admin scheduling matters."
  },
  {
    title: "Track wins and losses openly",
    text: "The Evidence Board matters because transparency keeps serious users. A strong product shows won, lost, pending, and voided results clearly, then uses that history to improve future signals."
  },
  {
    title: "Respect responsible gambling",
    text: "Betting should be for adults only. No platform can guarantee football outcomes. Good tips help users understand probability, but staking, discipline, and knowing when not to bet are part of the product's trust."
  }
];

function getInitialPage(): Page {
  const [, section, slug] = window.location.pathname.split("/");
  if (section === "lex" && slug === "auth") return { kind: "admin" };
  if (section === "app") return { kind: "app" };
  if (section === "contact") return { kind: "contact" };
  if (section === "legal" && slug) return { kind: "legal", slug };
  if (section === "betting-tips") return { kind: "tips" };
  if (section === "markets" && !slug) return { kind: "markets" };
  if (section === "leagues" && !slug) return { kind: "leagues" };
  if (section === "markets" && slug) return { kind: "market", slug };
  if (section === "leagues" && slug) return { kind: "league", slug };
  if (Capacitor.getPlatform() !== "web") return { kind: "app" };
  return { kind: "home" };
}

function getAuthIntent(): AuthIntent {
  const intent = new URLSearchParams(window.location.search).get("auth");
  return intent === "signup" || intent === "reset" || intent === "login" ? intent : null;
}

const loadAdminContent = (): AdminContent => {
  try {
    const saved = window.localStorage.getItem("bamsignal-admin-content");
    if (!saved) return defaultAdminContent;
    const parsed = JSON.parse(saved) as Partial<AdminContent>;
    const normalizeCodes = (codes: unknown, fallback: BookingCodeEntry[]): BookingCodeEntry[] => {
      if (Array.isArray(codes)) {
        return codes.map((entry, index) => {
          const item = entry as Partial<BookingCodeEntry>;
          return {
            id: item.id ?? Date.now() + index,
            bookmaker: (item.bookmaker ?? "sportybet") as BookmakerKey,
            code: item.code ?? "",
            regularApp: item.regularApp ?? true,
            premiumApp: item.premiumApp ?? false,
            regularTelegram: item.regularTelegram ?? false,
            premiumTelegram: item.premiumTelegram ?? false
          };
        });
      }
      if (codes && typeof codes === "object") {
        return Object.entries(codes as Record<string, string>)
          .filter(([, code]) => Boolean(code))
          .map(([bookmaker, code], index) => ({
            id: Date.now() + index,
            bookmaker: bookmaker as BookmakerKey,
            code,
            regularApp: true,
            premiumApp: false,
            regularTelegram: false,
            premiumTelegram: false
          }));
      }
      return fallback;
    };
    return {
      ...defaultAdminContent,
      ...parsed,
      adLinks: [...(parsed.adLinks ?? []), "", "", "", "", ""].slice(0, 5),
      loginBanners: {
        firstTimer: { ...defaultAdminContent.loginBanners.firstTimer, ...(parsed.loginBanners?.firstTimer ?? {}) },
        returning: { ...defaultAdminContent.loginBanners.returning, ...(parsed.loginBanners?.returning ?? {}) },
        weekendSpecial: { ...defaultAdminContent.loginBanners.weekendSpecial, ...(parsed.loginBanners?.weekendSpecial ?? {}) }
      },
      games: parsed.games?.length ? parsed.games.map((game, index) => ({
        ...defaultAdminGames[index % defaultAdminGames.length],
        ...game,
        bookingCodes: normalizeCodes(game.bookingCodes, defaultAdminGames[index % defaultAdminGames.length].bookingCodes)
      })) : defaultAdminGames
    };
  } catch {
    return defaultAdminContent;
  }
};

const loadDeviceBinding = (): DeviceBinding | null => {
  try {
    const saved = window.localStorage.getItem("bamsignal-device-binding");
    return saved ? (JSON.parse(saved) as DeviceBinding) : null;
  } catch {
    return null;
  }
};

const faq = [
  {
    question: "How does BamSignal create football predictions?",
    answer:
      "BamSignal models team form, head-to-head history, league position, venue strength, scoring trends, and market movement to turn each fixture into clear probability ranges."
  },
  {
    question: "Which betting markets are covered?",
    answer:
      "The dashboard covers fulltime result, first-half result, double chance, correct score, both teams to score, over/under goals, team goals, and corners."
  },
  {
    question: "When are predictions posted?",
    answer:
      "Sample fixtures are shown for today and tomorrow. In production, BamSignal can refresh daily and update during live matches as new match context arrives."
  },
  {
    question: "Is BamSignal a bookmaker?",
    answer:
      "No. BamSignal is an analytics and prediction product. It does not place bets or guarantee outcomes."
  }
];

function App() {
  const isNative = Capacitor.getPlatform() !== "web";
  const [theme, setTheme] = useState<Theme>(() => getTimedTheme());
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<Fixture["status"] | "All">("All");
  const [isAuthed, setIsAuthed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: "BamSignal Member", email: "", phone: "" });
  const [page, setPage] = useState<Page>(() => getInitialPage());
  const [dailyKey, setDailyKey] = useState(() => getDailyKey());
  const [showStartupSplash, setShowStartupSplash] = useState(() => isNative);
  const [adminContent, setAdminContent] = useState<AdminContent>(() => loadAdminContent());
  const [dailyApiGames, setDailyApiGames] = useState<AdminGame[]>([]);
  const logoSrc = theme === "dark" ? "/brand/compact-logo-dark.jpg" : "/brand/compact-logo-light.jpg";
  const appIconSrc = theme === "dark" ? "/brand/app-icon-dark.jpg" : "/brand/app-icon-light.jpg";
  const effectiveAdminContent = useMemo(() => dailyApiGames.length
    ? { ...adminContent, games: dailyApiGames }
    : adminContent,
  [adminContent, dailyApiGames]);

  const navigate = (nextPage: Page, path = "/") => {
    window.history.pushState(null, "", path);
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openMemberAuth = (intent: Exclude<AuthIntent, null>) => {
    navigate({ kind: "app" }, `/app?auth=${intent}`);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTheme(getTimedTheme());
      setDailyKey(getDailyKey());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isNative) return undefined;
    const splashTimer = window.setTimeout(() => setShowStartupSplash(false), 4200);
    return () => window.clearTimeout(splashTimer);
  }, [isNative]);

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (favicon) {
      favicon.href = theme === "dark" ? "/favicon-dark.png" : "/favicon-light.png";
    }
    document.querySelector("meta[name='theme-color']")?.setAttribute(
      "content",
      theme === "dark" ? "#101923" : "#f5f7fb"
    );
  }, [theme]);

  useEffect(() => {
    const syncRoute = () => setPage(getInitialPage());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    if (isNative || !("serviceWorker" in navigator)) return undefined;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return undefined;
  }, [isNative]);

  useEffect(() => {
    window.localStorage.setItem("bamsignal-admin-content", JSON.stringify(adminContent));
  }, [adminContent]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/daily-games")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: DailyGamesApiResponse | null) => {
        if (cancelled || !payload?.ok) return;
        const games = [...(payload.freemium || []), ...(payload.vip || [])].map(apiTipToAdminGame);
        setDailyApiGames(games);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [dailyKey]);

  const filteredFixtures = useMemo(() => {
    if (activeStatus === "All") return fixtures;
    return fixtures.filter((fixture) => fixture.status === activeStatus);
  }, [activeStatus]);

  const topPick = useMemo(() => getDailySureSignal(dailyKey), [dailyKey]);

  const goHome = () => navigate(isNative ? { kind: "app" } : { kind: "home" }, isNative ? "/app" : "/");
  const showMenuButton = !(isNative && page.kind === "app") && page.kind !== "admin";

  if (showStartupSplash) {
    return (
      <div className={`app ${theme} native-app`}>
        <NativeStartupSplash logoSrc={logoSrc} appIconSrc={appIconSrc} />
      </div>
    );
  }

  return (
    <div className={`app ${theme} ${isNative ? "native-app" : "web-app"} ${page.kind === "admin" ? "admin-route" : ""}`}>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <button className="brand-button" onClick={goHome}>
            <img className="brand-logo" src={logoSrc} alt="BamSignal" />
          </button>
        </div>
        <nav>
          {isNative ? (
            <>
              <a href="/app" onClick={(event) => { event.preventDefault(); navigate({ kind: "app" }, "/app"); }}>
                <Goal size={18} /> User Dashboard
              </a>
            </>
          ) : (
            <>
              <a href="/#predictions" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#predictions"); }}>
                <Goal size={18} /> Football Predictions
              </a>
              <a href="/betting-tips" onClick={(event) => { event.preventDefault(); navigate({ kind: "tips" }, "/betting-tips"); }}>
                <Sparkles size={18} /> Betting Tips
              </a>
              <a href="/leagues" onClick={(event) => { event.preventDefault(); navigate({ kind: "leagues" }, "/leagues"); }}>
                <Trophy size={18} /> Leagues
              </a>
              <a href="/markets" onClick={(event) => { event.preventDefault(); navigate({ kind: "markets" }, "/markets"); }}>
                <BarChart3 size={18} /> Markets
              </a>
              <a href="/#apps" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#apps"); }}>
                <Smartphone size={18} /> Get the App
              </a>
              <a href="/app?auth=login" onClick={(event) => { event.preventDefault(); openMemberAuth("login"); }}>
                <LockKeyhole size={18} /> Member Login
              </a>
              <a href="/app?auth=signup" onClick={(event) => { event.preventDefault(); openMemberAuth("signup"); }}>
                <UserPlus size={18} /> Create Account
              </a>
              <a href="/contact" onClick={(event) => { event.preventDefault(); navigate({ kind: "contact" }, "/contact"); }}>
                <MessageCircle size={18} /> Contact
              </a>
              <a href="/#faq" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#faq"); }}>
                <ShieldCheck size={18} /> FAQs
              </a>
            </>
          )}
        </nav>
        <div className="sidebar-card">
          <span>Sure Signal</span>
          <strong>{topPick.confidence}%</strong>
          <p>
            {topPick.home} vs {topPick.away}: {topPick.pick}
          </p>
        </div>
      </aside>

      <div className="shell">
        <header className="topbar">
          {showMenuButton ? (
            <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
          ) : (
            <span className="topbar-spacer" aria-hidden="true" />
          )}
          <button className="topbar-brand" onClick={goHome} aria-label="Go to BamSignal home">
            <img className="topbar-logo" src={logoSrc} alt="BamSignal" />
          </button>
          {!isNative && page.kind !== "admin" && (
            <div className="topbar-auth-actions" aria-label="BamSignal member access">
              <button className="secondary-action" onClick={() => openMemberAuth("login")}>
                <LockKeyhole size={15} /> Login
              </button>
              <button className="primary-action neon-action" onClick={() => openMemberAuth("signup")}>
                <UserPlus size={15} /> Sign up
              </button>
            </div>
          )}
          <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </header>

        {page.kind === "home" ? (
          <HomePage
            activeStatus={activeStatus}
            filteredFixtures={filteredFixtures}
            topPick={topPick}
            setActiveStatus={setActiveStatus}
            navigate={navigate}
            adminContent={effectiveAdminContent}
          />
        ) : page.kind === "app" ? (
          <UserDashboard
            isAuthed={isAuthed}
            isPremium={isPremium}
            setIsAuthed={setIsAuthed}
            setIsPremium={setIsPremium}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            adminContent={effectiveAdminContent}
            isNative={isNative}
            authIntent={getAuthIntent()}
            navigate={navigate}
          />
        ) : page.kind === "admin" ? (
          <AdminPage isNative={isNative} navigate={navigate} adminContent={adminContent} setAdminContent={setAdminContent} />
        ) : page.kind === "contact" ? (
          <ContactPage navigate={navigate} adminContent={effectiveAdminContent} />
        ) : page.kind === "legal" ? (
          <LegalPage page={page} navigate={navigate} />
        ) : page.kind === "tips" ? (
          <BettingTipsPage navigate={navigate} />
        ) : page.kind === "markets" ? (
          <MarketsPage navigate={navigate} />
        ) : page.kind === "leagues" ? (
          <LeaguesPage navigate={navigate} />
        ) : (
          <DetailPage page={page} navigate={navigate} />
        )}

        <SiteFooter navigate={navigate} />
      </div>

      {menuOpen && (
        <>
          <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Dismiss menu backdrop" />
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </>
      )}
    </div>
  );
}

function NativeStartupSplash({ logoSrc, appIconSrc }: { logoSrc: string; appIconSrc: string }) {
  return (
    <main className="startup-splash" aria-label="BamSignal loading screen">
      <div className="startup-mark">
        <img src={appIconSrc} alt="" />
      </div>
      <img className="startup-logo" src={logoSrc} alt="BamSignal" />
      <div className="startup-copy">
        <strong>Daily football signals</strong>
        <span>Loading your BamSignal room</span>
      </div>
      <div className="startup-loader" aria-hidden="true"><i /></div>
    </main>
  );
}

function HomePage({
  activeStatus,
  filteredFixtures,
  topPick,
  setActiveStatus,
  navigate,
  adminContent
}: {
  activeStatus: Fixture["status"] | "All";
  filteredFixtures: Fixture[];
  topPick: Fixture;
  setActiveStatus: (status: Fixture["status"] | "All") => void;
  navigate: (page: Page, path?: string) => void;
  adminContent: AdminContent;
}) {
  const contactLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate({ kind: "contact" }, "/contact");
  };
  const copyTopBookingCode = async () => {
    const code = `SPORTY-${topPick.id}${topPick.confidence}`;
    if (Capacitor.getPlatform() !== "web") {
      await navigator.clipboard?.writeText(code);
      return;
    }
    navigate({ kind: "app" }, "/app?auth=login");
  };

  return (
    <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Football predictions</p>
              <h2>AI predictions for today's matches</h2>
              <p>
                BamSignal scans fixtures, team form, goals, corners, and market strength to show compact probability picks for each match.
              </p>
              <div className="hero-actions">
                <a className="primary-action" href="#predictions">View Predictions</a>
                <button className="secondary-action booking-shortcut" onClick={copyTopBookingCode}><ClipboardCheck size={18} /> {adminContent.bookingButtonText}</button>
                <a className="primary-action app-cta-pulse" href="#apps"><Smartphone size={18} /> Get the App</a>
              </div>
              <div className="web-member-card compact">
                <button className="secondary-action" onClick={() => navigate({ kind: "app" }, "/app?auth=login")}><LockKeyhole size={16} /> Login</button>
                <button className="primary-action neon-action" onClick={() => navigate({ kind: "app" }, "/app?auth=signup")}><UserPlus size={16} /> Sign up</button>
              </div>
              <div className="trust-mini-row">
                <span><LockKeyhole size={14} /> Secured by Paystack</span>
                <span><Send size={14} /> Join 4,500+ Nigerian punters on Telegram</span>
              </div>
            </div>
            <div className="signal-panel" aria-label="Top prediction">
              <div className="panel-topline">
                <span>{topPick.league}</span>
                <strong>{topPick.time}</strong>
              </div>
              <div className="teams">
                <span>{topPick.home}</span>
                <small>vs</small>
                <span>{topPick.away}</span>
              </div>
              <div className="compact-pick">
                <strong>{topPick.confidence}%</strong>
                <span>{topPick.pick}</span>
              </div>
              <div className="mini-grid">
                <span>BTTS <strong>{topPick.btts}%</strong></span>
                <span>O2.5 <strong>{topPick.over25}%</strong></span>
                <span>Corners <strong>{topPick.corners}%</strong></span>
              </div>
            </div>
          </section>

          <section className="stats-strip">
            <Stat icon={<Activity size={20} />} label="Average model hit rate" value="75%" />
            <Stat icon={<CalendarDays size={20} />} label="Prediction horizon" value="14 days" />
            <Stat icon={<BarChart3 size={20} />} label="Tracked markets" value="8+" />
            <Stat icon={<Trophy size={20} />} label="Covered competitions" value="25+" />
          </section>
          <SocialProofStrip />

          <section className="content-grid" id="predictions">
            <div className="section-head">
              <div>
                <p className="eyebrow">Football predictions</p>
                <h2>Today's BamSignal picks</h2>
              </div>
              <div className="segmented">
                {["All", "Live", "Today", "Tomorrow"].map((status) => (
                  <button
                    key={status}
                    className={activeStatus === status ? "active" : ""}
                    onClick={() => setActiveStatus(status as Fixture["status"] | "All")}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="fixture-list">
              {filteredFixtures.map((fixture, index) => (
                <FixtureCard key={fixture.id} fixture={fixture} locked={index > 0} bookingButtonText={adminContent.bookingButtonText} />
              ))}
            </div>
          </section>

          <section className="insight-stack" id="tips">
            <div className="info-panel">
              <p className="eyebrow">Betting tips</p>
              <h2>Find the green edge faster.</h2>
              <p>
                BamSignal highlights the strongest probability differences, so a clear favorite or safer total-goals angle is easier to spot without opening every match.
              </p>
              <div className="tip-row"><strong>Best pick</strong><span>{topPick.pick}</span></div>
              <div className="tip-row"><strong>Correct score lean</strong><span>{topPick.score}</span></div>
              <div className="tip-row"><strong>Safer market</strong><span>Double chance and over 1.5</span></div>
            </div>
            <EvidenceBoard />
            <div className="info-panel markets-panel" id="markets">
              <p className="eyebrow">Markets</p>
              <h2>Every fixture, multiple angles.</h2>
              <div className="chip-cloud">
                {marketDetails.map((market) => (
                  <a
                    key={market.slug}
                    href={`/markets/${market.slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate({ kind: "market", slug: market.slug }, `/markets/${market.slug}`);
                    }}
                  >
                    {market.name}
                    <ArrowRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="apps-band" id="apps">
            <div>
              <p className="eyebrow">Mobile apps</p>
              <h2>Use BamSignal anywhere.</h2>
              <p>Install the iOS or Android app for push alerts, fast VIP access, and match-day notifications.</p>
            </div>
            <div className="app-buttons">
              <button aria-label="Download on the App Store">
                <img src="/app-store-badge.svg" alt="Download on the App Store" />
              </button>
              <button aria-label="Get it on Google Play">
                <img src="/google-play-badge.svg" alt="Get it on Google Play" />
              </button>
            </div>
          </section>

          <DisclaimerStrip />

          <section className="league-band" id="leagues">
            <div>
              <p className="eyebrow">League coverage</p>
              <h2>European football focus with room to expand.</h2>
            </div>
            <div className="league-grid">
              {leagueDetails.map((league) => (
                <a
                  key={league.slug}
                  href={`/leagues/${league.slug}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ kind: "league", slug: league.slug }, `/leagues/${league.slug}`);
                  }}
                >
                  {league.name}
                  <ArrowRight size={14} />
                </a>
              ))}
            </div>
          </section>

          <section className="two-column" id="faq">
            <div className="info-panel">
              <p className="eyebrow">FAQs</p>
              <h2>Common questions</h2>
              <div className="accordion-list">
                {faq.map((item) => <FaqItem key={item.question} {...item} />)}
              </div>
            </div>
            <div className="info-panel contact-panel">
              <FootballNewsPanel adminContent={adminContent} compact />
              <AdSlots adminContent={adminContent} />
              <p className="eyebrow">Contact</p>
              <h2>Talk to BamSignal</h2>
              <p>Need support, partnerships, app help, or VIP guidance? Reach us through the official channels or use the contact page.</p>
              <a className="primary-action contact-page-link" href="/contact" onClick={contactLink}>
                <MessageCircle size={16} /> Open contact page
              </a>
              <div className="social-grid" aria-label="BamSignal social links">
                <a href="https://www.tiktok.com/@bamsignal" target="_blank" rel="noreferrer">
                  <Music2 size={18} />
                  <span>TikTok</span>
                  <small>@bamsignal</small>
                </a>
                <a href="https://www.instagram.com/officialbamsignal/" target="_blank" rel="noreferrer">
                  <Instagram size={18} />
                  <span>Instagram</span>
                  <small>@officialbamsignal</small>
                </a>
                <a href="https://x.com/bamsignalhq" target="_blank" rel="noreferrer">
                  <Twitter size={18} />
                  <span>X</span>
                  <small>@bamsignalhq</small>
                </a>
                <a href="https://www.youtube.com/@officialbamsignal" target="_blank" rel="noreferrer">
                  <Youtube size={18} />
                  <span>YouTube</span>
                  <small>@officialbamsignal</small>
                </a>
                <a href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer">
                  <Send size={18} />
                  <span>Telegram</span>
                  <small>official channel</small>
                </a>
                <a href="https://whatsapp.com/channel/0029Vb7wB96DZ4LdE2Nhlp3A" target="_blank" rel="noreferrer">
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                  <small>official channel</small>
                </a>
              </div>
              <p className="responsible">
                18+ only. Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.
              </p>
            </div>
          </section>
    </main>
  );
}

function EvidenceBoard() {
  const wins = evidenceBoard.filter((item) => item.status === "Won").length;
  const hitRate = Math.round((wins / evidenceBoard.length) * 100);

  return (
    <section className="evidence-board" aria-label="BamSignal evidence board">
      <div className="evidence-head">
        <div>
          <p className="eyebrow">Evidence board</p>
          <h2>Past games, clean results.</h2>
          <p>Use this board to audit BamSignal picks. Wins and losses stay visible so users can judge consistency before joining VIP.</p>
        </div>
        <div className="evidence-score">
          <strong>{hitRate}%</strong>
          <span>recent hit rate</span>
        </div>
      </div>
      <div className="evidence-list">
        {evidenceBoard.map((item) => (
          <article className="evidence-row" key={item.match}>
            <div>
              <span className={`result-dot ${item.status.toLowerCase()}`}>{item.status}</span>
              <h3>{item.match}</h3>
              <p>{item.pick}</p>
            </div>
            <div className="evidence-meta">
              <span>{item.tier}</span>
              <strong>{item.odds}</strong>
              <small>{item.result}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SocialProofStrip() {
  return (
    <section className="tribe-strip" aria-label="BamSignal community proof">
      <div>
        <p className="eyebrow">Social proof</p>
        <h2>Join 4,500+ Nigerian punters tracking signals daily.</h2>
      </div>
      <a className="primary-action" href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer">
        <Send size={16} /> Join the Telegram tribe
      </a>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg className="provider-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285f4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.4-4.5 3.4-7.7Z" />
      <path fill="#34a853" d="M12 23c2.8 0 5.2-.9 6.9-2.6l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 20.7 7.9 23 12 23Z" />
      <path fill="#fbbc05" d="M6.2 14.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.8H2.7C2 9.2 1.6 10.8 1.6 12.5s.4 3.3 1.1 4.7l3.5-2.7Z" />
      <path fill="#ea4335" d="M12 6.2c1.5 0 2.9.5 4 1.6l3-3C17.2 3 14.8 2 12 2 7.9 2 4.4 4.3 2.7 7.8l3.5 2.7C7 8 9.3 6.2 12 6.2Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg className="provider-logo apple-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.7 12.8c0-2.5 2.1-3.7 2.2-3.8-1.2-1.8-3-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.8-4Zm-2.5-7.4c.7-.9 1.2-2.1 1.1-3.3-1.1 0-2.4.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.5Z" />
    </svg>
  );
}

function UserDashboard({
  isAuthed,
  isPremium,
  setIsAuthed,
  setIsPremium,
  userProfile,
  setUserProfile,
  adminContent,
  isNative,
  authIntent,
  navigate
}: {
  isAuthed: boolean;
  isPremium: boolean;
  setIsAuthed: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (value: UserProfile) => void;
  adminContent: AdminContent;
  isNative: boolean;
  authIntent: AuthIntent;
  navigate: (page: Page, path?: string) => void;
}) {
  const initialDeviceBinding = useMemo(() => loadDeviceBinding(), []);
  const initialAuthMode = useMemo<AuthMode>(() => {
    if (authIntent === "signup") return "signup";
    if (authIntent === "reset") return "reset";
    return initialDeviceBinding ? "unlock" : "login";
  }, [authIntent, initialDeviceBinding]);
  const [deviceBinding, setDeviceBinding] = useState<DeviceBinding | null>(initialDeviceBinding);
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("home");
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", pin: "" });
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(null);
  const [pendingLoginProfile, setPendingLoginProfile] = useState<UserProfile | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [verifiedEmails, setVerifiedEmails] = useState<string[]>([userProfile.email]);
  const [pinInput, setPinInput] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [visibleSecrets, setVisibleSecrets] = useState({
    loginPassword: false,
    signupPassword: false,
    signupConfirm: false,
    signupPin: false,
    unlockPin: false,
    setupPin: false
  });
  const [subscriptionUntil, setSubscriptionUntil] = useState<Date | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const freemiumRoomGames = useMemo(
    () => adminContent.games.filter((game) => game.tier === "freemium" && game.odds < 1.5).slice(0, 2),
    [adminContent.games]
  );
  const vipRoomGames = useMemo(
    () => adminContent.games.filter((game) => game.tier === "vip"),
    [adminContent.games]
  );
  const wins = profileGameHistory.filter((game) => game.status === "Won").length;
  const losses = profileGameHistory.length - wins;
  const hitRate = Math.round((wins / profileGameHistory.length) * 100);
  const subscriptionLabel = subscriptionUntil
    ? subscriptionUntil.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
    : "Not active";
  const isWebAppRoute = Capacitor.getPlatform() === "web";
  const vipPlans = useMemo(() => [
    { id: "weekly", label: "Weekly VIP", price: formatNaira(adminContent.vipWeeklyPrice), days: 7, link: adminContent.vipWeeklyLink },
    { id: "monthly", label: "Monthly VIP", price: formatNaira(adminContent.vipMonthlyPrice), days: 30, link: adminContent.vipMonthlyLink }
  ], [adminContent.vipMonthlyLink, adminContent.vipMonthlyPrice, adminContent.vipWeeklyLink, adminContent.vipWeeklyPrice]);
  const activeAuthBanner = useMemo(() => {
    const isWeekend = new Date().getDay() === 5 || new Date().getDay() === 6 || new Date().getDay() === 0;
    if (isWeekend && adminContent.loginBanners.weekendSpecial.active) return adminContent.loginBanners.weekendSpecial;
    return deviceBinding ? adminContent.loginBanners.returning : adminContent.loginBanners.firstTimer;
  }, [adminContent.loginBanners, deviceBinding]);
  const handleBannerAction = (url: string) => {
    if (url === "signup") {
      setAuthMode("signup");
      return;
    }
    if (url === "login") {
      setAuthMode(deviceBinding ? "unlock" : "login");
      return;
    }
    if (url === "vip") {
      setAuthMode("login");
      setAuthMessage("Log in first, then open the VIP tab to reveal the current offer.");
      return;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  const toggleSecret = (key: keyof typeof visibleSecrets) => {
    setVisibleSecrets((current) => ({ ...current, [key]: !current[key] }));
  };
  const secretInputType = (key: keyof typeof visibleSecrets) => visibleSecrets[key] ? "text" : "password";

  useEffect(() => {
    if (isAuthed || !authIntent) return;
    if (authIntent === "signup") {
      setAuthMode("signup");
      return;
    }
    if (authIntent === "reset") {
      setAuthMode("reset");
      return;
    }
    setAuthMode(deviceBinding ? "unlock" : "login");
  }, [authIntent, deviceBinding, isAuthed]);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted || !data.session?.user || isAuthed) return;
      const user = data.session.user;
      beginTrustedSession({
        name: String(user.user_metadata?.name || user.email?.split("@")[0] || "BamSignal User"),
        email: user.email || userProfile.email,
        phone: String(user.user_metadata?.phone || userProfile.phone)
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user || isAuthed) return;
      const user = session.user;
      beginTrustedSession({
        name: String(user.user_metadata?.name || user.email?.split("@")[0] || "BamSignal User"),
        email: user.email || userProfile.email,
        phone: String(user.user_metadata?.phone || userProfile.phone)
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isAuthed, userProfile.email, userProfile.phone]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (subscriptionUntil && subscriptionUntil.getTime() <= Date.now()) {
        setIsPremium(false);
        setSubscriptionUntil(null);
        setAuthMessage("Your VIP subscription has ended. You are now back in the freemium room.");
      }
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [subscriptionUntil, setIsPremium]);

  const normalizePhone = (value: string) => value.replace(/\D/g, "").replace(/^234/, "");
  const isPhoneIdentifier = (value: string) => {
    const digits = normalizePhone(value);
    return digits.length >= 10 && !value.includes("@");
  };
  const resolveLoginProfile = (identifier: string): UserProfile => {
    if (deviceBinding && (identifier.toLowerCase() === deviceBinding.email || normalizePhone(identifier) === normalizePhone(deviceBinding.phone))) {
      return { name: deviceBinding.name, email: deviceBinding.email, phone: deviceBinding.phone };
    }
    return isPhoneIdentifier(identifier)
      ? { ...userProfile, phone: normalizePhone(identifier) }
      : { ...userProfile, email: identifier.trim().toLowerCase() };
  };
  const beginTrustedSession = (profile: UserProfile) => {
    const nextProfile = { ...profile, phone: normalizePhone(profile.phone) || profile.phone };
    setUserProfile(nextProfile);
    setIsAuthed(true);
    setAuthMessage("Secure login enabled. Next time, use your 6-digit PIN or your phone Face ID, PIN, or pattern.");
  };
  const bindDevice = (profile: UserProfile, pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setAuthMessage("Create a 6-digit BamSignal PIN.");
      return;
    }
    const binding: DeviceBinding = {
      ...profile,
      phone: normalizePhone(profile.phone) || profile.phone,
      pin,
      deviceId: `bamsignal-${Date.now()}`
    };
    window.localStorage.setItem("bamsignal-device-binding", JSON.stringify(binding));
    setDeviceBinding(binding);
    beginTrustedSession(binding);
  };
  const sendEmailOtp = async (profile: UserProfile, nextMode: AuthMode) => {
    if (supabase && profile.email.includes("@")) {
      const { error } = await supabase.auth.signInWithOtp({
        email: profile.email,
        options: {
          shouldCreateUser: false
        }
      });
      if (error) {
        setAuthMessage(error.message);
        return;
      }
      setVerificationCode("");
      setVerificationInput("");
      setAuthMode(nextMode);
      setAuthMessage(`6-digit email OTP sent to ${profile.email}.`);
      return;
    }

    if (!supabase && !demoOtpEnabled) {
      setAuthMessage("Email OTP is being activated. Please try again shortly.");
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setVerificationCode(code);
    setVerificationInput("");
    setAuthMode(nextMode);
    setAuthMessage(`6-digit login OTP sent to ${profile.email}. Test code: ${code}`);
  };
  const signIn = async () => {
    const identifier = loginForm.identifier.trim();
    if (!identifier || !loginForm.password) {
      setAuthMessage("Enter your phone number or email and password.");
      return;
    }
    const profile = resolveLoginProfile(identifier);
    if (supabase && identifier.includes("@")) {
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: loginForm.password
      });
      if (error) {
        setAuthMessage(error.message);
        return;
      }
    }
    setPendingLoginProfile(profile);
    await sendEmailOtp(profile, "loginOtp");
  };
  const verifyLoginEmailOtp = async () => {
    if (!pendingLoginProfile) {
      setAuthMode("login");
      setAuthMessage("Enter your login details first.");
      return;
    }
    if (supabase && pendingLoginProfile.email.includes("@")) {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingLoginProfile.email,
        token: verificationInput,
        type: "magiclink"
      });
      if (error) {
        setAuthMessage(error.message);
        return;
      }
    } else if (verificationInput !== verificationCode) {
      setAuthMessage("That email OTP is not correct. Check your email and try again.");
      return;
    }
    setVerifiedEmails((emails) => Array.from(new Set([...emails, pendingLoginProfile.email])));
    if (deviceBinding && (pendingLoginProfile.email === deviceBinding.email || normalizePhone(pendingLoginProfile.phone) === normalizePhone(deviceBinding.phone))) {
      beginTrustedSession(deviceBinding);
      return;
    }
    setSetupPin("");
    setAuthMode("pinSetup");
    setAuthMessage("Email OTP confirmed. Create your 6-digit PIN to bind this phone.");
  };
  const socialSignIn = async (provider: "Google" | "Apple") => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "Google" ? "google" : "apple",
        options: {
          redirectTo: `${window.location.origin}/app?auth=login`
        }
      });
      if (error) setAuthMessage(error.message);
      return;
    }

    const profile = deviceBinding ?? userProfile;
    if (!deviceBinding) {
      setPendingLoginProfile(profile);
      setSetupPin("");
      setAuthMode("pinSetup");
      setAuthMessage(`${provider} connected. Create your 6-digit PIN to bind this phone.`);
      return;
    }
    beginTrustedSession(profile);
    setAuthMessage(`${provider} sign-in connected. Opening your BamSignal room.`);
  };
  const unlockWithPin = () => {
    if (!deviceBinding) {
      setAuthMode("login");
      return;
    }
    if (pinInput !== deviceBinding.pin) {
      setAuthMessage("That PIN is not correct.");
      return;
    }
    beginTrustedSession(deviceBinding);
  };
  const unlockWithNativeAuth = () => {
    if (!deviceBinding) {
      setAuthMode("login");
      return;
    }
    beginTrustedSession(deviceBinding);
    setAuthMessage("Phone authentication accepted. Opening your BamSignal room.");
  };
  const useAnotherAccount = () => {
    setPinInput("");
    setLoginForm({ identifier: "", password: "" });
    setPendingLoginProfile(null);
    setAuthMode("login");
    setAuthMessage("");
  };

  const signUp = async () => {
    if (!signupForm.name || !signupForm.email || !signupForm.phone || !signupForm.password || !signupForm.pin) {
      setAuthMessage("Please fill in every signup field.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthMessage("The two passwords do not match.");
      return;
    }
    if (!/^\d{6}$/.test(signupForm.pin)) {
      setAuthMessage("Your BamSignal PIN must be exactly 6 digits.");
      return;
    }
    if (!supabase && !demoOtpEnabled) {
      setAuthMessage("Email signup is being activated. Please try again shortly.");
      return;
    }
    const nextProfile = { name: signupForm.name, email: signupForm.email.trim().toLowerCase(), phone: signupForm.phone };
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: nextProfile.email,
        password: signupForm.password,
        options: {
          data: {
            name: nextProfile.name,
            phone: normalizePhone(nextProfile.phone) || nextProfile.phone
          },
          emailRedirectTo: `${window.location.origin}/app?auth=login`
        }
      });
      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setUserProfile(nextProfile);
      if (data.session?.user) {
        setVerifiedEmails((emails) => Array.from(new Set([...emails, nextProfile.email])));
        bindDevice(nextProfile, signupForm.pin);
        setAuthMessage("Account created. Welcome to your BamSignal room.");
        return;
      }

      setPendingSignup(nextProfile);
      setVerificationCode("");
      setVerificationInput("");
      setAuthMode("verify");
      setAuthMessage(`Check ${nextProfile.email}. Enter the 6-digit code if shown, or tap the confirmation link in the email.`);
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingSignup(nextProfile);
    setVerificationCode(code);
    setVerificationInput("");
    setAuthMode("verify");
    setAuthMessage(`Verification code sent to ${nextProfile.email}. Test code: ${code}`);
  };

  const verifySignup = async () => {
    if (!pendingSignup) {
      setAuthMode("signup");
      setAuthMessage("Create your account first so we can send a verification code.");
      return;
    }
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingSignup.email,
        token: verificationInput,
        type: "signup"
      });
      if (error) {
        setAuthMessage(error.message);
        return;
      }
    } else if (verificationInput !== verificationCode) {
      setAuthMessage("That code is not correct. Check your email and try again.");
      return;
    }
    setUserProfile(pendingSignup);
    setVerifiedEmails((emails) => Array.from(new Set([...emails, pendingSignup.email])));
    bindDevice(pendingSignup, signupForm.pin);
  };
  const finishPinSetup = () => {
    const profile = pendingLoginProfile ?? userProfile;
    bindDevice(profile, setupPin);
  };

  const confirmVipPayment = (days = 30, label = "monthly") => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    setSubscriptionUntil(expiry);
    setIsPremium(true);
    setAuthMessage(`${label} payment verified. VIP is active until ${expiry.toLocaleDateString("en-NG")}.`);
  };

  const sendReset = async () => {
    if (supabase && resetEmail) {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/app?auth=reset`
      });
      setAuthMessage(error ? error.message : `Password reset link sent to ${resetEmail}.`);
      return;
    }
    setAuthMessage(resetEmail ? `Password reset link sent to ${resetEmail}.` : "Enter your email to receive a reset link.");
  };

  if (!isAuthed) {
    const showDynamicBanner = authMode === "login" || authMode === "reset" || authMode === "unlock";
    return (
      <main className="auth-main">
        <section className="auth-shell">
          {!isNative && (
            <button className="back-link" onClick={() => navigate({ kind: "home" })}>
              <ArrowLeft size={16} /> Back to website
            </button>
          )}
          <div className="auth-copy">
            {(authMode === "login" || authMode === "unlock") && <span className="auth-secure-badge"><ShieldCheck size={14} /> Secure member access</span>}
            <h2>{authMode === "signup" ? "Create account" : authMode === "verify" ? "Verify email" : authMode === "loginOtp" ? "Authorize login" : authMode === "pinSetup" ? "Create your PIN" : authMode === "unlock" ? "Welcome back" : authMode === "reset" ? "Reset access" : "Signals start here"}</h2>
          </div>

          {showDynamicBanner && <AuthDynamicBanner banner={activeAuthBanner} position="top" onAction={handleBannerAction} />}

          {authMode === "unlock" && deviceBinding && (
            <div className="auth-form">
              <div className="bound-account-card">
                <span>Bound to this phone</span>
                <strong>{deviceBinding.name}</strong>
                <small>{deviceBinding.email || deviceBinding.phone}</small>
              </div>
              <label>6-digit PIN
                <span className="secret-input-wrap">
                  <input value={pinInput} onChange={(event) => setPinInput(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" type={secretInputType("unlockPin")} placeholder="Enter your PIN" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("unlockPin")} aria-label={visibleSecrets.unlockPin ? "Hide PIN" : "Show PIN"}>
                    {visibleSecrets.unlockPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-action neon-action" onClick={unlockWithPin}><ShieldCheck size={16} /> Unlock with PIN</button>
              {!isWebAppRoute && <button className="secondary-action" onClick={unlockWithNativeAuth}><ShieldCheck size={16} /> Use Face ID / Phone PIN / Pattern</button>}
              <div className="auth-switch-row">
                <button className="text-action create-link" onClick={useAnotherAccount}>Use another account</button>
                <button className="text-action" onClick={() => setAuthMode("reset")}>Forgot password?</button>
              </div>
            </div>
          )}

          {authMode === "login" && (
            <div className="auth-form">
              <div className="auth-trust-row" aria-label="BamSignal account protection">
                <span><ShieldCheck size={14} /> Encrypted login</span>
                <span><CreditCard size={14} /> Paystack-ready</span>
                <span><Crown size={14} /> VIP protected</span>
              </div>
              <label>Phone number or email<input value={loginForm.identifier} onChange={(event) => setLoginForm({ ...loginForm, identifier: event.target.value })} type="text" inputMode="email" placeholder="Phone number or email" /></label>
              <label>Password
                <span className="secret-input-wrap">
                  <input value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} type={secretInputType("loginPassword")} placeholder="Your password" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("loginPassword")} aria-label={visibleSecrets.loginPassword ? "Hide password" : "Show password"}>
                    {visibleSecrets.loginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-action neon-action" onClick={signIn}><UserPlus size={16} /> Login securely</button>
              {deviceBinding && <button className="secondary-action" onClick={() => setAuthMode("unlock")}><ShieldCheck size={16} /> Use bound-device login</button>}
              <div className="auth-social-grid">
                <button onClick={() => socialSignIn("Google")}><GoogleMark /> Continue with Google</button>
                <button onClick={() => socialSignIn("Apple")}><AppleMark /> Continue with Apple</button>
              </div>
              <div className="auth-switch-row">
                <button className="text-action create-link" onClick={() => setAuthMode("signup")}>Create account</button>
                <button className="text-action" onClick={() => setAuthMode("reset")}>Forgot password?</button>
              </div>
            </div>
          )}

          {authMode === "signup" && (
            <div className="auth-form signup-form">
              <label>Name<input value={signupForm.name} onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })} placeholder="Full name" /></label>
              <label>Email<input value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} type="email" placeholder="you@example.com" /></label>
              <label>Phone number<input value={signupForm.phone} onChange={(event) => setSignupForm({ ...signupForm, phone: event.target.value })} type="tel" placeholder="Phone number" /></label>
              <label>Password
                <span className="secret-input-wrap">
                  <input value={signupForm.password} onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })} type={secretInputType("signupPassword")} placeholder="Create password" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("signupPassword")} aria-label={visibleSecrets.signupPassword ? "Hide password" : "Show password"}>
                    {visibleSecrets.signupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <label>Confirm password
                <span className="secret-input-wrap">
                  <input value={signupForm.confirmPassword} onChange={(event) => setSignupForm({ ...signupForm, confirmPassword: event.target.value })} type={secretInputType("signupConfirm")} placeholder="Repeat password" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("signupConfirm")} aria-label={visibleSecrets.signupConfirm ? "Hide password" : "Show password"}>
                    {visibleSecrets.signupConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <label>6-digit app PIN
                <span className="secret-input-wrap">
                  <input value={signupForm.pin} onChange={(event) => setSignupForm({ ...signupForm, pin: event.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" type={secretInputType("signupPin")} placeholder="Create 6-digit PIN" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("signupPin")} aria-label={visibleSecrets.signupPin ? "Hide PIN" : "Show PIN"}>
                    {visibleSecrets.signupPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-action neon-action" onClick={signUp}><ShieldCheck size={16} /> Create secure account</button>
              <div className="auth-switch-row">
                <button className="text-action" onClick={() => setAuthMode("login")}>Already have an account? Login</button>
              </div>
            </div>
          )}

          {authMode === "verify" && (
            <div className="auth-form">
              <label>Email<input value={pendingSignup?.email ?? ""} readOnly /></label>
              <label>Verification code<input value={verificationInput} onChange={(event) => setVerificationInput(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter 6-digit code" /></label>
              <button className="primary-action neon-action" onClick={verifySignup}><ShieldCheck size={16} /> Verify and continue</button>
              <p className="auth-hint">If your email has a confirmation link instead of a code, tap the link and BamSignal will open your account automatically.</p>
              <div className="auth-switch-row">
                <button className="text-action" onClick={signUp}>Resend code</button>
                <button className="text-action" onClick={() => setAuthMode("login")}>Back to login</button>
              </div>
            </div>
          )}

          {authMode === "loginOtp" && (
            <div className="auth-form">
              <label>Email<input value={pendingLoginProfile?.email ?? ""} readOnly /></label>
              <label>6-digit email OTP<input value={verificationInput} onChange={(event) => setVerificationInput(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter email OTP" /></label>
              <button className="primary-action neon-action" onClick={verifyLoginEmailOtp}><ShieldCheck size={16} /> Authorize this device</button>
              <div className="auth-switch-row">
                <button className="text-action" onClick={() => pendingLoginProfile && sendEmailOtp(pendingLoginProfile, "loginOtp")}>Resend email OTP</button>
                <button className="text-action" onClick={() => setAuthMode("login")}>Back to login</button>
              </div>
            </div>
          )}

          {authMode === "pinSetup" && (
            <div className="auth-form">
              <div className="bound-account-card">
                <span>Account verified</span>
                <strong>{(pendingLoginProfile ?? userProfile).name}</strong>
                <small>{(pendingLoginProfile ?? userProfile).email || (pendingLoginProfile ?? userProfile).phone}</small>
              </div>
              <label>6-digit BamSignal PIN
                <span className="secret-input-wrap">
                  <input value={setupPin} onChange={(event) => setSetupPin(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" type={secretInputType("setupPin")} placeholder="Create 6-digit PIN" />
                  <button type="button" className="secret-toggle" onClick={() => toggleSecret("setupPin")} aria-label={visibleSecrets.setupPin ? "Hide PIN" : "Show PIN"}>
                    {visibleSecrets.setupPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <button className="primary-action neon-action" onClick={finishPinSetup}><ShieldCheck size={16} /> Bind phone and enter</button>
              <button className="secondary-action" onClick={() => setAuthMode("login")}><ArrowLeft size={16} /> Use another account</button>
            </div>
          )}

          {authMode === "reset" && (
            <div className="auth-form">
              <label>Email<input value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} type="email" placeholder="you@example.com" /></label>
              <button className="primary-action neon-action" onClick={sendReset}><Send size={16} /> Send reset link</button>
              <div className="auth-switch-row">
                <button className="text-action" onClick={() => setAuthMode("login")}>Back to login</button>
                <button className="text-action" onClick={() => setAuthMode("signup")}>Create account</button>
              </div>
            </div>
          )}

          {authMessage && <p className="auth-message">{authMessage}</p>}
          {showDynamicBanner && <AuthDynamicBanner banner={activeAuthBanner} position="bottom" onAction={handleBannerAction} />}
        </section>
      </main>
    );
  }

  const renderManagedGame = (game: AdminGame, locked = false) => {
    const visibleCodes = !locked && (game.tier === "vip" || game.showBookingCodes);
    const appCodes = game.bookingCodes.filter((entry) => entry.code.trim() && (game.tier === "vip" ? entry.premiumApp : entry.regularApp));
    return (
      <div className={`room-pick managed ${locked ? "locked" : ""}`} key={game.id}>
        <div className="room-pick-top">
          <strong>{game.confidence}%</strong>
          <em>{game.odds.toFixed(2)} odds</em>
        </div>
        <span>{game.match}</span>
        <small>{game.league}</small>
        <small className={locked ? "blurred-tip" : ""}>{game.pick}</small>
        {visibleCodes && appCodes.length ? (
          <div className="booking-code-list">
            {appCodes.map((entry) => (
              <button key={`${game.id}-${entry.id}`} onClick={() => navigator.clipboard?.writeText(entry.code)}>
                <ClipboardCheck size={13} /> {bookmakerLabel(entry.bookmaker)} <strong>{entry.code}</strong>
              </button>
            ))}
          </div>
        ) : (
          <small className="code-locked">{game.tier === "freemium" ? "Booking code hidden by admin" : "VIP booking codes unlock after payment"}</small>
        )}
      </div>
    );
  };

  return (
    <main className="dashboard-main">
      <div className="dashboard-tabs">
        {[
          { tab: "home", label: "Home", icon: <Home size={16} /> },
          { tab: "vip", label: "VIP", icon: <Crown size={16} /> },
          { tab: "profile", label: "Profile", icon: <Users size={16} /> }
        ].map(({ tab, label, icon }) => (
          <button
            key={tab}
            className={`dashboard-tab ${tab} ${dashboardTab === tab ? "active" : ""}`}
            onClick={() => setDashboardTab(tab as DashboardTab)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {dashboardTab === "home" && (
        <section className="member-app-panel">
          <div className="member-copy">
            <p className="eyebrow">Current predictions</p>
            <h2>Today&apos;s strongest signals</h2>
            <p>Start with the free picks, then unlock the VIP room when your Paystack payment is verified.</p>
          </div>
          <div className="room-grid">
            {freemiumRoomGames.map((game) => renderManagedGame(game))}
          </div>
          <div className="free-picks-strip">
            <span className="room-label">Two low-odd freemium games below 1.50</span>
            {freemiumRoomGames.map((game) => renderManagedGame(game))}
          </div>
        </section>
      )}

      {dashboardTab === "vip" && (
        <section className={`room-card premium-room ${isPremium ? "open" : "locked"}`}>
          <span className="room-label">VIP premium games</span>
          <h3>{isPremium ? "Premium games unlocked" : "Payment required"}</h3>
          {!isPremium && (
            <>
              <div className="paystack-checkout">
                <div className="plan-grid">
                  {vipPlans.map((plan) => (
                    <article className="vip-plan-card" key={plan.id}>
                      <p className="eyebrow">Paystack checkout</p>
                      <h3>{plan.label}</h3>
                      <strong>{plan.price}</strong>
                      <small>{plan.days} days of VIP games, booking codes, premium app room, and Telegram VIP access.</small>
                      <a className="primary-action neon-action" href={plan.link} target="_blank" rel="noreferrer"><CreditCard size={16} /> Pay {plan.price}</a>
                      <button className="secondary-action" onClick={() => confirmVipPayment(plan.days, plan.label)}><ShieldCheck size={16} /> Verify {plan.id} payment</button>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
          {isPremium && (
            <div className="subscription-card">
              <ShieldCheck size={16} />
              <span>VIP active until {subscriptionLabel}. When it ends, the app returns you to freemium automatically.</span>
            </div>
          )}
          <div className="vip-special-grid">
            <article>
              <Crown size={18} />
              <strong>VIP app room</strong>
              <span>High-odd signals, confidence notes, and booking codes stay inside your premium account.</span>
            </article>
            <article>
              <Send size={18} />
              <strong>Telegram VIP room</strong>
              <span>Instant premium drops and quick in-play alerts appear for verified members only.</span>
            </article>
          </div>
          {vipRoomGames.map((game) => renderManagedGame(game, !isPremium))}
          {isPremium ? (
            <a className="vip-join" href="https://t.me/+U5i6lKAUDtZkODIx" target="_blank" rel="noreferrer"><Send size={16} /> Join VIP Telegram room</a>
          ) : (
            <span className="vip-join muted-join"><LockKeyhole size={16} /> VIP Telegram link appears after payment</span>
          )}
        </section>
      )}

      {dashboardTab === "profile" && (
        <section className="profile-panel">
          <div className="profile-community-card">
            <div className="profile-photo-frame">
              <div className="profile-photo">{userProfile.name.split(" ").map((part) => part[0]).slice(0, 2).join("") || "BS"}</div>
              <button className="photo-action">Show profile image</button>
            </div>
            <div className="profile-identity">
              <span className="auth-secure-badge"><Users size={14} /> BamSignal community</span>
              <h2>{userProfile.name}</h2>
              <p>{isPremium ? "VIP member sharing high-odd wins with the room." : "Freemium member building a visible signal record."}</p>
              <div className="member-badges">
                <span>{isPremium ? "VIP Premium" : "Freemium"}</span>
                <span>Signal record visible</span>
                <span>Member since 2026</span>
              </div>
            </div>
          </div>

          <div className="profile-score-grid">
            <div><strong>{profileGameHistory.length}</strong><span>Games played</span></div>
            <div className="won"><strong>{wins}</strong><span>Won</span></div>
            <div className="lost"><strong>{losses}</strong><span>Lost</span></div>
            <div><strong>{hitRate}%</strong><span>Hit rate</span></div>
          </div>

          <div className="profile-fintech-grid">
            <article className="profile-wallet-card">
              <div>
                <span>Membership wallet</span>
                <strong>{isPremium ? "VIP active" : "Freemium active"}</strong>
              </div>
              <Crown size={18} />
              <small>{isPremium ? `Renews or expires on ${subscriptionLabel}` : "Upgrade weekly for ₦950 or monthly for ₦2,950."}</small>
            </article>
            <article className="profile-wallet-card">
              <div>
                <span>Security status</span>
                <strong>{deviceBinding ? "Device bound" : "OTP required"}</strong>
              </div>
              <ShieldCheck size={18} />
              <small>New phones must pass password plus email OTP before PIN or phone auth is enabled.</small>
            </article>
            <article className="profile-wallet-card">
              <div>
                <span>Community rank</span>
                <strong>Signal Builder</strong>
              </div>
              <Users size={18} />
              <small>Your visible record helps the room trust your picks and celebrate wins.</small>
            </article>
          </div>

          <div className="profile-grid">
            <span><Users size={16} /><small>Name</small><strong>{userProfile.name}</strong></span>
            <span><Send size={16} /><small>Email</small><strong>{userProfile.email}</strong></span>
            <span><Smartphone size={16} /><small>Phone</small><strong>{userProfile.phone}</strong></span>
            <span><Crown size={16} /><small>Plan</small><strong>{isPremium ? "VIP Premium" : "Freemium"}</strong></span>
          </div>

          <div className="profile-history-card">
            <div className="profile-history-head">
              <div>
                <p className="eyebrow">Played games</p>
                <h3>Public signal record</h3>
              </div>
              <span>{wins}W / {losses}L</span>
            </div>
            <div className="played-games-list">
              {profileGameHistory.map((game) => (
                <article className="played-game" key={`${game.teams}-${game.play}`}>
                  <div>
                    <strong>{game.teams}</strong>
                    <span>{game.league}</span>
                  </div>
                  <small>{game.play}</small>
                  <em className={game.status.toLowerCase()}>{game.status}</em>
                </article>
              ))}
            </div>
          </div>

          <div className="profile-actions-grid">
            <button className="secondary-action"><Bell size={16} /> Notification settings</button>
            <button className="secondary-action" onClick={() => setDashboardTab("vip")}><CreditCard size={16} /> Manage VIP</button>
            <a className="secondary-action" href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer"><Send size={16} /> Telegram support</a>
            <button className="secondary-action"><ShieldCheck size={16} /> Security login</button>
            <a className="secondary-action danger-action" href="/legal/account-deletion"><ShieldCheck size={16} /> Request account deletion</a>
          </div>

          <button className="secondary-action" onClick={() => { setIsAuthed(false); setIsPremium(false); }}>
            Log out
          </button>
        </section>
      )}
    </main>
  );
}

function FootballNewsPanel({ adminContent, compact = false }: { adminContent: AdminContent; compact?: boolean }) {
  const hasNews = Boolean(adminContent.newsTitle.trim() || adminContent.newsSummary.trim());
  return (
    <section className={`football-news ${compact ? "compact" : ""}`}>
      <div>
        <p className="eyebrow">Football news</p>
        <h2>{hasNews ? adminContent.newsTitle || "BamSignal football update" : "Football news room ready."}</h2>
        <p>
          {hasNews
            ? adminContent.newsSummary || "The admin news feed is live. Add the full RapidAPI story summary from the command center."
            : "RapidAPI news will appear here when the admin feed is connected. Until then, this block stays clean and uncluttered."}
        </p>
      </div>
      {hasNews && adminContent.newsUrl ? (
        <a className="secondary-action" href={adminContent.newsUrl} target="_blank" rel="noreferrer">
          Read update <ArrowRight size={15} />
        </a>
      ) : null}
      {hasNews && adminContent.newsSource ? <span className="news-source">Source: {adminContent.newsSource}</span> : null}
    </section>
  );
}

function AuthDynamicBanner({
  banner,
  position,
  onAction
}: {
  banner: LoginBanner;
  position: "top" | "bottom";
  onAction: (url: string) => void;
}) {
  return (
    <aside className={`auth-dynamic-banner ${position}`}>
      {banner.imageUrl ? <img src={banner.imageUrl} alt="" /> : <span className="banner-mark"><Sparkles size={18} /></span>}
      <div>
        <small>{position === "top" ? "This week on BamSignal" : "Admin-controlled weekly message"}</small>
        <strong>{banner.headline}</strong>
        <p>{banner.body}</p>
      </div>
      {banner.actionText ? (
        <button className="text-action create-link" onClick={() => onAction(banner.actionUrl)}>
          {banner.actionText}
        </button>
      ) : null}
    </aside>
  );
}

function AdSlots({ adminContent }: { adminContent: AdminContent }) {
  const links = adminContent.adLinks.map((link) => link.trim()).filter(Boolean).slice(0, 5);
  if (!links.length) return null;

  return (
    <div className="ad-slot-grid" aria-label="BamSignal partner ads">
      {links.map((link, index) => (
        <a className="ad-slot" href={link} key={`${link}-${index}`} target="_blank" rel="noreferrer">
          <span>Partner slot {index + 1}</span>
          <strong>Open offer</strong>
        </a>
      ))}
    </div>
  );
}

function DisclaimerStrip() {
  return (
    <section className="disclaimer-strip">
      <strong>18+ only</strong>
      <span>Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.</span>
    </section>
  );
}

function ContactPage({ navigate, adminContent }: { navigate: (page: Page, path?: string) => void; adminContent: AdminContent }) {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [captcha, setCaptcha] = useState(() => {
    const left = Math.floor(Math.random() * 10) + 1;
    const right = Math.floor(Math.random() * 10) + 1;
    return { left, right };
  });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const verified = Number(captchaAnswer) === captcha.left + captcha.right;
  const refreshCaptcha = () => {
    const left = Math.floor(Math.random() * 10) + 1;
    const right = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ left, right });
    setCaptchaAnswer("");
  };
  const submitContactMessage = async () => {
    if (!verified || !form.name || !form.email || !form.message) {
      setSubmitState("error");
      return;
    }
    setSubmitState("sending");
    const payload: SupportMessage = {
      id: Date.now(),
      ...form,
      to: "support@bamsignal.com",
      createdAt: new Date().toISOString()
    };
    try {
      const saved = window.localStorage.getItem("bamsignal-support-messages");
      const messages = saved ? (JSON.parse(saved) as SupportMessage[]) : [];
      window.localStorage.setItem("bamsignal-support-messages", JSON.stringify([payload, ...messages].slice(0, 50)));
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => undefined);
      setForm({ name: "", email: "", topic: "", message: "" });
      refreshCaptcha();
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <main>
      <section className="detail-hero contact-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" }, "/")}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">Contact BamSignal</p>
        <h2>Support, partnerships, VIP help, and app questions.</h2>
        <p>Send a clean support request to support@bamsignal.com after solving the simple math check. It keeps spam away without making real users work hard.</p>
      </section>

      <section className="contact-page-grid">
        <div className="contact-form-card">
          <div className="auth-form">
            <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>
            <label>Email<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="you@example.com" /></label>
            <label>Topic<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="VIP access, app help, partnership..." /></label>
            <label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us what you need." /></label>
            <div className="math-check">
              <strong>{captcha.left} + {captcha.right} = ?</strong>
              <input value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} inputMode="numeric" placeholder="Answer" />
              <button className="text-action" onClick={refreshCaptcha}>New question</button>
            </div>
            {verified ? (
              <button className="primary-action neon-action" onClick={submitContactMessage} disabled={submitState === "sending"}>
                <Send size={16} /> {submitState === "sending" ? "Sending..." : "Send message to support"}
              </button>
            ) : (
              <button className="secondary-action" disabled><ShieldCheck size={16} /> Solve math to send</button>
            )}
            {submitState === "sent" && <p className="auth-message">Message sent to support@bamsignal.com and saved in the admin support inbox.</p>}
            {submitState === "error" && <p className="auth-message">Please fill in your name, email, message, and solve the math check.</p>}
          </div>
        </div>

        <aside className="contact-side">
          <FootballNewsPanel adminContent={adminContent} compact />
          <AdSlots adminContent={adminContent} />
          <div className="info-panel contact-panel">
            <p className="eyebrow">Official channels</p>
            <h2>Reach the right room.</h2>
            <div className="social-grid">
              <a href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer"><Send size={18} /><span>Telegram</span><small>official channel</small></a>
              <a href="https://whatsapp.com/channel/0029Vb7wB96DZ4LdE2Nhlp3A" target="_blank" rel="noreferrer"><MessageCircle size={18} /><span>WhatsApp</span><small>official channel</small></a>
              <a href="https://www.instagram.com/officialbamsignal/" target="_blank" rel="noreferrer"><Instagram size={18} /><span>Instagram</span><small>@officialbamsignal</small></a>
              <a href="https://x.com/bamsignalhq" target="_blank" rel="noreferrer"><Twitter size={18} /><span>X</span><small>@bamsignalhq</small></a>
            </div>
          </div>
        </aside>
      </section>

      <DisclaimerStrip />
    </main>
  );
}

function LegalPage({ page, navigate }: { page: { kind: "legal"; slug: string }; navigate: (page: Page, path?: string) => void }) {
  const legal = legalPages.find((item) => item.slug === page.slug) ?? legalPages[0];
  return (
    <main>
      <section className="detail-hero legal-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" }, "/")}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">Legal</p>
        <h2>{legal.title}</h2>
        <p>{legal.intro}</p>
      </section>
      <section className="detail-grid">
        {legal.sections.map((section, index) => (
          <article className="detail-card legal-card" key={section}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{section}</p>
          </article>
        ))}
      </section>
      <DisclaimerStrip />
    </main>
  );
}

function BettingTipsPage({ navigate }: { navigate: (page: Page, path?: string) => void }) {
  return (
    <main>
      <section className="detail-hero seo-landing-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" }, "/")}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">Betting tips guide</p>
        <h2>Football betting tips Nigerians can actually understand.</h2>
        <p>
          BamSignal betting tips explain the market, the risk, the match context, and the reason behind each signal.
          The goal is simple: help users read football predictions with discipline before they copy any booking code.
        </p>
      </section>

      <section className="seo-card-grid">
        {bettingTipPrinciples.map((item, index) => (
          <article className="detail-card" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="seo-panel">
        <p className="eyebrow">How BamSignal builds tips</p>
        <h2>Form, fixtures, odds, team news, motivation, and market strength all matter.</h2>
        <p>
          A strong betting tip starts with the fixture story. Is the favorite at home or travelling? Is the team rotating
          after Europe? Does the underdog defend deep? Are both sides scoring regularly? Are corners driven by pressure,
          or are goals more reliable? BamSignal turns those questions into clear signal percentages so beginners can
          learn while experienced users move faster.
        </p>
        <p>
          For growth, this page should become a long-term SEO pillar for searches around football betting tips,
          sure games, prediction apps, booking codes, odds boost, free football tips, VIP tips, Paystack betting
          subscription, SportyBet code, Bet9ja code, and Nigerian football prediction communities.
        </p>
      </section>
    </main>
  );
}

function MarketsPage({ navigate }: { navigate: (page: Page, path?: string) => void }) {
  return (
    <main>
      <section className="detail-hero seo-landing-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" }, "/")}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">Football markets</p>
        <h2>Every major football prediction market explained in plain language.</h2>
        <p>
          Markets are the language of football betting. BamSignal explains each market so a new user can understand
          what must happen, why the signal may be strong, and when the safer option is better than the attractive odds.
        </p>
      </section>

      <section className="seo-card-grid">
        {marketDetails.map((market) => (
          <article className="detail-card link-card" key={market.slug}>
            <span>{market.name}</span>
            <h3>{market.name} predictions</h3>
            <p>{market.intro}</p>
            <button className="text-action create-link" onClick={() => navigate({ kind: "market", slug: market.slug }, `/markets/${market.slug}`)}>
              Read full guide <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </section>

      <section className="seo-panel">
        <p className="eyebrow">Market selection</p>
        <h2>The best pick is not always the biggest odd.</h2>
        <p>
          Fulltime result may be obvious in some matches, but double chance can be better when draw risk is high.
          Over 1.5 goals can be smarter than over 2.5 when two teams create enough chances but the match is not fully open.
          Corners can be stronger than goals when one side dominates territory but struggles to finish. BamSignal should
          always let the market fit the match instead of forcing every fixture into the same betting style.
        </p>
      </section>
    </main>
  );
}

function LeaguesPage({ navigate }: { navigate: (page: Page, path?: string) => void }) {
  return (
    <main>
      <section className="detail-hero seo-landing-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" }, "/")}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">League coverage</p>
        <h2>Football leagues, clubs, trophies, and prediction context.</h2>
        <p>
          League knowledge matters because football is not played the same way everywhere. England, Spain, Italy,
          Germany, France, Portugal, the Netherlands, Nigeria, and CAF competitions all carry different rhythms,
          club cultures, travel demands, trophy pressure, and betting patterns.
        </p>
      </section>

      <section className="seo-card-grid">
        {leagueDetails.map((league) => (
          <article className="detail-card link-card" key={league.slug}>
            <span>{league.name}</span>
            <h3>{league.name} predictions</h3>
            <p>{league.intro}</p>
            <button className="text-action create-link" onClick={() => navigate({ kind: "league", slug: league.slug }, `/leagues/${league.slug}`)}>
              Read full guide <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </section>

      <section className="country-league-grid">
        {globalLeagueRegions.map((item) => (
          <article className="info-panel" key={item.region}>
            <p className="eyebrow">{item.region}</p>
            <h2>{item.competitions}</h2>
            <p><strong>Clubs to know:</strong> {item.clubs}.</p>
            <p>{item.notes}</p>
          </article>
        ))}
      </section>

      <section className="seo-panel">
        <p className="eyebrow">Trophy context</p>
        <h2>History changes pressure, motivation, and public odds.</h2>
        <p>
          Clubs with Champions League, Europa League, domestic league, and cup pedigree often attract heavy public money.
          That can shorten odds even when the actual fixture is difficult. BamSignal uses league education to help users
          understand when a historic club is genuinely strong and when the market is simply reacting to the badge.
        </p>
      </section>
    </main>
  );
}

function SiteFooter({ navigate }: { navigate: (page: Page, path?: string) => void }) {
  const legalNav = (event: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    event.preventDefault();
    navigate({ kind: "legal", slug }, `/legal/${slug}`);
  };

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>BamSignal</strong>
        <span>18+ only. Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.</span>
      </div>
      <div className="footer-column">
        <span>Support</span>
        <nav aria-label="BamSignal support links">
          <a href="/contact" onClick={(event) => { event.preventDefault(); navigate({ kind: "contact" }, "/contact"); }}>Contact</a>
          <a href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://whatsapp.com/channel/0029Vb7wB96DZ4LdE2Nhlp3A" target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      </div>
      <div className="footer-column">
        <span>Legal</span>
        <nav aria-label="BamSignal legal links">
          {legalPages.map((page) => (
            <a key={page.slug} href={`/legal/${page.slug}`} onClick={(event) => legalNav(event, page.slug)}>{page.title}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function AdminPage({
  isNative,
  navigate,
  adminContent,
  setAdminContent
}: {
  isNative: boolean;
  navigate: (page: Page, path?: string) => void;
  adminContent: AdminContent;
  setAdminContent: (content: AdminContent) => void;
}) {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("overview");
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    try {
      const saved = window.localStorage.getItem("bamsignal-support-messages");
      return saved ? (JSON.parse(saved) as SupportMessage[]) : [];
    } catch {
      return [];
    }
  });
  const updateAdLink = (index: number, value: string) => {
    const nextLinks = [...adminContent.adLinks];
    nextLinks[index] = value;
    setAdminContent({ ...adminContent, adLinks: nextLinks });
  };
  const updateAdminGame = (index: number, patch: Partial<AdminGame>) => {
    const games = adminContent.games.map((game, gameIndex) => gameIndex === index ? { ...game, ...patch } : game);
    setAdminContent({ ...adminContent, games });
  };
  const updateBookingEntry = (gameIndex: number, codeIndex: number, patch: Partial<BookingCodeEntry>) => {
    const games = adminContent.games.map((game, index) => index === gameIndex
      ? { ...game, bookingCodes: game.bookingCodes.map((entry, entryIndex) => entryIndex === codeIndex ? { ...entry, ...patch } : entry) }
      : game);
    setAdminContent({ ...adminContent, games });
  };
  const addBookingEntry = (gameIndex: number) => {
    const games = adminContent.games.map((game, index) => index === gameIndex
      ? { ...game, bookingCodes: [...game.bookingCodes, makeBookingCode("sportybet", "", game.tier === "vip")] }
      : game);
    setAdminContent({ ...adminContent, games });
  };
  const removeBookingEntry = (gameIndex: number, codeIndex: number) => {
    const games = adminContent.games.map((game, index) => index === gameIndex
      ? { ...game, bookingCodes: game.bookingCodes.filter((_, entryIndex) => entryIndex !== codeIndex) }
      : game);
    setAdminContent({ ...adminContent, games });
  };
  const publishGame = (game: AdminGame) => {
    const targets = [
      game.pushApp ? "app users" : "",
      game.pushTelegram ? "regular Telegram" : "",
      game.pushWhatsApp ? "WhatsApp channel" : "",
      game.pushVipTelegram ? "VIP Telegram" : ""
    ].filter(Boolean).join(", ");
    window.alert(`${game.match} is ready to publish to ${targets || "selected channels"}. Backend broadcast hooks will send it live when your channel keys are active.`);
  };
  const addAdminGame = () => {
    setAdminContent({
      ...adminContent,
      games: [
        ...adminContent.games,
        {
          ...defaultAdminGames[0],
          id: Date.now(),
          match: "New fixture",
          league: "League",
          pick: "Prediction",
          odds: 1.45,
          confidence: 70,
          tier: "freemium",
          showBookingCodes: false,
          bookingCodes: [makeBookingCode("sportybet", "")]
        }
      ]
    });
  };
  const refreshSupportInbox = () => {
    try {
      const saved = window.localStorage.getItem("bamsignal-support-messages");
      setSupportMessages(saved ? (JSON.parse(saved) as SupportMessage[]) : []);
    } catch {
      setSupportMessages([]);
    }
  };
  const updateLoginBanner = (
    key: keyof AdminContent["loginBanners"],
    patch: Partial<LoginBanner> & Partial<{ active: boolean }>
  ) => {
    setAdminContent({
      ...adminContent,
      loginBanners: {
        ...adminContent.loginBanners,
        [key]: { ...adminContent.loginBanners[key], ...patch }
      }
    });
  };

  return (
    <main>
      <section className="detail-hero">
        <button className="back-link" onClick={() => navigate(isNative ? { kind: "app" } : { kind: "home" }, isNative ? "/app" : "/")}>
          <ArrowLeft size={16} /> {isNative ? "Back to user dashboard" : "Back to BamSignal"}
        </button>
        <p className="eyebrow">Admin command center</p>
        <h2>Input once. Publish everywhere.</h2>
        <p>
          This private command center is where BamSignal prepares the day&apos;s free tips, VIP picks, booking codes, scheduled alerts, and channel broadcasts before they go to users.
        </p>
      </section>
      <div className="admin-command-layout">
        <nav className="admin-work-nav" aria-label="Admin work areas">
          {[
            { tab: "overview", label: "Overview", icon: <ClipboardCheck size={15} /> },
            { tab: "games", label: "Games", icon: <Goal size={15} /> },
            { tab: "login", label: "Login banners", icon: <Sparkles size={15} /> },
            { tab: "content", label: "News & ads", icon: <BarChart3 size={15} /> },
            { tab: "payments", label: "Payments", icon: <CreditCard size={15} /> },
            { tab: "otp", label: "OTP", icon: <ShieldCheck size={15} /> },
            { tab: "support", label: "Support inbox", icon: <MessageCircle size={15} /> }
          ].map(({ tab, label, icon }) => (
            <button key={tab} className={activeAdminTab === tab ? "active" : ""} onClick={() => { setActiveAdminTab(tab as AdminTab); if (tab === "support") refreshSupportInbox(); }}>
              {icon}
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-workspace">

      {activeAdminTab === "overview" && <section className="admin-panel">
        <div className="admin-form">
          <label>Game of the day<input value="Man City vs Tottenham" readOnly /></label>
          <label>Prediction<input value="Home win + over 1.5" readOnly /></label>
          <label>Booking codes<input value="1xBet: BAM218 / BetKing: BK944" readOnly /></label>
          <label>Schedule<input value="Saturday 10:00 AM WAT" readOnly /></label>
        </div>
        <div className="automation-list">
          {adminPlan.map((item, index) => (
            <div key={item}>
              {index === 0 ? <Bell size={16} /> : index === 1 ? <Crown size={16} /> : index === 2 ? <CalendarClock size={16} /> : <ClipboardCheck size={16} />}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>}

      {activeAdminTab === "games" && <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p className="eyebrow">Daily games command</p>
            <h2>Choose freemium, VIP, codes, and channel push.</h2>
            <p className="admin-note">Freemium users only see the two low-odd games below 1.50. VIP users see the high-odd room, full recommendations, and booking codes.</p>
          </div>
          <button className="secondary-action" onClick={addAdminGame}><Goal size={16} /> Add game</button>
        </div>
        <div className="admin-form single-row">
          <label>Public booking button text<input value={adminContent.bookingButtonText} onChange={(event) => setAdminContent({ ...adminContent, bookingButtonText: event.target.value })} placeholder="Get Bet9ja Code / Get SportyBet Code" /></label>
        </div>
        <div className="admin-game-grid">
          {adminContent.games.map((game, index) => (
            <article className={`admin-game-card ${game.tier}`} key={game.id}>
              <div className="admin-game-head">
                <strong>{game.tier === "vip" ? "VIP premium" : "Freemium"}</strong>
                <span>{game.odds.toFixed(2)} odds / {game.confidence}%</span>
              </div>
              <div className="admin-form compact">
                <label>Match<input value={game.match} onChange={(event) => updateAdminGame(index, { match: event.target.value })} /></label>
                <label>League<input value={game.league} onChange={(event) => updateAdminGame(index, { league: event.target.value })} /></label>
                <label>Prediction<input value={game.pick} onChange={(event) => updateAdminGame(index, { pick: event.target.value })} /></label>
                <label>Tier
                  <select value={game.tier} onChange={(event) => updateAdminGame(index, { tier: event.target.value as AdminGame["tier"] })}>
                    <option value="freemium">Freemium low-odd</option>
                    <option value="vip">VIP high-odd</option>
                  </select>
                </label>
                <label>Odds<input value={game.odds} type="number" step="0.01" onChange={(event) => updateAdminGame(index, { odds: Number(event.target.value) || 1 })} /></label>
                <label>Confidence %<input value={game.confidence} type="number" min="1" max="99" onChange={(event) => updateAdminGame(index, { confidence: Number(event.target.value) || 1 })} /></label>
              </div>
              <div className="booking-admin-head">
                <strong>Booking codes</strong>
                <button className="secondary-action" onClick={() => addBookingEntry(index)}><ClipboardCheck size={15} /> Add booking code</button>
              </div>
              <div className="booking-entry-grid">
                {game.bookingCodes.map((entry, codeIndex) => (
                  <article className="booking-entry-card" key={entry.id}>
                    <label>Bookmaker
                      <select value={entry.bookmaker} onChange={(event) => updateBookingEntry(index, codeIndex, { bookmaker: event.target.value as BookmakerKey })}>
                        {bookmakers.map((bookmaker) => (
                          <option value={bookmaker.key} key={bookmaker.key}>{bookmaker.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>Booking code<input value={entry.code} onChange={(event) => updateBookingEntry(index, codeIndex, { code: event.target.value })} placeholder="Paste booking code" /></label>
                    <div className="code-destination-grid">
                      <label><input type="checkbox" checked={entry.regularApp} onChange={(event) => updateBookingEntry(index, codeIndex, { regularApp: event.target.checked })} /> User app</label>
                      <label><input type="checkbox" checked={entry.premiumApp} onChange={(event) => updateBookingEntry(index, codeIndex, { premiumApp: event.target.checked })} /> VIP app</label>
                      <label><input type="checkbox" checked={entry.regularTelegram} onChange={(event) => updateBookingEntry(index, codeIndex, { regularTelegram: event.target.checked })} /> Regular Telegram</label>
                      <label><input type="checkbox" checked={entry.premiumTelegram} onChange={(event) => updateBookingEntry(index, codeIndex, { premiumTelegram: event.target.checked })} /> Premium Telegram</label>
                    </div>
                    <button className="text-action" onClick={() => removeBookingEntry(index, codeIndex)}>Remove code</button>
                  </article>
                ))}
              </div>
              <div className="toggle-grid">
                <label><input type="checkbox" checked={game.showBookingCodes} onChange={(event) => updateAdminGame(index, { showBookingCodes: event.target.checked })} /> Show booking codes to freemium</label>
                <label><input type="checkbox" checked={game.pushApp} onChange={(event) => updateAdminGame(index, { pushApp: event.target.checked })} /> Push to app</label>
                <label><input type="checkbox" checked={game.pushTelegram} onChange={(event) => updateAdminGame(index, { pushTelegram: event.target.checked })} /> Telegram channel</label>
                <label><input type="checkbox" checked={game.pushWhatsApp} onChange={(event) => updateAdminGame(index, { pushWhatsApp: event.target.checked })} /> WhatsApp channel</label>
                <label><input type="checkbox" checked={game.pushVipTelegram} onChange={(event) => updateAdminGame(index, { pushVipTelegram: event.target.checked })} /> VIP Telegram special</label>
              </div>
              <button className="primary-action neon-action" onClick={() => publishGame(game)}><Send size={16} /> Publish selected game now</button>
            </article>
          ))}
        </div>
      </section>}

      {activeAdminTab === "login" && <section className="admin-panel">
        <div>
          <p className="eyebrow">Remote login config</p>
          <h2>Weekly login and reset-page banners</h2>
          <p className="admin-note">Best practice: first-timers see conversion proof, returning users see weekly affiliate/game value, and weekend special overrides both from Friday to Sunday when active.</p>
        </div>
        <div className="banner-config-grid">
          {([
            ["firstTimer", "First-time users", "Product conversion and VIP proof"],
            ["returning", "Returning users", "Affiliate bonus, weekly result proof, or big-game code"],
            ["weekendSpecial", "Weekend special", "Friday-Sunday priority push"]
          ] as const).map(([key, title, note]) => {
            const banner = adminContent.loginBanners[key];
            return (
              <article className="banner-config-card" key={key}>
                <div className="admin-game-head">
                  <div>
                    <strong>{title}</strong>
                    <span>{note}</span>
                  </div>
                  {key === "weekendSpecial" && (
                    <label className="inline-admin-toggle">
                      <input type="checkbox" checked={adminContent.loginBanners.weekendSpecial.active} onChange={(event) => updateLoginBanner("weekendSpecial", { active: event.target.checked })} />
                      Active
                    </label>
                  )}
                </div>
                <div className="admin-form compact">
                  <label>Headline<input value={banner.headline} onChange={(event) => updateLoginBanner(key, { headline: event.target.value })} placeholder="Short, punchy headline" /></label>
                  <label>Image URL<input value={banner.imageUrl} onChange={(event) => updateLoginBanner(key, { imageUrl: event.target.value })} placeholder="https://..." /></label>
                  <label>Action text<input value={banner.actionText} onChange={(event) => updateLoginBanner(key, { actionText: event.target.value })} placeholder="Create secure account" /></label>
                  <label>Action URL<input value={banner.actionUrl} onChange={(event) => updateLoginBanner(key, { actionUrl: event.target.value })} placeholder="signup, login, vip, or https://..." /></label>
                </div>
                <label className="admin-textarea-label">Body<textarea value={banner.body} onChange={(event) => updateLoginBanner(key, { body: event.target.value })} placeholder="One useful line that tells the user why this matters this week." /></label>
                <AuthDynamicBanner banner={banner} position="bottom" onAction={() => undefined} />
              </article>
            );
          })}
        </div>
      </section>}

      {activeAdminTab === "content" && <section className="admin-panel">
        <div>
          <p className="eyebrow">Public news and ads</p>
          <h2>News room and clean ad slots</h2>
          <p className="admin-note">Paste RapidAPI-driven news output or a headline manually here. Ad blocks stay hidden until a link is added.</p>
        </div>
        <div className="admin-form">
          <label>Football news headline<input value={adminContent.newsTitle} onChange={(event) => setAdminContent({ ...adminContent, newsTitle: event.target.value })} placeholder="Transfer update, injury news, match preview..." /></label>
          <label>News summary<input value={adminContent.newsSummary} onChange={(event) => setAdminContent({ ...adminContent, newsSummary: event.target.value })} placeholder="Short public summary from your RapidAPI feed" /></label>
          <label>News source<input value={adminContent.newsSource} onChange={(event) => setAdminContent({ ...adminContent, newsSource: event.target.value })} placeholder="RapidAPI / source name" /></label>
          <label>News URL<input value={adminContent.newsUrl} onChange={(event) => setAdminContent({ ...adminContent, newsUrl: event.target.value })} placeholder="https://..." /></label>
          {adminContent.adLinks.map((link, index) => (
            <label key={index}>Ad link {index + 1}<input value={link} onChange={(event) => updateAdLink(index, event.target.value)} placeholder="https://advertiser-or-affiliate-link.com" /></label>
          ))}
        </div>
      </section>}

      {activeAdminTab === "payments" && <section className="admin-panel">
        <div>
          <p className="eyebrow">Payments and subscriptions</p>
          <h2>VIP access control</h2>
          <p className="admin-note">Production should connect these controls to Paystack webhooks, subscription expiry jobs, and manual support overrides.</p>
        </div>
        <div className="admin-form">
          <label>Weekly VIP price (₦)<input value={adminContent.vipWeeklyPrice} type="number" min="0" onChange={(event) => setAdminContent({ ...adminContent, vipWeeklyPrice: Number(event.target.value) || 0 })} /></label>
          <label>Monthly VIP price (₦)<input value={adminContent.vipMonthlyPrice} type="number" min="0" onChange={(event) => setAdminContent({ ...adminContent, vipMonthlyPrice: Number(event.target.value) || 0 })} /></label>
          <label>Weekly Paystack link<input value={adminContent.vipWeeklyLink} onChange={(event) => setAdminContent({ ...adminContent, vipWeeklyLink: event.target.value })} placeholder="https://paystack.com/pay/..." /></label>
          <label>Monthly Paystack link<input value={adminContent.vipMonthlyLink} onChange={(event) => setAdminContent({ ...adminContent, vipMonthlyLink: event.target.value })} placeholder="https://paystack.com/pay/..." /></label>
        </div>
        <div className="automation-list">
          <div><CreditCard size={16} /><span>Weekly VIP is {formatNaira(adminContent.vipWeeklyPrice)}: {adminContent.vipWeeklyLink}</span></div>
          <div><CreditCard size={16} /><span>Monthly VIP is {formatNaira(adminContent.vipMonthlyPrice)}: {adminContent.vipMonthlyLink}</span></div>
          <div><ShieldCheck size={16} /><span>Webhook should mark users VIP immediately after successful payment.</span></div>
          <div><CalendarClock size={16} /><span>Expiry job should move users back to freemium when subscriptions end.</span></div>
          <div><Users size={16} /><span>Admin override room reserved for manual verification, refunds, and support fixes.</span></div>
        </div>
      </section>}

      {activeAdminTab === "otp" && <section className="admin-panel">
        <div>
          <p className="eyebrow">Sendchamp OTP control</p>
          <h2>Phone verification settings</h2>
          <p className="admin-note">Keep the real Sendchamp API key server-side as SENDCHAMP_API_KEY. These settings control the user-facing WhatsApp/SMS login flow.</p>
        </div>
        <div className="admin-form">
          <label>Default OTP channel
            <select value={adminContent.sendchampDefaultChannel} onChange={(event) => setAdminContent({ ...adminContent, sendchampDefaultChannel: event.target.value as "whatsapp" | "sms" })}>
              <option value="whatsapp">WhatsApp first</option>
              <option value="sms">SMS first</option>
            </select>
          </label>
          <label>WhatsApp template<input value={adminContent.sendchampWhatsappTemplate} onChange={(event) => setAdminContent({ ...adminContent, sendchampWhatsappTemplate: event.target.value })} placeholder="bamsignal_login_otp" /></label>
          <label>SMS sender name<input value={adminContent.sendchampSmsSender} onChange={(event) => setAdminContent({ ...adminContent, sendchampSmsSender: event.target.value })} placeholder="BamSignal" /></label>
          <label>API key storage<input value="SENDCHAMP_API_KEY env var only" readOnly /></label>
        </div>
      </section>}

      {activeAdminTab === "support" && <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p className="eyebrow">Support inbox</p>
            <h2>Messages sent to support@bamsignal.com</h2>
            <p className="admin-note">Contact form submissions stay inside this admin inbox for review. Production email delivery can be connected to Resend, SendGrid, or your support mailbox provider.</p>
          </div>
          <button className="secondary-action" onClick={refreshSupportInbox}><MessageCircle size={16} /> Refresh inbox</button>
        </div>
        <div className="support-inbox-list">
          {supportMessages.length ? supportMessages.map((item) => (
            <article className="support-message-card" key={item.id}>
              <div>
                <strong>{item.topic || "Contact message"}</strong>
                <span>{item.name} / {item.email}</span>
              </div>
              <p>{item.message}</p>
              <small>To {item.to} / {new Date(item.createdAt).toLocaleString("en-NG")}</small>
            </article>
          )) : (
            <div className="empty-admin-state">
              <MessageCircle size={18} />
              <span>No support messages yet.</span>
            </div>
          )}
        </div>
      </section>}
        </div>
      </div>
    </main>
  );
}

function DetailPage({ page, navigate }: { page: { kind: "market"; slug: string } | { kind: "league"; slug: string }; navigate: (page: Page, path?: string) => void }) {
  const detail = page.kind === "market"
    ? marketDetails.find((item) => item.slug === page.slug)
    : leagueDetails.find((item) => item.slug === page.slug);
  const titlePrefix = page.kind === "market" ? "Market guide" : "League guide";

  if (!detail) {
    return (
      <main>
        <section className="detail-hero">
          <button className="back-link" onClick={() => navigate({ kind: "home" })}>
            <ArrowLeft size={16} /> Back to BamSignal
          </button>
          <p className="eyebrow">Not found</p>
          <h2>This BamSignal page is not available yet.</h2>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="detail-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" })}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">{titlePrefix}</p>
        <h2>{detail.name} predictions explained</h2>
        <p>{detail.intro}</p>
      </section>
      <section className="detail-grid">
        {detail.sections.map((section, index) => (
          <article className="detail-card" key={section}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{section}</p>
          </article>
        ))}
      </section>
      <section className="seo-panel">
        <p className="eyebrow">BamSignal method</p>
        <h2>How beginners should read this page</h2>
        <p>
          Start with the market or league context, then compare the BamSignal percentage with the available odds.
          If the recommendation is locked, join the app or Telegram channel to see the full game, booking code,
          and risk notes before making any decision.
        </p>
      </section>
    </main>
  );
}

function FixtureCard({ fixture, locked, bookingButtonText }: { fixture: Fixture; locked?: boolean; bookingButtonText: string }) {
  const bookingCode = `${fixture.status === "Live" ? "LIVE" : "SB"}-${fixture.id}${fixture.confidence}`;
  const copyBookingCode = async () => {
    if (Capacitor.getPlatform() !== "web") {
      await navigator.clipboard?.writeText(bookingCode);
      return;
    }
    document.getElementById("apps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <article className={`fixture-card ${locked ? "locked" : ""}`}>
      <div className="fixture-main">
        <div>
          <span className={`status ${fixture.status.toLowerCase()}`}>{fixture.status === "Live" && <i aria-hidden="true" />}{fixture.status}</span>
          <p className="league">{fixture.league} / {fixture.country} / {fixture.time}</p>
          <h3>{fixture.home} <small>vs</small> {fixture.away}</h3>
        </div>
        <div className="confidence-pill">{fixture.confidence}%</div>
      </div>
      <div className="prediction-row">
        <span>Primary pick</span>
        <strong className={locked ? "blurred-tip" : ""}>{fixture.pick}</strong>
      </div>
      {!locked && (
        <button className="booking-code-button" onClick={copyBookingCode}>
          <ClipboardCheck size={14} /> {bookingButtonText} <strong>{bookingCode}</strong>
        </button>
      )}
      <div className={`probability-grid ${locked ? "blurred-grid" : ""}`}>
        <Probability label="Result" value={fixture.result} percent={fixture.confidence} />
        <Probability label="BTTS" value="Yes" percent={fixture.btts} />
        <Probability label="Over 2.5" value="Yes" percent={fixture.over25} />
        <Probability label="Corners 4+" value="Yes" percent={fixture.corners} />
      </div>
    </article>
  );
}

function Probability({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="probability">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="bar"><i style={{ width: `${percent}%` }} /></div>
      <small>{percent}%</small>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <span>{question}<ChevronDown size={18} /></span>
      {open && <p>{answer}</p>}
    </button>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
