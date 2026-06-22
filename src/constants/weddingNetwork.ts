/** Wedding Network™ — celebration support architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const WEDDING_NETWORK_TITLE = "Wedding Network™";
export const WEDDING_NETWORK_LABEL = "Wedding Network";
export const WEDDING_PLANNER_LABEL = "Wedding Planner";
export const VENDOR_CATEGORY_LABEL = "Vendor Category";

export const WEDDING_NETWORK_SUBCOPY =
  "Wedding planners and trusted vendors — dignified celebration support, not a marketplace.";
export const WEDDING_NETWORK_PURPOSE_COPY =
  "Prepare wedding network architecture — planners and vendor categories reserved, not booking yet.";
export const WEDDING_NETWORK_RESERVED_COPY =
  "Architecture prepared. Wedding planner profiles and vendor connections are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedVendorCategoryId =
  | "wedding-planners"
  | "photographers"
  | "decorators"
  | "mcs"
  | "caterers"
  | "travel-coordinators";

export type PreparedVendorCategoryDefinition = {
  id: PreparedVendorCategoryId;
  title: string;
  description: string;
  plannerId: string;
};

export const PREPARED_VENDOR_CATEGORIES: PreparedVendorCategoryDefinition[] = [
  {
    id: "wedding-planners",
    title: "Wedding Planners",
    description: "Wedding planners — thoughtful coordination with dignity and care.",
    plannerId: "wdn_planner_wedding"
  },
  {
    id: "photographers",
    title: "Photographers",
    description: "Photographers — preserving moments with respect and artistry.",
    plannerId: "wdn_planner_photographers"
  },
  {
    id: "decorators",
    title: "Decorators",
    description: "Decorators — beautiful spaces that honour your celebration.",
    plannerId: "wdn_planner_decorators"
  },
  {
    id: "mcs",
    title: "MCs",
    description: "MCs — warm hosting that brings families together.",
    plannerId: "wdn_planner_mcs"
  },
  {
    id: "caterers",
    title: "Caterers",
    description: "Caterers — shared meals that celebrate community.",
    plannerId: "wdn_planner_caterers"
  },
  {
    id: "travel-coordinators",
    title: "Travel Coordinators",
    description: "Travel coordinators — dignified guest journeys across borders.",
    plannerId: "wdn_planner_travel"
  }
];

export type PreparedWeddingPlannerId =
  | "wdn_planner_wedding"
  | "wdn_planner_photographers"
  | "wdn_planner_decorators"
  | "wdn_planner_mcs"
  | "wdn_planner_caterers"
  | "wdn_planner_travel";

export type PreparedWeddingPlannerDefinition = {
  id: PreparedWeddingPlannerId;
  name: string;
  title: string;
  focus: string;
  categoryId: PreparedVendorCategoryId;
};

export const PREPARED_WEDDING_PLANNERS: PreparedWeddingPlannerDefinition[] =
  PREPARED_VENDOR_CATEGORIES.map((category) => ({
    id: category.plannerId as PreparedWeddingPlannerId,
    name: "Reserved planner",
    title: `${category.title} profile`,
    focus: category.description,
    categoryId: category.id
  }));

export function getPreparedVendorCategory(
  categoryId: PreparedVendorCategoryId
): PreparedVendorCategoryDefinition | undefined {
  return PREPARED_VENDOR_CATEGORIES.find((category) => category.id === categoryId);
}
