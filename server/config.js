import dotenv from "dotenv";

dotenv.config();

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const config = {
  port: Number(process.env.PORT || 5050),
  databaseUrl: process.env.DATABASE_URL,
  publicAppUrl: process.env.PUBLIC_APP_URL || "https://bamsignal.com",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    freeChannelId: process.env.TELEGRAM_FREE_CHANNEL_ID,
    vipGroupId: process.env.TELEGRAM_VIP_GROUP_ID
  },
  firebase: {
    serviceAccount: parseJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  },
  liveScore: {
    apiUrl: process.env.LIVE_SCORE_API_URL,
    apiKey: process.env.LIVE_SCORE_API_KEY
  },
  cronSecret: process.env.CRON_SECRET,
  signalWorker: {
    enabled: process.env.SIGNAL_WORKER_ENABLED === "true",
    autoFetchEnabled: process.env.SIGNAL_WORKER_AUTOFETCH === "true",
    secret: process.env.SIGNAL_WORKER_SECRET,
    timezone: process.env.SIGNAL_WORKER_TIMEZONE || "Africa/Lagos",
    cron: process.env.SIGNAL_WORKER_CRON || "0 9 * * *",
    fixtureApiUrl: process.env.SIGNAL_FIXTURE_API_URL,
    fixtureApiKey: process.env.SIGNAL_FIXTURE_API_KEY,
    freeLimit: Number(process.env.SIGNAL_FREE_LIMIT || 2),
    vipLimit: Number(process.env.SIGNAL_VIP_LIMIT || 12),
    freeOddsMax: Number(process.env.SIGNAL_FREE_ODDS_MAX || 1.5),
    defaultBookingCodes: parseJson(process.env.SIGNAL_DEFAULT_BOOKING_CODES, {}),
    sportsDbApiKey: process.env.THESPORTSDB_API_KEY || "123"
  },
  footballNews: {
    rapidApiKey: process.env.RAPIDAPI_FOOTBALL_NEWS_KEY || process.env.RAPIDAPI_KEY,
    rapidApiHost: process.env.RAPIDAPI_FOOTBALL_NEWS_HOST || "football-news-aggregator-live.p.rapidapi.com",
    rapidApiPaths: (process.env.RAPIDAPI_FOOTBALL_NEWS_PATHS || "/news/espn,/news/goal,/news/onefootball")
      .split(",")
      .map((path) => path.trim())
      .filter(Boolean),
    fallbackBaseUrl: process.env.FOOTBALL_NEWS_FALLBACK_URL || "https://footballnewsapi.netlify.app/.netlify/functions/api",
    maxItems: Number(process.env.FOOTBALL_NEWS_LIMIT || 6)
  },
  affiliateUrls: {
    "1xbet": process.env.AFFILIATE_1XBET_URL,
    betking: process.env.AFFILIATE_BETKING_URL,
    sportybet: process.env.AFFILIATE_SPORTYBET_URL,
    bet9ja: process.env.AFFILIATE_BET9JA_URL,
    betway: process.env.AFFILIATE_BETWAY_URL,
    melbet: process.env.AFFILIATE_MELBET_URL || "https://melbet.org/en?tag=d_5550069m_45415c_"
  }
};
