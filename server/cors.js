import { config } from "./config.js";

const STATIC_ORIGINS = new Set([
  "https://bamsignal.com",
  "https://www.bamsignal.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost"
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (STATIC_ORIGINS.has(origin)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?bamsignal\.com$/i.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  try {
    const appOrigin = new URL(config.publicAppUrl).origin;
    return origin === appOrigin;
  } catch {
    return false;
  }
}

/** CORS for Capacitor / cross-origin API calls to bamsignal.com */
export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
