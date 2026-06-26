import { ENV_REGISTRY } from "./environmentRegistry.mjs";
import { registryEntryWithUsage } from "./environmentRegistry.mjs";

/**
 * Build machine-readable environment dependency report.
 * @param {string} target
 */
export function buildEnvironmentDependencyReport(target = "staging") {
  const normalized = String(target).toLowerCase();
  return ENV_REGISTRY.map((entry) => {
    const enriched = registryEntryWithUsage(entry);
    return {
    variable: enriched.name,
    group: enriched.group,
    whereUsed: enriched.usedIn || [],
    scope: entry.scope,
    required:
      entry.required === "critical" ? "mandatory" : entry.required === "warning" ? "recommended" : "optional",
    requiredLevel: entry.required,
    profiles: entry.envs,
    activeInTarget: entry.envs.includes(normalized),
    productionOnly: entry.envs.length === 1 && entry.envs[0] === "production",
    localOnly: entry.envs.every((env) => env === "local" || env === "development"),
    staging: entry.envs.includes("staging"),
    validate: entry.validate || null,
    owner: entry.owner,
    rotation: entry.rotation,
    aliases: entry.aliases || []
  };
  });
}

export function dependencyReportMarkdown(rows, target) {
  const lines = [
    `# Environment Dependency Report`,
    "",
    `**Target profile:** ${target}`,
    `**Generated from:** \`shared/environmentRegistry.mjs\``,
    "",
    "| Variable | Group | Required | Profiles | Where used |",
    "|----------|-------|----------|----------|------------|"
  ];

  for (const row of rows) {
    const profiles = row.profiles.join(", ");
    const used = (row.whereUsed.slice(0, 2).join("; ") || "—") + (row.whereUsed.length > 2 ? "…" : "");
    lines.push(
      `| \`${row.variable}\` | ${row.group} | ${row.required} | ${profiles} | ${used.replace(/\|/g, "\\|")} |`
    );
  }

  lines.push("");
  lines.push("## Profile summary");
  lines.push("");
  lines.push("- **`.env.development`** — local engineering; DATABASE_URL optional (dry-run OK)");
  lines.push("- **`.env.staging`** — full integration testing; all staging-critical vars required");
  lines.push("- **`.env.production.example`** — production template; never commit real secrets");
  lines.push("");
  return lines.join("\n");
}
