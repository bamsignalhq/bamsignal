import { normalizePath } from "./routes";

export const BAMSIGNAL_INSTITUTE_BASE_PATH = "/institute";

export const BAMSIGNAL_INSTITUTE_ROUTES = {
  landing: BAMSIGNAL_INSTITUTE_BASE_PATH,
  programs: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/programs`,
  annualInsights: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/annual-insights`,
  annualRelationshipReports: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/annual-relationship-reports`,
  relationshipLab: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/relationship-lab`,
  bamSignalInsights: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-insights`,
  researchPartnerships: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/research-partnerships`,
  relationshipIndex: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/relationship-index`,
  bamSignalObservatory: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-observatory`,
  hallOfLegacy: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/hall-of-legacy`,
  africanRelationshipArchive: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/african-relationship-archive`,
  bamSignalAcademy: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-academy`,
  academyPrograms: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-academy/programs`,
  learningPaths: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/learning-paths`,
  relationshipMasterclasses: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/relationship-masterclasses`,
  premaritalJourney: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/premarital-journey`,
  bamSignalLibrary: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-library`,
  relationshipCertificates: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/relationship-certificates`,
  bamSignalFellows: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-fellows`,
  africanRelationshipCurriculum: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/african-relationship-curriculum`,
  bamSignalTrust: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/bamsignal-trust`,
  verifiedProfessionals: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/verified-professionals`,
  relationshipCoachNetwork: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/relationship-coach-network`,
  familyAdvisors: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/family-advisors`,
  faithNetwork: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/faith-network`,
  diasporaServices: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/diaspora-services`,
  weddingNetwork: `${BAMSIGNAL_INSTITUTE_BASE_PATH}/wedding-network`
} as const;

export type BamSignalInstituteRoute = keyof typeof BAMSIGNAL_INSTITUTE_ROUTES;

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(BAMSIGNAL_INSTITUTE_ROUTES).map(([route, path]) => [path, route])
) as Record<string, BamSignalInstituteRoute>;

export function isBamSignalInstituteRoute(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  return path === BAMSIGNAL_INSTITUTE_BASE_PATH || path.startsWith(`${BAMSIGNAL_INSTITUTE_BASE_PATH}/`);
}

export function getBamSignalInstituteRoute(
  pathname = window.location.pathname
): BamSignalInstituteRoute | null {
  const path = normalizePath(pathname);
  return PATH_TO_ROUTE[path] ?? null;
}

export function isUnknownBamSignalInstituteSubroute(pathname = window.location.pathname): boolean {
  return isBamSignalInstituteRoute(pathname) && getBamSignalInstituteRoute(pathname) === null;
}

export function bamSignalInstitutePathForRoute(route: BamSignalInstituteRoute): string {
  return BAMSIGNAL_INSTITUTE_ROUTES[route];
}
