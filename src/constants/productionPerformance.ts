/** Production performance optimization — audit domains and applied fixes. */

import type { PerformanceDomainId, PerformanceStatusId } from "../types/productionPerformance";

export const PERFORMANCE_AUDIT_DOMAINS = [
  { id: "bundle-size", label: "Bundle Size" },
  { id: "code-splitting", label: "Code Splitting" },
  { id: "lazy-loading", label: "Lazy Loading" },
  { id: "image-optimization", label: "Image Optimization" },
  { id: "database-queries", label: "Database Queries" },
  { id: "indexes", label: "Indexes" },
  { id: "react-rendering", label: "React Rendering" },
  { id: "memoization", label: "Memoization" },
  { id: "caching", label: "Caching" },
  { id: "api-calls", label: "API Calls" },
  { id: "network-waterfalls", label: "Network Waterfalls" },
  { id: "duplicate-requests", label: "Duplicate Requests" },
  { id: "storage-usage", label: "Storage Usage" },
  { id: "search", label: "Search" }
] as const;

export const PERFORMANCE_DOMAIN_LABELS: Record<PerformanceDomainId, string> = Object.fromEntries(
  PERFORMANCE_AUDIT_DOMAINS.map((item) => [item.id, item.label])
) as Record<PerformanceDomainId, string>;

export const PERFORMANCE_STATUSES = [
  { id: "optimized", label: "Optimized" },
  { id: "review", label: "Needs Review" },
  { id: "slow", label: "Slow" }
] as const;

export const PERFORMANCE_STATUS_LABELS: Record<PerformanceStatusId, string> = Object.fromEntries(
  PERFORMANCE_STATUSES.map((item) => [item.id, item.label])
) as Record<PerformanceStatusId, string>;

export const PERFORMANCE_OPTIMIZATION_FIXES = [
  "Admin institutional tabs lazy-loaded on demand — smaller AdminConsoleRoot initial chunk",
  "CSS entry bundles split: member core vs admin, public, institute, careers, support, concierge, moment",
  "Vite manual chunks for react, supabase, capacitor, icons, heic2any, tensorflow, photo-crop",
  "heic2any dynamically imported only during photo conversion",
  "Voice Vibe page and react-easy-crop cropper lazy-loaded on demand",
  "modulePreload polyfill disabled for modern browsers",
  "In-flight deduplication for discover profiles and premium status refresh",
  "Service worker stale-cache purge on activate",
  "Member API GET assets use network-first; navigations never cached",
  "Discover city composite index on app_member_profiles (city, onboarding, discoverable)",
  "Profile-by-id client cache prevents repeat member/data fetches"
] as const;
