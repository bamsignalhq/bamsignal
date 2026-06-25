/**
 * Launch Infrastructure Verification™ — server-side helpers.
 */

export function canAccessLaunchInfrastructure(permissions = []) {
  return permissions.includes("ManageOperations") || permissions.includes("SystemAdministration");
}

export function launchInfrastructureRouteRegistered(source) {
  return source.includes("/hard/launch-infrastructure") && source.includes("launchinfrastructure");
}

export function formatLaunchInfrastructureSummary(report) {
  return `${report.readyCount} ready · ${report.warningCount} warning · score ${report.overallScore}`;
}

export function isValidAppleAssociationPayload(payload) {
  return Boolean(
    payload?.applinks?.details?.length &&
      payload.applinks.details.some((detail) => Array.isArray(detail.appIDs) && detail.appIDs.length)
  );
}
