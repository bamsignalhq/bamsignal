import type {
  PreparedVendorCategoryDefinition,
  PreparedVendorCategoryId,
  PreparedWeddingPlannerDefinition,
  PreparedWeddingPlannerId
} from "../constants/weddingNetwork";
import { PREPARED_VENDOR_CATEGORIES, PREPARED_WEDDING_PLANNERS } from "../constants/weddingNetwork";

export type WeddingPlannerViewModel = {
  id: PreparedWeddingPlannerId;
  name: string;
  title: string;
  focus: string;
  categoryTitle: string;
  statusLabel: string;
};

export type VendorCategoryViewModel = {
  id: PreparedVendorCategoryId;
  title: string;
  description: string;
  planner: WeddingPlannerViewModel;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildWeddingPlannerViewModel(
  planner: PreparedWeddingPlannerDefinition
): WeddingPlannerViewModel {
  const category = PREPARED_VENDOR_CATEGORIES.find((item) => item.id === planner.categoryId);
  return {
    id: planner.id,
    name: planner.name,
    title: planner.title,
    focus: planner.focus,
    categoryTitle: category?.title ?? planner.categoryId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildVendorCategoryViewModel(
  category: PreparedVendorCategoryDefinition
): VendorCategoryViewModel {
  const planner = PREPARED_WEDDING_PLANNERS.find((item) => item.id === category.plannerId);
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    planner: buildWeddingPlannerViewModel(
      planner ?? {
        id: category.plannerId as PreparedWeddingPlannerId,
        name: "Reserved planner",
        title: `${category.title} profile`,
        focus: category.description,
        categoryId: category.id
      }
    ),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureVendorCategories(): VendorCategoryViewModel[] {
  return [...PREPARED_VENDOR_CATEGORIES.map(buildVendorCategoryViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureWeddingPlanners(): WeddingPlannerViewModel[] {
  return [...PREPARED_WEDDING_PLANNERS.map(buildWeddingPlannerViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}
