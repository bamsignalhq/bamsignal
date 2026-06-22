import { ANNUAL_REPORT_CATEGORIES } from "../constants/annualRelationshipReport";
import {
  listArchitectureAnnualReports,
  type AnnualRelationshipReportViewModel
} from "./annualRelationshipReportLogic";

export type AnnualRelationshipReportBundle = {
  reports: AnnualRelationshipReportViewModel[];
  categories: typeof ANNUAL_REPORT_CATEGORIES;
};

export function getAnnualRelationshipReportBundle(): AnnualRelationshipReportBundle {
  return {
    reports: listArchitectureAnnualReports(),
    categories: ANNUAL_REPORT_CATEGORIES
  };
}

export function getAnnualRelationshipReport(
  reportId: string
): AnnualRelationshipReportViewModel | null {
  return listArchitectureAnnualReports().find((report) => report.id === reportId) ?? null;
}
