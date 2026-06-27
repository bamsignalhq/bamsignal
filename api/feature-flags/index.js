import {
  FEATURE_FLAG_PLATFORM_SERVER_SEED,
  buildFeatureFlagApiPayload
} from "../../server/services/featureFlagPlatform.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.status(200).json(buildFeatureFlagApiPayload(FEATURE_FLAG_PLATFORM_SERVER_SEED));
}
