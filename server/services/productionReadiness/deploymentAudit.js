/**
 * Sprint 7 — Deployment readiness audit contract.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDeploymentMetadata } from "../../deployMetadata.js";
import { PRODUCTION_CERT_VERSION } from "../../../shared/productionCertification.mjs";
import { evaluateEnvironmentCertification } from "../../../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

export function runDeploymentAudit(env = process.env) {
  const findings = [];
  const deploy = getDeploymentMetadata("bamsignal");

  findings.push({
    name: "dockerfile_present",
    passed: existsSync(join(rootPath, "Dockerfile")),
    detail: "Coolify builds from Dockerfile"
  });

  findings.push({
    name: "health_endpoint",
    passed: read("server/services/readiness.js").includes("livenessPayload"),
    detail: "GET /health liveness endpoint"
  });

  findings.push({
    name: "ready_endpoint",
    passed: read("server/services/readiness.js").includes("readinessPayload"),
    detail: "GET /ready readiness with dependency checks"
  });

  findings.push({
    name: "certification_version",
    passed: Boolean(PRODUCTION_CERT_VERSION),
    detail: `Certification version ${PRODUCTION_CERT_VERSION}`
  });

  const migrations = readdirSync(join(rootPath, "migrations"))
    .filter((f) => /^\d{4}_/.test(f))
    .sort();
  const latest = migrations[migrations.length - 1] || "none";
  findings.push({
    name: "migration_order",
    passed: migrations.length > 0,
    detail: `Latest migration: ${latest}`,
    migrationCount: migrations.length
  });

  findings.push({
    name: "pre_push_hook",
    passed: existsSync(join(rootPath, ".githooks/pre-push")) || read("package.json").includes("test:server-import"),
    detail: "Server import smoke test enforced before push"
  });

  const environment = evaluateEnvironmentCertification(env);
  findings.push({
    name: "environment_certification",
    passed: environment.passed || env.NODE_ENV !== "production",
    detail: environment.passed ? "Environment cert PASS" : "Environment cert FAIL (expected in dev)",
    severity: environment.passed ? "info" : "medium"
  });

  findings.push({
    name: "deploy_metadata",
    passed: Boolean(deploy.application),
    detail: `App ${deploy.application} v${deploy.version}`
  });

  const passed = findings.filter((f) => f.passed === false && f.severity !== "medium").length === 0;

  return {
    domain: "deployment",
    passed,
    status: passed ? "PASS" : "WARN",
    findings,
    rollbackStrategy: [
      "Coolify: redeploy previous successful build image",
      "Database: do not rollback migrations — forward-fix only",
      "Feature flags: ops_runtime_configuration maintenance_mode for emergency"
    ],
    recommendations: [
      "Verify Coolify health check uses GET /ready",
      "Confirm all VITE_* build args set in Coolify builder stage",
      "Runtime secrets injected at container start — never in Docker ARG"
    ]
  };
}
