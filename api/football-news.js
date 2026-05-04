import { fetchFootballNews } from "../server/services/footballNews.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const payload = await fetchFootballNews();
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Football news feed failed" });
  }
}
