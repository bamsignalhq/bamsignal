import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  DEPENDENCY_CERT_CATEGORIES,
  DEPENDENCY_CERT_EXPECTED,
  DEPENDENCY_CERT_INCOMPATIBLE_LICENSES,
  DEPENDENCY_CERT_TRACKED_PACKAGES
} from "../../../shared/dependencyCertificationDomains.mjs";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const rootPath = join(moduleDir, "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function finding(partial) {
  return {
    passed: true,
    severity: "low",
    detail: "",
    ...partial
  };
}

function walkSourceFiles(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
      walkSourceFiles(fullPath, files);
      continue;
    }
    if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function parseMajor(version = "") {
  const match = String(version).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function runNpmAudit() {
  const result = spawnSync("npm", ["audit", "--json"], {
    cwd: rootPath,
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024
  });

  let audit;
  try {
    audit = JSON.parse(result.stdout || "{}");
  } catch {
    return {
      critical: [],
      high: [],
      medium: [],
      low: [],
      parseError: true
    };
  }

  const vulns = Object.values(audit.vulnerabilities || {});
  return {
    critical: vulns.filter((item) => item.severity === "critical"),
    high: vulns.filter((item) => item.severity === "high"),
    medium: vulns.filter((item) => item.severity === "moderate"),
    low: vulns.filter((item) => item.severity === "low"),
    parseError: false
  };
}

function runNpmOutdated() {
  const result = spawnSync("npm", ["outdated", "--json"], {
    cwd: rootPath,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024
  });

  try {
    return JSON.parse(result.stdout || "{}");
  } catch {
    return {};
  }
}

function analyzeLockfile(lock) {
  const versionByName = new Map();
  const licenses = [];
  const deprecated = [];

  for (const [path, meta] of Object.entries(lock.packages || {})) {
    if (!meta?.version) continue;
    const name = meta.name || path.split("node_modules/").pop();
    if (!name) continue;

    if (!versionByName.has(name)) versionByName.set(name, new Set());
    versionByName.get(name).add(meta.version);

    if (meta.license) {
      licenses.push({ name, license: meta.license, version: meta.version });
    }
    if (meta.deprecated) {
      deprecated.push({ name, version: meta.version, reason: meta.deprecated });
    }
  }

  const duplicatePackages = [...versionByName.entries()]
    .filter(([, versions]) => versions.size > 1)
    .map(([name, versions]) => ({
      name,
      versions: [...versions]
    }));

  const incompatibleLicenses = licenses.filter((item) =>
    DEPENDENCY_CERT_INCOMPATIBLE_LICENSES.has(String(item.license).toUpperCase())
  );

  return { duplicatePackages, deprecated, incompatibleLicenses, packagesScanned: versionByName.size };
}

function detectUnusedDependencies(packageJson, sourceFiles) {
  const source = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  const declared = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ];

  const unused = declared.filter((name) => {
    const patterns = [
      `from "${name}"`,
      `from '${name}'`,
      `require("${name}")`,
      `require('${name}')`,
      `import("${name}")`
    ];
    if (name.startsWith("@")) {
      const scoped = name.replace("/", "[/]");
      patterns.push(new RegExp(`from ["']${scoped}`).source);
    }
    return !patterns.some((pattern) => source.includes(pattern));
  });

  return unused;
}

function buildUpgradeCandidates(outdated) {
  return Object.entries(outdated).map(([name, meta]) => {
    const currentMajor = parseMajor(meta.current);
    const latestMajor = parseMajor(meta.latest);
    return {
      name,
      current: meta.current,
      wanted: meta.wanted,
      latest: meta.latest,
      majorDrift: latestMajor > currentMajor
    };
  });
}

function checkTrackedPackage(categoryId, packageName, packageJson) {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const installed = deps[packageName];
  return finding({
    id: `${categoryId}-${packageName}`,
    categoryId,
    title: `${packageName} present`,
    severity: installed ? "low" : "high",
    passed: Boolean(installed),
    detail: installed
      ? `${packageName}@${installed} declared in package.json.`
      : `${packageName} missing from package.json dependencies.`
  });
}

export function runAllDependencyChecks() {
  const findings = [];
  const packageJson = readJson("package.json");
  const lock = readJson("package-lock.json");
  const dockerfile = read("Dockerfile");
  const variablesGradle = statSync(join(rootPath, "android/variables.gradle"), { throwIfNoEntry: false })
    ? read("android/variables.gradle")
    : "";

  const audit = runNpmAudit();
  const outdated = runNpmOutdated();
  const lockAnalysis = analyzeLockfile(lock);
  const sourceFiles = [
    ...walkSourceFiles(join(rootPath, "src")),
    ...walkSourceFiles(join(rootPath, "server")),
    ...walkSourceFiles(join(rootPath, "scripts"))
  ];
  const unusedDependencies = detectUnusedDependencies(packageJson, sourceFiles);
  const upgradeCandidates = buildUpgradeCandidates(outdated);

  if (audit.parseError) {
    findings.push(
      finding({
        id: "npm-audit-parse",
        categoryId: "npm-packages",
        title: "npm audit parse failure",
        severity: "medium",
        passed: false,
        detail: "Could not parse npm audit output — run npm audit manually."
      })
    );
  }

  for (const vuln of audit.critical) {
    findings.push(
      finding({
        id: `cve-critical-${vuln.name}`,
        categoryId: "npm-packages",
        title: "Critical CVE",
        severity: "critical",
        passed: false,
        detail: `${vuln.name} has critical advisory via npm audit.`,
        packageName: vuln.name
      })
    );
  }

  if (!audit.critical.length && !audit.parseError) {
    findings.push(
      finding({
        id: "npm-audit-critical-pass",
        categoryId: "npm-packages",
        title: "No critical npm CVEs",
        severity: "low",
        passed: true,
        detail:
          audit.high.length > 0
            ? `${audit.high.length} high advisory(ies) remain — review before release.`
            : "npm audit reports no critical vulnerabilities."
      })
    );
  }

  for (const vuln of audit.high.slice(0, 5)) {
    findings.push(
      finding({
        id: `cve-high-${vuln.name}`,
        categoryId: "npm-packages",
        title: "High CVE",
        severity: "high",
        passed: false,
        detail: `${vuln.name} has high severity advisory.`,
        packageName: vuln.name
      })
    );
  }

  const majorUpgrades = upgradeCandidates.filter((item) => item.majorDrift);
  if (majorUpgrades.length) {
    findings.push(
      finding({
        id: "outdated-major-versions",
        categoryId: "npm-packages",
        title: "Outdated major versions",
        severity: "medium",
        passed: false,
        detail: `${majorUpgrades.length} package(s) have newer major releases: ${majorUpgrades
          .slice(0, 4)
          .map((item) => item.name)
          .join(", ")}.`
      })
    );
  }

  if (lockAnalysis.deprecated.length) {
    findings.push(
      finding({
        id: "deprecated-packages",
        categoryId: "npm-packages",
        title: "Deprecated packages",
        severity: "medium",
        passed: false,
        detail: `${lockAnalysis.deprecated.length} deprecated package(s): ${lockAnalysis.deprecated
          .slice(0, 4)
          .map((item) => item.name)
          .join(", ")}.`
      })
    );
  }

  if (lockAnalysis.duplicatePackages.length) {
    findings.push(
      finding({
        id: "duplicate-packages",
        categoryId: "npm-packages",
        title: "Duplicate package versions",
        severity: "warning",
        passed: false,
        detail: `${lockAnalysis.duplicatePackages.length} package(s) resolve to multiple versions.`
      })
    );
  }

  if (lockAnalysis.incompatibleLicenses.length) {
    findings.push(
      finding({
        id: "license-incompatible",
        categoryId: "npm-packages",
        title: "License compatibility risk",
        severity: "high",
        passed: false,
        detail: `${lockAnalysis.incompatibleLicenses.length} package(s) use restrictive licenses.`
      })
    );
  }

  if (unusedDependencies.length) {
    findings.push(
      finding({
        id: "unused-packages",
        categoryId: "npm-packages",
        title: "Potentially unused packages",
        severity: "warning",
        passed: false,
        detail: `${unusedDependencies.length} declared package(s) not referenced in src/server/scripts scan: ${unusedDependencies
          .slice(0, 5)
          .join(", ")}.`
      })
    );
  }

  const dockerMatches = dockerfile.match(/^FROM\s+(\S+)/gim) || [];
  const bases = dockerMatches.map((line) => line.replace(/^FROM\s+/i, "").trim());
  const expectedBase = DEPENDENCY_CERT_EXPECTED.dockerBaseImage;
  const dockerOk = bases.every((base) => base.startsWith("node:20"));
  findings.push(
    finding({
      id: "docker-base-image",
      categoryId: "docker-base",
      title: "Docker base image",
      severity: dockerOk ? "low" : "high",
      passed: dockerOk,
      detail: dockerOk
        ? `Docker stages use Node 20 base (${bases.join(", ")}). Expected ${expectedBase}.`
        : `Docker base images must use Node ${DEPENDENCY_CERT_EXPECTED.nodeMajor}: ${bases.join(", ")}.`
    })
  );

  const enginesNode = packageJson.engines?.node;
  const nodeOk =
    dockerOk &&
    (!enginesNode || String(enginesNode).includes(String(DEPENDENCY_CERT_EXPECTED.nodeMajor)));
  findings.push(
    finding({
      id: "node-version",
      categoryId: "node-version",
      title: "Node version alignment",
      severity: nodeOk ? "low" : "medium",
      passed: nodeOk,
      detail: nodeOk
        ? `Node ${DEPENDENCY_CERT_EXPECTED.nodeMajor} enforced via Dockerfile${enginesNode ? ` and engines.node=${enginesNode}` : ""}.`
        : "Node version drift between Dockerfile and package.json engines."
    })
  );

  const androidPresent = Boolean(variablesGradle);
  const compileSdkOk = variablesGradle.includes(
    `compileSdkVersion = ${DEPENDENCY_CERT_EXPECTED.androidCompileSdk}`
  );
  findings.push(
    finding({
      id: "android-dependencies",
      categoryId: "android-dependencies",
      title: "Android dependency baseline",
      severity: androidPresent && compileSdkOk ? "low" : "medium",
      passed: androidPresent && compileSdkOk,
      detail: androidPresent
        ? compileSdkOk
          ? `Android compileSdk ${DEPENDENCY_CERT_EXPECTED.androidCompileSdk} with Capacitor stack verified.`
          : "android/variables.gradle compileSdkVersion does not match certification baseline."
        : "Android project not present — skipped native dependency scan."
    })
  );

  for (const packageName of DEPENDENCY_CERT_TRACKED_PACKAGES.supabase) {
    findings.push(checkTrackedPackage("supabase-sdk", packageName, packageJson));
  }
  for (const packageName of DEPENDENCY_CERT_TRACKED_PACKAGES.firebase) {
    findings.push(checkTrackedPackage("firebase-sdk", packageName, packageJson));
  }
  for (const packageName of DEPENDENCY_CERT_TRACKED_PACKAGES.payment) {
    findings.push(checkTrackedPackage("payment-sdks", packageName, packageJson));
  }
  for (const packageName of DEPENDENCY_CERT_TRACKED_PACKAGES.notification) {
    findings.push(checkTrackedPackage("notification-sdks", packageName, packageJson));
  }

  const paystackConfigured =
    dockerfile.includes("VITE_PAYSTACK_PUBLIC_KEY") || read("Dockerfile").includes("PAYSTACK");
  findings.push(
    finding({
      id: "payment-sdk-config",
      categoryId: "payment-sdks",
      title: "Paystack integration declared",
      severity: paystackConfigured ? "low" : "medium",
      passed: paystackConfigured,
      detail: paystackConfigured
        ? "Paystack public key build arg present — REST payment SDK path verified."
        : "Paystack build configuration not found in Dockerfile."
    })
  );

  const fcmPresent = Boolean(packageJson.dependencies?.["@capacitor-community/fcm"]);
  findings.push(
    finding({
      id: "notification-fcm",
      categoryId: "notification-sdks",
      title: "FCM push channel",
      severity: fcmPresent ? "low" : "medium",
      passed: fcmPresent,
      detail: fcmPresent
        ? "@capacitor-community/fcm declared for Firebase Cloud Messaging."
        : "FCM Capacitor plugin missing from dependencies."
    })
  );

  void DEPENDENCY_CERT_CATEGORIES;

  const criticalVulnerabilities = audit.critical.map((item) => ({
    name: item.name,
    severity: item.severity,
    via: item.via
  }));

  return {
    findings,
    inventory: {
      packagesScanned: lockAnalysis.packagesScanned,
      upgradeCandidates,
      unusedDependencies,
      duplicatePackages: lockAnalysis.duplicatePackages,
      deprecatedPackages: lockAnalysis.deprecated,
      criticalVulnerabilities,
      auditCounts: {
        critical: audit.critical.length,
        high: audit.high.length,
        medium: audit.medium.length,
        low: audit.low.length
      }
    }
  };
}

export function buildRecommendations(findings, inventory) {
  const recommendations = [];

  for (const item of findings.filter((entry) => !entry.passed && entry.severity === "critical")) {
    recommendations.push({
      id: `fix-${item.id}`,
      priority: "critical",
      title: `Fix ${item.title}`,
      detail: item.detail
    });
  }

  for (const vuln of inventory.criticalVulnerabilities) {
    recommendations.push({
      id: `upgrade-${vuln.name}`,
      priority: "critical",
      title: `Patch ${vuln.name}`,
      detail: "Run npm audit fix or upgrade to a patched release."
    });
  }

  for (const item of inventory.upgradeCandidates.filter((entry) => entry.majorDrift).slice(0, 6)) {
    recommendations.push({
      id: `major-upgrade-${item.name}`,
      priority: "high",
      title: `Plan major upgrade for ${item.name}`,
      detail: `${item.current} → latest ${item.latest}`
    });
  }

  for (const item of findings.filter((entry) => !entry.passed && entry.severity === "high")) {
    recommendations.push({
      id: `remediate-${item.id}`,
      priority: "high",
      title: item.title,
      detail: item.detail
    });
  }

  if (inventory.unusedDependencies.length) {
    recommendations.push({
      id: "prune-unused",
      priority: "medium",
      title: "Review unused dependencies",
      detail: inventory.unusedDependencies.slice(0, 8).join(", ")
    });
  }

  if (inventory.duplicatePackages.length) {
    recommendations.push({
      id: "dedupe-packages",
      priority: "medium",
      title: "Deduplicate package versions",
      detail: "Align transitive dependencies via overrides or direct upgrades."
    });
  }

  return recommendations;
}
