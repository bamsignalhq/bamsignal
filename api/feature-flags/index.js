import {
  FEATURE_FLAG_PLATFORM_SERVER_SEED,
  buildFeatureFlagApiPayload
} from "../../server/services/featureFlagPlatform.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendLoggedApiError({
      req,
      res,
      status: 405,
      message: "Method not allowed.",
      errorCode: "method_not_allowed",
      event: "feature_flags_method_not_allowed"
    });
  }

  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.status(200).json(buildFeatureFlagApiPayload(FEATURE_FLAG_PLATFORM_SERVER_SEED));
}
