import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const HISTORY_FILE = "history.json";

export function loadHistory(outputDir) {
  const path = join(outputDir, HISTORY_FILE);
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed.snapshots) ? parsed.snapshots : [];
  } catch {
    return [];
  }
}

export function saveHistory(outputDir, snapshots) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, HISTORY_FILE),
    `${JSON.stringify({ updatedAt: new Date().toISOString(), snapshots: snapshots.slice(0, 200) }, null, 2)}\n`,
    "utf8"
  );
}

export function appendSnapshot(outputDir, snapshot) {
  const history = loadHistory(outputDir).filter((item) => item.runId !== snapshot.runId);
  history.unshift(snapshot);
  saveHistory(outputDir, history);
  return history;
}
