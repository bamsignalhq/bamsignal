/**
 * Single concise startup report — printed once per process.
 */

let reportPrinted = false;

function mark(label, enabled) {
  return `${enabled ? "✓" : "✕"} ${label}`;
}

/**
 * @param {import("./enterpriseStartupValidation.mjs").validateEnterpriseStartup extends (...args: any) => infer R ? R : never} validation
 * @param {import("./serviceRegistry/ServiceRegistry.mjs").ServiceRegistry["startupTimingReport"] extends () => infer R ? R : never} [timing]
 */
export function printStartupReport(validation, timing) {
  if (reportPrinted) return;
  reportPrinted = true;

  const lines = [];
  lines.push("==============================");
  lines.push("BamSignal Startup Report");
  lines.push("");
  lines.push(`Environment: ${validation.mode}`);
  lines.push("");
  lines.push("Critical");
  for (const item of validation.features.filter((f) => f.tier === "critical")) {
    lines.push(`  ${mark(item.label, item.enabled)}`);
  }
  lines.push("");
  lines.push("Important");
  for (const item of validation.features.filter((f) => f.tier === "important")) {
    lines.push(`  ${mark(item.label, item.enabled)}`);
  }
  lines.push("");
  lines.push("Optional");
  for (const item of validation.features.filter((f) => f.tier === "optional")) {
    lines.push(`  ${mark(item.label, item.enabled)}`);
  }
  lines.push("");
  lines.push("Enabled Features");
  for (const name of validation.enabledFeatures) {
    lines.push(`  • ${name}`);
  }
  if (validation.disabledFeatures.length) {
    lines.push("");
    lines.push("Disabled Features");
    for (const name of validation.disabledFeatures) {
      lines.push(`  • ${name}`);
    }
  }
  lines.push("");
  lines.push(`Overall: ${validation.ok ? "READY" : "NOT READY"}`);
  if (timing?.totalStartupMs != null) {
    lines.push(`Registry init: ${timing.totalStartupMs}ms`);
  }
  if (validation.critical.length) {
    lines.push("");
    lines.push("Critical blockers:");
    for (const item of validation.critical) {
      lines.push(`  • ${item.feature}: ${item.reason}`);
    }
  }
  if (validation.secrets?.warnings?.length) {
    lines.push("");
    lines.push("Secret warnings:");
    for (const item of validation.secrets.warnings) {
      lines.push(`  • ${item.name}: ${item.detail}`);
    }
  }
  lines.push("==============================");
  console.log(lines.join("\n"));
}

export function resetStartupReportForTests() {
  reportPrinted = false;
}
