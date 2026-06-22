import type { CareerCategoryId } from "../constants/careers";

export type CareerRoleLocation = "Lagos" | "Abuja" | "Remote" | "Hybrid";

export type CareerRoleRecord = {
  id: string;
  slug: string;
  title: string;
  categoryId: CareerCategoryId;
  location: CareerRoleLocation;
  employmentType: "Full-time" | "Part-time" | "Contract";
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  featured: boolean;
};

export type CultureHighlight = {
  id: string;
  title: string;
  body: string;
};

export type ValueHighlight = {
  id: string;
  title: string;
  body: string;
};

export type HiringProcessStep = {
  id: string;
  order: number;
  title: string;
  body: string;
};
