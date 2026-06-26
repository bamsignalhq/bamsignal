/** Enterprise Codebase Cleanup™ — engineering health audit domains and remediation inventory. */

import type { EngineeringHealthDomainId, EngineeringHealthStatusId } from "../types/enterpriseCodebaseCleanup";

export const ENGINEERING_AUDIT_DOMAINS = [
  { id: "unused-files", label: "Unused Files" },
  { id: "dead-components", label: "Dead Components" },
  { id: "duplicate-utilities", label: "Duplicate Utilities" },
  { id: "duplicate-constants", label: "Duplicate Constants" },
  { id: "duplicate-hooks", label: "Duplicate Hooks" },
  { id: "duplicate-types", label: "Duplicate Types" },
  { id: "unused-css", label: "Unused CSS" },
  { id: "unused-tailwind", label: "Unused Tailwind" },
  { id: "unused-images", label: "Unused Images" },
  { id: "unused-icons", label: "Unused Icons" },
  { id: "unused-routes", label: "Unused Routes" },
  { id: "unused-layouts", label: "Unused Layouts" },
  { id: "unused-imports", label: "Unused Imports" },
  { id: "circular-imports", label: "Circular Imports" },
  { id: "duplicate-business-logic", label: "Duplicate Business Logic" },
  { id: "duplicate-validation", label: "Duplicate Validation" },
  { id: "duplicate-formatters", label: "Duplicate Formatters" },
  { id: "duplicate-helpers", label: "Duplicate Helpers" },
  { id: "duplicate-tests", label: "Duplicate Tests" }
] as const;

export const ENGINEERING_DOMAIN_LABELS: Record<EngineeringHealthDomainId, string> = Object.fromEntries(
  ENGINEERING_AUDIT_DOMAINS.map((item) => [item.id, item.label])
) as Record<EngineeringHealthDomainId, string>;

export const ENGINEERING_HEALTH_STATUSES = [
  { id: "healthy", label: "Healthy" },
  { id: "review", label: "Needs Review" },
  { id: "debt", label: "Technical Debt" }
] as const;

export const ENGINEERING_HEALTH_STATUS_LABELS: Record<EngineeringHealthStatusId, string> =
  Object.fromEntries(ENGINEERING_HEALTH_STATUSES.map((item) => [item.id, item.label])) as Record<
    EngineeringHealthStatusId,
    string
  >;

export const ENGINEERING_DUPLICATE_FINDINGS = [
  {
    id: "consultant-workload-card",
    paths: [
      "src/components/admin/concierge/ConsultantWorkloadCard.tsx",
      "src/components/admin/workforce/ConsultantWorkloadCard.tsx"
    ],
    reason: "Same component name, different prop contracts — consolidate only when both surfaces are touched."
  },
  {
    id: "performance-summary-formatter",
    paths: [
      "src/utils/performanceCenterLogic.ts:formatPerformanceSummaryLine",
      "src/utils/productionPerformanceLogic.ts:formatPerformanceHealthSummaryLine"
    ],
    reason: "Distinct formatters for performance center vs optimization health — names disambiguated."
  }
] as const;

export const ENGINEERING_STANDARDIZATION_TARGETS = [
  "Folder structure: institutional centers under src/components/admin/<center>/",
  "Naming: HardTab ids camelCase, route slugs kebab-case in /hard/*",
  "Imports: direct paths — no barrel re-exports on hot member paths",
  "Constants: *Admin.ts for route/brand, domain constants in dedicated files",
  "Utilities: *Logic.ts for pure transforms, *Engine.ts for orchestration",
  "Hooks: colocated with feature or src/hooks when shared",
  "Types: src/types/<feature>.ts per institutional center",
  "Components: PascalCase files matching export name",
  "Routes: hardRoutes.ts TAB_SLUGS is canonical slug registry",
  "File naming: kebab-case CSS, camelCase TS modules"
] as const;

export const ENGINEERING_CLEANUP_FIXES = [
  "Removed deprecated WorkloadCard.tsx — ConsultantWorkloadCard is canonical",
  "Removed orphan InterestPicker.tsx and InterestPickerSheet.tsx — MoreAboutMePicker replaced them",
  "Removed duplicate scripts/test-bundle-performance.mjs — checks live in test-performance.mjs",
  "Added npm run lint (tsc --noEmit) for type-level hygiene",
  "Added npm run test alias for certification suite",
  "Enterprise cleanup dashboard at /hard/enterprise-cleanup with engineering health report",
  "Enabled tsconfig noUnusedLocals and noUnusedParameters for zero-warning lint",
  "Removed consultationPayment.ts service shim — imports use consultationPayments.ts",
  "Renamed production performance formatter to formatPerformanceHealthSummaryLine"
] as const;

export const ENGINEERING_REMOVED_FILES = [
  "src/components/admin/concierge/WorkloadCard.tsx",
  "src/components/InterestPicker.tsx",
  "src/components/profile/InterestPickerSheet.tsx",
  "scripts/test-bundle-performance.mjs",
  "src/services/consultationPayment.ts"
] as const;
