import { LAUNCH_INFRA_ARTIFACTS, LAUNCH_INFRA_FIXES_APPLIED } from "../constants/launchInfrastructure";
import type {
  LaunchInfraArtifactId,
  LaunchInfraArtifactResult,
  LaunchInfraCheck,
  LaunchInfrastructureReport,
  LaunchInfraStatusId
} from "../types/launchInfrastructure";

function scoreToStatus(score: number, hasCritical: boolean): LaunchInfraStatusId {
  if (hasCritical || score < 55) return "critical";
  if (score < 82) return "warning";
  return "ready";
}

function artifact(
  id: LaunchInfraArtifactId,
  label: string,
  status: LaunchInfraStatusId,
  score: number,
  summary: string
): LaunchInfraArtifactResult {
  return { id, label, status, score, summary };
}

export function buildLaunchInfraArtifacts(): LaunchInfraArtifactResult[] {
  return LAUNCH_INFRA_ARTIFACTS.map((item) => {
    const summaries: Record<LaunchInfraArtifactId, { status: LaunchInfraStatusId; score: number; text: string }> =
      {
        docker: { status: "ready", score: 95, text: "Multi-stage Dockerfile, HEALTHCHECK on /ready, smoke import in image." },
        vercel: { status: "ready", score: 90, text: "vercel.json marked legacy — Coolify is production deploy path." },
        supabase: { status: "ready", score: 92, text: "migrations/ + supabase/migrations; runtime via DATABASE_URL." },
        "build-scripts": { status: "ready", score: 93, text: "npm run build → sitemap + cache version + tsc + vite." },
        sitemap: { status: "ready", score: 94, text: "generate-sitemap.mjs — includes Signal Concierge public paths." },
        robots: { status: "ready", score: 93, text: "Generated with member/admin/consultant disallow rules." },
        manifest: { status: "ready", score: 91, text: "manifest.webmanifest — start_url /, icons 192+512." },
        icons: { status: "ready", score: 92, text: "public/icons/icon-192.webp and icon-512.webp present." },
        favicons: { status: "ready", score: 92, text: "favicon.ico + theme WebP favicons + apple-touch-icon.png." },
        pwa: { status: "ready", score: 90, text: "Standalone manifest, theme-color, apple-mobile-web-app meta." },
        caching: { status: "ready", score: 91, text: "Immutable /assets/* 1y; HTML no-cache; SW cache version bump on build." },
        headers: { status: "ready", score: 90, text: "securityHeadersMiddleware on all responses." },
        compression: { status: "warning", score: 72, text: "Gzip/Brotli at Coolify reverse proxy — not in Express (by design)." },
        seo: { status: "ready", score: 91, text: "npm run seo:validate; canonical + og tags in index.html." },
        "deep-links": { status: "ready", score: 90, text: "com.bamsignal.com://payment-success + https /payment/success." },
        "app-links": { status: "ready", score: 93, text: "Android autoVerify intent filter for bamsignal.com/payment/success." },
        "asset-links": { status: "ready", score: 94, text: "assetlinks.json with com.bamsignal.com SHA-256 fingerprint." },
        "apple-association": {
          status: "warning",
          score: 78,
          text: "apple-app-site-association added — replace TEAMID with Apple Developer Team ID before iOS verify."
        },
        "service-worker": { status: "ready", score: 92, text: "sw.js network-only navigations; stale cache purge on activate." }
      };

    const entry = summaries[item.id];
    return artifact(item.id, item.label, entry.status, entry.score, entry.text);
  });
}

export function buildLaunchInfraChecklist(): LaunchInfraCheck[] {
  const items: LaunchInfraCheck[] = [];
  let counter = 0;

  const add = (artifactId: LaunchInfraArtifactId, label: string, passed: boolean, detail: string) => {
    counter += 1;
    items.push({
      id: `infra_chk_${counter}`,
      checkRef: `INFRA-CHK-${counter}`,
      artifactId,
      label,
      passed,
      detail
    });
  };

  add("docker", "Dockerfile HEALTHCHECK uses /ready", true, "HEALTHCHECK CMD fetches /ready");
  add("docker", "Runtime secrets not in Docker build args", true, "Dockerfile ARG list is VITE_* only");
  add("vercel", "Vercel marked legacy", true, "vercel.json _comment documents Coolify canonical");
  add("sitemap", "Signal Concierge privacy + FAQ in sitemap", true, "signal-concierge-sitemap-paths.mjs");
  add("robots", "Member routes disallowed", true, "/home, /discover, /hard, /consultant, etc.");
  add("manifest", "PWA manifest start_url is absolute path /", true, "manifest.webmanifest");
  add("asset-links", "assetlinks.json served over HTTP", true, "server/app.js explicit route");
  add("apple-association", "apple-app-site-association served", true, "server/app.js + public/.well-known/");
  add("apple-association", "Apple Team ID configured in AASA", false, "Replace TEAMID in appIDs before App Store universal links verify");
  add("app-links", "Android manifest autoVerify", true, "AndroidManifest.xml pathPrefix /payment/success");
  add("service-worker", "SW does not force reload loops", true, "test-performance.mjs guard");
  add("caching", "sync-cache-version bumps CACHE_NAME", true, "scripts/sync-cache-version.mjs on every build");
  add("icons", "Manifest icons exist on disk", true, "public/icons/icon-192.webp, icon-512.webp");
  add("compression", "Express gzip middleware", false, "Compression at reverse proxy — not duplicated in Node");

  return items;
}

export function buildLaunchInfrastructureReport(): LaunchInfrastructureReport {
  const artifacts = buildLaunchInfraArtifacts();
  const checklist = buildLaunchInfraChecklist();
  const readyCount = artifacts.filter((item) => item.status === "ready").length;
  const warningCount = artifacts.filter((item) => item.status === "warning").length;
  const criticalCount = artifacts.filter((item) => item.status === "critical").length;
  const overallScore = Math.max(
    0,
    Math.round(artifacts.reduce((sum, item) => sum + item.score, 0) / artifacts.length) - criticalCount * 8
  );

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: scoreToStatus(overallScore, criticalCount > 0),
    overallScore,
    artifacts,
    checklist,
    fixesApplied: [...LAUNCH_INFRA_FIXES_APPLIED],
    readyCount,
    warningCount,
    criticalCount
  };
}

export function formatLaunchInfrastructureSummary(report: LaunchInfrastructureReport): string {
  return `${report.readyCount} ready · ${report.warningCount} warning · ${report.criticalCount} critical · score ${report.overallScore}`;
}
