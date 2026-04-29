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
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:5173",
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
  affiliateUrls: {
    "1xbet": process.env.AFFILIATE_1XBET_URL,
    betking: process.env.AFFILIATE_BETKING_URL,
    sportybet: process.env.AFFILIATE_SPORTYBET_URL,
    bet9ja: process.env.AFFILIATE_BET9JA_URL,
    betway: process.env.AFFILIATE_BETWAY_URL
  }
};
