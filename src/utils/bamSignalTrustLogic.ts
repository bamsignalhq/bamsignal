import type {
  PreparedTrustCategoryDefinition,
  PreparedTrustCategoryId,
  PreparedTrustedProfessionalDefinition,
  PreparedTrustedProfessionalId,
  TrustTimelineEntry
} from "../constants/bamSignalTrust";
import { PREPARED_TRUST_CATEGORIES, PREPARED_TRUSTED_PROFESSIONALS } from "../constants/bamSignalTrust";

export type TrustedProfessionalViewModel = {
  id: PreparedTrustedProfessionalId;
  name: string;
  title: string;
  focus: string;
  categoryTitle: string;
  statusLabel: string;
};

export type TrustCategoryViewModel = {
  id: PreparedTrustCategoryId;
  title: string;
  description: string;
  professional: TrustedProfessionalViewModel;
  timeline: TrustTimelineEntry[];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildCategoryTimeline(category: PreparedTrustCategoryDefinition): TrustTimelineEntry[] {
  const base = new Date("2026-06-15T00:00:00.000Z").getTime();
  const steps = [
    { label: "Trust category prepared", note: "Trusted professionals — not live yet." },
    { label: "Expert guidance reserved", note: category.description },
    { label: "Ecosystem timeline reserved", note: "No marketplace or vendor framing." }
  ];
  return steps.map((step, index) => ({
    id: `bst_timeline_${category.id}_${index}`,
    categoryId: category.id,
    label: step.label,
    recordedAt: new Date(base + index * 21 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildTrustedProfessionalViewModel(
  professional: PreparedTrustedProfessionalDefinition
): TrustedProfessionalViewModel {
  const category = PREPARED_TRUST_CATEGORIES.find((item) => item.id === professional.categoryId);
  return {
    id: professional.id,
    name: professional.name,
    title: professional.title,
    focus: professional.focus,
    categoryTitle: category?.title ?? professional.categoryId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustCategoryViewModel(
  category: PreparedTrustCategoryDefinition
): TrustCategoryViewModel {
  const professional = PREPARED_TRUSTED_PROFESSIONALS.find(
    (item) => item.id === category.professionalId
  );
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    professional: buildTrustedProfessionalViewModel(
      professional ?? {
        id: category.professionalId as PreparedTrustedProfessionalId,
        name: "Reserved professional",
        title: `${category.title} expert`,
        focus: category.description,
        categoryId: category.id
      }
    ),
    timeline: buildCategoryTimeline(category),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureTrustCategories(): TrustCategoryViewModel[] {
  return [...PREPARED_TRUST_CATEGORIES.map(buildTrustCategoryViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
