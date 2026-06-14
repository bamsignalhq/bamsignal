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
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL,
  publicAppUrl: process.env.PUBLIC_APP_URL || "https://bamsignal.com",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackCallbackUrl:
    process.env.PAYSTACK_CALLBACK_URL ||
    `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/payment/success`,
  paystackWebhookUrl:
    process.env.PAYSTACK_WEBHOOK_URL ||
    `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/api/paystack/webhook`,
  timezone: process.env.APP_TIMEZONE || "Africa/Lagos",
  cronSecret: process.env.CRON_SECRET,
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    freeChannelId: process.env.TELEGRAM_FREE_CHANNEL_ID,
    vipGroupId: process.env.TELEGRAM_VIP_GROUP_ID
  },
  firebase: {
    serviceAccount: parseJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  }
};
