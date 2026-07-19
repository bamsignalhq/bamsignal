/** Launch Infrastructure Verification™ — deployment artifact registry. */

import type { LaunchInfraArtifactId } from "../types/launchInfrastructure";

export const LAUNCH_INFRA_ARTIFACTS: { id: LaunchInfraArtifactId; label: string }[] = [
  { id: "docker", label: "Docker" },
  { id: "vercel", label: "Vercel (legacy)" },
  { id: "supabase", label: "Supabase" },
  { id: "build-scripts", label: "Build Scripts" },
  { id: "sitemap", label: "Sitemap" },
  { id: "robots", label: "Robots" },
  { id: "manifest", label: "Manifest" },
  { id: "icons", label: "Icons" },
  { id: "favicons", label: "Favicons" },
  { id: "pwa", label: "PWA" },
  { id: "caching", label: "Caching" },
  { id: "headers", label: "Headers" },
  { id: "compression", label: "Compression" },
  { id: "seo", label: "SEO" },
  { id: "deep-links", label: "Deep Links" },
  { id: "app-links", label: "App Links" },
  { id: "asset-links", label: "Asset Links" },
  { id: "apple-association", label: "Apple Association" },
  { id: "service-worker", label: "Service Worker" }
];

export const LAUNCH_INFRA_FIXES_APPLIED = [
  "Added apple-app-site-association for iOS Universal Links (/payment/success)",
  "Express serves /.well-known/apple-app-site-association and assetlinks.json from dist",
  "iOS associated-domains entitlement: applinks:bamsignal.com",
  "Sitemap includes /signal-concierge/privacy and /signal-concierge/faq",
  "robots.txt disallows /consultant and /subscription member paths",
  "manifest.webmanifest start_url and scope set to /",
  "vercel.json marked legacy — Coolify/Docker is canonical deploy"
] as const;

export const LAUNCH_INFRA_ARTIFACT_PATHS = {
  dockerfile: "Dockerfile",
  vercel: "vercel.json",
  sitemap: "public/sitemap.xml",
  robots: "public/robots.txt",
  manifest: "public/manifest.webmanifest",
  assetlinks: "public/.well-known/assetlinks.json",
  appleAssociation: "public/.well-known/apple-app-site-association",
  serviceWorker: "public/sw.js",
  favicon: "public/favicon.webp",
  appleTouchIcon: "public/apple-touch-icon.png",
  icon192: "public/icons/icon-192.webp",
  icon512: "public/icons/icon-512.webp"
} as const;
