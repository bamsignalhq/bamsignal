/**
 * Bundle performance guards — lazy routes, admin isolation, heavy library splits.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`bundle performance failed: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const appSource = read("src/App.tsx");
const lazyRoutesSource = read("src/app/lazyRoutes.ts");
const photoUploadSource = read("src/utils/photoUpload.ts");
const swSource = existsSync(join(rootPath, "public/sw.js")) ? read("public/sw.js") : "";

assertCheck(
  lazyRoutesSource.includes("LazyAdminConsoleRoot"),
  "lazyRoutes.ts must export LazyAdminConsoleRoot"
);
assertCheck(
  lazyRoutesSource.includes("LazyPublicMarketingRoutes"),
  "lazyRoutes.ts must export LazyPublicMarketingRoutes"
);
assertCheck(
  lazyRoutesSource.includes("LazyFastConnectionPage"),
  "lazyRoutes.ts must export LazyFastConnectionPage"
);

const forbiddenEagerAdminImports = [
  'from "./components/admin/AdminShell"',
  'from "./pages/AdminHubPage"',
  'from "./pages/AdminAuthPage"'
];
for (const snippet of forbiddenEagerAdminImports) {
  assertCheck(!appSource.includes(snippet), `App.tsx must not eagerly import admin module: ${snippet}`);
}

assertCheck(
  appSource.includes("LazyAdminConsoleRoot"),
  "App.tsx must lazy-load admin via LazyAdminConsoleRoot"
);
assertCheck(
  appSource.includes("<Suspense") && appSource.includes("LazyPublicMarketingRoutes"),
  "App.tsx must suspense-wrap public marketing routes"
);
assertCheck(
  appSource.includes("LazyFastConnectionPage"),
  "App.tsx must lazy-load Fast Connection"
);

assertCheck(
  photoUploadSource.includes('await import("heic2any")'),
  "photoUpload.ts must dynamically import heic2any"
);
assertCheck(
  !photoUploadSource.includes('import heic2any from "heic2any"') &&
    !photoUploadSource.includes('from "heic2any"'),
  "photoUpload.ts must not statically import heic2any"
);

if (swSource) {
  assertCheck(
    swSource.includes("caches.keys()") && swSource.includes("caches.delete"),
    "service worker must delete stale caches on activate"
  );
  assertCheck(!swSource.includes("location.reload()"), "service worker must not force infinite reload loops");
}

console.log("bundle performance checks passed");
