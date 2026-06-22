import type { CareerCategoryId } from "../constants/careers";
import { CAREER_CATEGORIES } from "../constants/careers";
import {
  CAREER_ROLES_SEED,
  CULTURE_HIGHLIGHTS_SEED,
  HIRING_PROCESS_STEPS_SEED,
  VALUES_HIGHLIGHTS_SEED
} from "../data/careersSeed";
import type { CareerRoleRecord } from "../types/careers";

export function listCareerRoles(): CareerRoleRecord[] {
  return [...CAREER_ROLES_SEED];
}

export function getCareerRoleBySlug(slug: string): CareerRoleRecord | null {
  return CAREER_ROLES_SEED.find((role) => role.slug === slug) ?? null;
}

export function filterCareerRoles(options?: {
  categoryId?: CareerCategoryId;
  featuredOnly?: boolean;
}): CareerRoleRecord[] {
  return CAREER_ROLES_SEED.filter((role) => {
    if (options?.categoryId && role.categoryId !== options.categoryId) return false;
    if (options?.featuredOnly && !role.featured) return false;
    return true;
  });
}

export function listCultureHighlights() {
  return [...CULTURE_HIGHLIGHTS_SEED];
}

export function listValuesHighlights() {
  return [...VALUES_HIGHLIGHTS_SEED];
}

export function listHiringProcessSteps() {
  return [...HIRING_PROCESS_STEPS_SEED].sort((a, b) => a.order - b.order);
}

export function countOpenRolesByCategory(): Record<CareerCategoryId, number> {
  const counts = Object.fromEntries(
    CAREER_CATEGORIES.map((category) => [category.id, 0])
  ) as Record<CareerCategoryId, number>;

  for (const role of CAREER_ROLES_SEED) {
    counts[role.categoryId] = (counts[role.categoryId] ?? 0) + 1;
  }

  return counts;
}
