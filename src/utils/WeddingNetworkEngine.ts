import { PREPARED_VENDOR_CATEGORIES } from "../constants/weddingNetwork";
import {
  listArchitectureVendorCategories,
  listArchitectureWeddingPlanners,
  type VendorCategoryViewModel,
  type WeddingPlannerViewModel
} from "./weddingNetworkLogic";

export type WeddingNetworkBundle = {
  categories: VendorCategoryViewModel[];
  planners: WeddingPlannerViewModel[];
  categoryCount: number;
};

export function getWeddingNetworkBundle(): WeddingNetworkBundle {
  return {
    categories: listArchitectureVendorCategories(),
    planners: listArchitectureWeddingPlanners(),
    categoryCount: PREPARED_VENDOR_CATEGORIES.length
  };
}

export function getVendorCategory(categoryId: string): VendorCategoryViewModel | null {
  return listArchitectureVendorCategories().find((category) => category.id === categoryId) ?? null;
}
