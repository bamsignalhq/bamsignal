import { PREPARED_TRUST_CATEGORIES } from "../constants/bamSignalTrust";
import { listArchitectureTrustCategories, type TrustCategoryViewModel } from "./bamSignalTrustLogic";

export type BamSignalTrustBundle = {
  categories: TrustCategoryViewModel[];
  categoryCount: number;
};

export function getBamSignalTrustBundle(): BamSignalTrustBundle {
  return {
    categories: listArchitectureTrustCategories(),
    categoryCount: PREPARED_TRUST_CATEGORIES.length
  };
}

export function getTrustCategory(categoryId: string): TrustCategoryViewModel | null {
  return listArchitectureTrustCategories().find((category) => category.id === categoryId) ?? null;
}
