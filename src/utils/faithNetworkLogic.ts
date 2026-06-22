import type {
  PreparedFaithCategoryDefinition,
  PreparedFaithCategoryId,
  PreparedFaithLeaderDefinition,
  PreparedFaithLeaderId
} from "../constants/faithNetwork";
import { PREPARED_FAITH_CATEGORIES, PREPARED_FAITH_LEADERS } from "../constants/faithNetwork";

export type FaithLeaderViewModel = {
  id: PreparedFaithLeaderId;
  name: string;
  title: string;
  focus: string;
  categoryTitle: string;
  statusLabel: string;
};

export type FaithCategoryViewModel = {
  id: PreparedFaithCategoryId;
  title: string;
  description: string;
  leader: FaithLeaderViewModel;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildFaithLeaderViewModel(leader: PreparedFaithLeaderDefinition): FaithLeaderViewModel {
  const category = PREPARED_FAITH_CATEGORIES.find((item) => item.id === leader.categoryId);
  return {
    id: leader.id,
    name: leader.name,
    title: leader.title,
    focus: leader.focus,
    categoryTitle: category?.title ?? leader.categoryId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFaithCategoryViewModel(
  category: PreparedFaithCategoryDefinition
): FaithCategoryViewModel {
  const leader = PREPARED_FAITH_LEADERS.find((item) => item.id === category.leaderId);
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    leader: buildFaithLeaderViewModel(
      leader ?? {
        id: category.leaderId as PreparedFaithLeaderId,
        name: "Reserved leader",
        title: `${category.title} profile`,
        focus: category.description,
        categoryId: category.id
      }
    ),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureFaithCategories(): FaithCategoryViewModel[] {
  return [...PREPARED_FAITH_CATEGORIES.map(buildFaithCategoryViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureFaithLeaders(): FaithLeaderViewModel[] {
  return [...PREPARED_FAITH_LEADERS.map(buildFaithLeaderViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}
