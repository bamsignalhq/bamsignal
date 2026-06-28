import {
  REMOTE_CONFIG_SERVER_SEED,
  getCachedRemoteConfigSnapshot
} from "../../server/services/remoteConfig.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendLoggedApiError({
      req,
      res,
      status: 405,
      message: "Method not allowed.",
      errorCode: "method_not_allowed",
      event: "remote_config_method_not_allowed"
    });
  }

  const snapshot = getCachedRemoteConfigSnapshot(REMOTE_CONFIG_SERVER_SEED);
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.status(200).json(snapshot);
}
