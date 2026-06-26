#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = execFileSync("npx", ["madge", "--circular", "--extensions", "ts,tsx,mjs", "src/"], {
  cwd: rootPath,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

if (/Found \d+ circular dependencies!/i.test(output)) {
  console.error(output);
  process.exit(1);
}

console.log("circular import guard ok");
