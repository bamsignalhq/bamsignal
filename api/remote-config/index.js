import {
  REMOTE_CONFIG_SERVER_SEED,
  getCachedRemoteConfigSnapshot
} from "../../server/services/remoteConfig.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const snapshot = getCachedRemoteConfigSnapshot(REMOTE_CONFIG_SERVER_SEED);
  res.setHeader("Cache-Control", "private, max-age=60");
  res.status(200).json(snapshot);
}
