import axios from "axios";
import { config } from "../config.js";
import { getPlatformSetting } from "../db.js";

const naijaInterestKeywords = [
  "premier league",
  "champions league",
  "europa league",
  "conference league",
  "arsenal",
  "chelsea",
  "liverpool",
  "manchester united",
  "man united",
  "manchester city",
  "man city",
  "tottenham",
  "newcastle",
  "barcelona",
  "real madrid",
  "atletico",
  "psg",
  "bayern",
  "dortmund",
  "leverkusen",
  "inter",
  "milan",
  "juventus",
  "napoli",
  "osimhen",
  "lookman",
  "boniface",
  "iwobi",
  "ndidi",
  "chukwueze",
  "super eagles",
  "nigeria"
];

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.news)) return payload.news;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.response)) return payload.response;
  return [];
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function scoreArticle(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  return naijaInterestKeywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
}

function normalizeArticle(item, source = "Football news") {
  const title = cleanText(item.title || item.headline || item.name || item.text);
  const summary = cleanText(item.summary || item.description || item.excerpt || item.content || item.subtitle);
  const url = cleanText(item.url || item.link || item.href || item.article_url);
  const imageUrl = cleanText(item.image || item.image_url || item.thumbnail || item.thumbnail_url || item.img);
  const publishedAt = cleanText(item.publishedAt || item.published_at || item.date || item.time || item.created_at);
  const articleSource = cleanText(item.source?.name || item.source || item.publisher || source);

  if (!title) return null;

  return {
    title,
    summary,
    url,
    imageUrl,
    source: articleSource,
    publishedAt,
    score: 0
  };
}

async function fetchRapidApiPath(path) {
  const url = `https://${config.footballNews.rapidApiHost}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await axios.get(url, {
    headers: {
      "x-rapidapi-key": config.footballNews.rapidApiKey,
      "x-rapidapi-host": config.footballNews.rapidApiHost
    },
    timeout: 12000
  });
  return asArray(response.data).map((item) => normalizeArticle(item, path)).filter(Boolean);
}

async function fetchFallbackPath(path) {
  const base = config.footballNews.fallbackBaseUrl.replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await axios.get(url, { timeout: 12000 });
  return asArray(response.data).map((item) => normalizeArticle(item, path)).filter(Boolean);
}

export async function fetchFootballNews() {
  const adminContent = await getPlatformSetting("admin_content", null).catch(() => null);
  const manualArticle = adminContent?.newsTitle
    ? normalizeArticle({
        title: adminContent.newsTitle,
        summary: adminContent.newsSummary,
        source: adminContent.newsSource || "BamSignal news desk",
        url: adminContent.newsUrl
      }, "BamSignal news desk")
    : null;

  if (!config.footballNews.rapidApiKey) {
    return {
      ok: Boolean(manualArticle),
      source: manualArticle ? "admin-curated-news" : "rapidapi-football-news",
      configured: false,
      articles: manualArticle ? [manualArticle] : [],
      errors: [{ message: "Set RAPIDAPI_FOOTBALL_NEWS_KEY in Vercel to activate football news." }]
    };
  }

  const errors = [];
  const allArticles = [];

  for (const path of config.footballNews.rapidApiPaths) {
    try {
      allArticles.push(...await fetchRapidApiPath(path));
    } catch (error) {
      errors.push({ path, message: error.message, code: error.code });
    }
  }

  const byUrlOrTitle = new Map();
  for (const article of allArticles) {
    const scored = { ...article, score: scoreArticle(article) };
    const key = scored.url || scored.title.toLowerCase();
    const existing = byUrlOrTitle.get(key);
    if (!existing || scored.score > existing.score) byUrlOrTitle.set(key, scored);
  }

  const articles = Array.from(byUrlOrTitle.values())
    .sort((left, right) => right.score - left.score || String(right.publishedAt).localeCompare(String(left.publishedAt)))
    .slice(0, config.footballNews.maxItems);

  return {
    ok: articles.length > 0 || Boolean(manualArticle),
    source: articles.length > 0 ? "rapidapi-football-news" : "admin-curated-news",
    configured: true,
    articles: articles.length > 0 ? articles : manualArticle ? [manualArticle] : [],
    errors
  };
}
