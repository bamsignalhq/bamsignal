import dotenv from "dotenv";
import { logSignupEmailEnvTrace } from "./supabaseEnv.js";

dotenv.config();

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.startsWith("<")) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    console.warn("[bamsignal] Ignoring invalid JSON environment value.");
    return fallback;
  }
};

export const config = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL?.trim() || "",
  publicAppUrl: process.env.PUBLIC_APP_URL || "https://bamsignal.com",
  paystackPublicKey:
    process.env.PAYSTACK_PUBLIC_KEY?.trim() ||
    process.env.VITE_PAYSTACK_PUBLIC_KEY?.trim() ||
    "",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY?.trim() || "",
  paystackWebhookSecret:
    process.env.PAYSTACK_WEBHOOK_SECRET?.trim() ||
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    "",
  paystackCallbackUrl:
    process.env.PAYSTACK_CALLBACK_URL ||
    `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/payment/success`,
  paystackAndroidCallbackUrl:
    process.env.PAYSTACK_ANDROID_CALLBACK_URL || "com.bamsignal.com://payment-success",
  paystackWebhookUrl:
    process.env.PAYSTACK_WEBHOOK_URL ||
    `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/api/paystack/webhook`, // Paystack dashboard URL
  timezone: process.env.APP_TIMEZONE || "Africa/Lagos",
  cronSecret: process.env.CRON_SECRET,
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN?.trim() || "",
    freeChannelId: process.env.TELEGRAM_FREE_CHANNEL_ID,
    vipGroupId: process.env.TELEGRAM_VIP_GROUP_ID
  },
  sendchamp: {
    apiKey: process.env.SENDCHAMP_API_KEY?.trim() || "",
    sender: process.env.SENDCHAMP_SENDER?.trim() || "",
    whatsappSender: process.env.SENDCHAMP_WHATSAPP_SENDER?.trim() || "",
    baseUrl: process.env.SENDCHAMP_BASE_URL?.trim() || "https://api.sendchamp.com/api/v1"
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI?.trim() || "",
    calendarRefreshToken: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() || "",
    calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || "primary"
  },
  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID?.trim() || "",
    clientSecret: process.env.ZOOM_CLIENT_SECRET?.trim() || "",
    accountId: process.env.ZOOM_ACCOUNT_ID?.trim() || ""
  },
  googleMeet: {
    clientId: process.env.GOOGLE_MEET_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GOOGLE_MEET_CLIENT_SECRET?.trim() || "",
    refreshToken: process.env.GOOGLE_MEET_REFRESH_TOKEN?.trim() || "",
    calendarId: process.env.GOOGLE_MEET_CALENDAR_ID?.trim() || "primary"
  }
};

if (!config.databaseUrl) {
  console.warn("[bamsignal] DATABASE_URL is not set. Database-backed features will run in dry-run mode.");
}

if (!config.paystackSecretKey) {
  console.warn("[bamsignal] PAYSTACK_SECRET_KEY is not set. Payment endpoints will return service-unavailable errors.");
} else if (!/^sk_(test|live)_/.test(config.paystackSecretKey)) {
  console.warn("[bamsignal] PAYSTACK_SECRET_KEY format looks invalid (expected sk_test_ or sk_live_ prefix).");
}

if (!config.google.clientId || !config.google.clientSecret || !config.google.redirectUri) {
  console.warn("[bamsignal] Google Calendar OAuth env is incomplete. Calendar booking will return service-unavailable errors.");
}

if (!config.zoom.clientId || !config.zoom.clientSecret) {
  console.warn("[bamsignal] Zoom meeting env is incomplete. Zoom meeting links will return service-unavailable errors.");
}

if (!config.googleMeet.clientId || !config.googleMeet.clientSecret) {
  console.warn("[bamsignal] Google Meet env is incomplete. Standalone Meet links will return service-unavailable errors.");
}

logSignupEmailEnvTrace();
