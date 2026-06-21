/**
 * Static checks that Docker builder/runner integrity stages stay separated.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`docker integrity stages test failed: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const dockerfileSource = read("Dockerfile");
const smokeSource = read("scripts/smoke-server-import.mjs");
const sourceIntegritySource = read("scripts/source-integrity-check.mjs");
const packageSource = read("package.json");

const builderSection = dockerfileSource.split("FROM node:20-slim AS runner")[0] || "";
const runnerSection = dockerfileSource.split("FROM node:20-slim AS runner")[1] || "";

assertCheck(
  builderSection.includes("RUN npm run build") &&
    builderSection.includes("RUN npm run test:source-integrity") &&
    builderSection.indexOf("RUN npm run test:source-integrity") >
      builderSection.indexOf("RUN npm run build"),
  "Docker builder stage must run source integrity immediately after npm run build"
);

assertCheck(
  runnerSection.includes("node scripts/smoke-server-import.mjs") &&
    !runnerSection.includes("test:source-integrity") &&
    !runnerSection.match(/COPY[^\n]*\ssrc\b/),
  "Docker runner stage must use runtime smoke only and must not copy src/"
);

assertCheck(
  !smokeSource.includes('join(rootPath, "src"') &&
    !smokeSource.includes("readSrc(") &&
    smokeSource.includes("server/production.js"),
  "runtime smoke must not read src/"
);

assertCheck(
  sourceIntegritySource.includes('if (!existsSync(srcRoot))') &&
    sourceIntegritySource.includes("source integrity skipped"),
  "source integrity must skip gracefully when src/ is missing"
);

const packageJson = JSON.parse(packageSource);
assertCheck(
  packageJson.scripts["test:source-integrity"] === "node scripts/source-integrity-check.mjs" &&
    packageJson.scripts["test:server-import"] === "node scripts/smoke-server-import.mjs" &&
    packageJson.scripts["test:all-integrity"] ===
      "npm run test:source-integrity && npm run test:server-import" &&
    typeof packageJson.scripts["test:fortress"] === "string" &&
    packageJson.scripts["test:fortress"].startsWith("node scripts/test-") &&
    !packageJson.scripts["test:fortress"].includes("source-integrity-check.mjs"),
  "package scripts must keep source integrity and runtime smoke independent"
);

console.log("docker integrity stages tests ok");
