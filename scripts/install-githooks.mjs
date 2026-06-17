import { execSync } from "node:child_process";

try {
  execSync("git rev-parse --git-dir", { stdio: "ignore" });
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
} catch {
  // Not a git checkout or git unavailable (e.g. Docker npm ci).
}
