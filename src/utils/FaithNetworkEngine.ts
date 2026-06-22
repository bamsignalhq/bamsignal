import { PREPARED_FAITH_CATEGORIES } from "../constants/faithNetwork";
import {
  listArchitectureFaithCategories,
  listArchitectureFaithLeaders,
  type FaithCategoryViewModel,
  type FaithLeaderViewModel
} from "./faithNetworkLogic";

export type FaithNetworkBundle = {
  categories: FaithCategoryViewModel[];
  leaders: FaithLeaderViewModel[];
  categoryCount: number;
};

export function getFaithNetworkBundle(): FaithNetworkBundle {
  return {
    categories: listArchitectureFaithCategories(),
    leaders: listArchitectureFaithLeaders(),
    categoryCount: PREPARED_FAITH_CATEGORIES.length
  };
}

export function getFaithCategory(categoryId: string): FaithCategoryViewModel | null {
  return listArchitectureFaithCategories().find((category) => category.id === categoryId) ?? null;
}
