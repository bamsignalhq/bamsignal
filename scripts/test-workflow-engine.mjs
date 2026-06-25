#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WORKFLOW_ENGINE_DB_TABLES,
  activateWorkflow,
  buildWorkflowSummary,
  canAccessWorkflowEngine,
  formatWorkflowSummaryLine,
  getWorkflowEngineDatabaseTableManifest,
  listActionsForWorkflow,
  listTriggersForWorkflow,
  pauseWorkflow
} from "../server/services/workflowEngine.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/workflowEngineAdmin.ts"), "utf8");
assert(adminSource.includes('WORKFLOW_ENGINE_ADMIN_PATH = "/hard/workflows"'), "workflow route");
assert(adminSource.includes("Automation & Workflow Engine™"), "workflow brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/workflowEngine.ts"), "utf8");
assert(constantsSource.includes("application-received"), "application received workflow");
assert(constantsSource.includes("payment-confirmed"), "payment confirmed workflow");
assert(constantsSource.includes("success-story-requested"), "success story workflow");
assert(constantsSource.includes("journey-milestone"), "journey milestone trigger");
assert(constantsSource.includes("crm-update"), "crm update action");
assert(constantsSource.includes("workflow_definitions"), "workflow_definitions table");
assert(constantsSource.includes("WORKFLOW_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("WORKFLOW_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Visual Workflow Builder"), "visual builder future item");
assert(constantsSource.includes("Conditional Branching"), "conditional branching future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606255000_workflow_engine.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("workflow_definitions"), "workflow_definitions migration");
assert(migrationSource.includes("workflow_triggers"), "workflow_triggers migration");
assert(migrationSource.includes("workflow_run_history"), "workflow_run_history migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/workflows"), "workflow permission");

const engineSource = readFileSync(join(rootPath, "src/utils/workflowEngineEngine.ts"), "utf8");
assert(engineSource.includes("buildWorkflowEngineBundle"), "workflow engine");

const storeSource = readFileSync(join(rootPath, "src/utils/workflowEngineStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "workflow audit logging");
assert(storeSource.includes("pauseWorkflowAutomation"), "pause workflow");
assert(storeSource.includes("activateWorkflowAutomation"), "activate workflow");

const logicSource = readFileSync(join(rootPath, "src/utils/workflowEngineLogic.ts"), "utf8");
assert(logicSource.includes("buildWorkflowSummary"), "summary builder");
assert(logicSource.includes("formatWorkflowSummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/workflowEngineSeed.ts"), "utf8");
assert(seedSource.includes("WORKFLOW_RECORD_SEED"), "workflow seed");
assert(seedSource.includes("WORKFLOW_TRIGGER_SEED"), "trigger seed");
assert(seedSource.includes("WORKFLOW_ACTION_SEED"), "action seed");
assert(seedSource.includes("WORKFLOW_HISTORY_SEED"), "history seed");

const adminComponents = [
  "AutomationOverviewCard.tsx",
  "WorkflowCard.tsx",
  "WorkflowTriggerCard.tsx",
  "WorkflowActionCard.tsx",
  "WorkflowHistoryCard.tsx",
  "WorkflowEnginePage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/workflows", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("WorkflowEnginePage"), "admin hub mounts workflow page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"workflows"'), "workflows nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:workflow-engine"), "package.json defines test:workflow-engine");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("workflow-engine.css"), "workflow styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/workflow-engine.css"), "utf8");
assert(cssSource.includes("workflow-engine-page"), "workflow styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("WORKFLOW_ENGINE_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.workflowEngine.v1"), "localStorage manifest");

assert(WORKFLOW_ENGINE_DB_TABLES.length === 6, "six workflow tables");
assert(getWorkflowEngineDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessWorkflowEngine(["ManageOperations"]), "operations role can access");
assert(canAccessWorkflowEngine(["SystemAdministration"]), "system admin can access");
assert(canAccessWorkflowEngine(["ManageConsultants"]), "consultant managers can access");
assert(!canAccessWorkflowEngine(["ViewMembers"]), "members cannot access");

const workflows = [
  { id: "w1", status: "active", runCount: 10 },
  { id: "w2", status: "active", runCount: 5 },
  { id: "w3", status: "paused", runCount: 2 },
  { id: "w4", status: "disabled", runCount: 0 },
  { id: "w5", status: "draft", runCount: 0 }
];
const history = [
  {
    id: "h1",
    status: "completed",
    startedAt: new Date().toISOString()
  },
  {
    id: "h2",
    status: "failed",
    startedAt: new Date().toISOString()
  }
];

const summary = buildWorkflowSummary(workflows, history);
assert(summary.activeWorkflows === 2, "active workflow count");
assert(summary.runsLast24h === 2, "runs last 24h");
assert(summary.failedRunsLast24h === 1, "failed runs last 24h");
assert(formatWorkflowSummaryLine(summary).includes("active"), "summary line");

const triggers = [
  { workflowId: "payment-confirmed", enabled: true },
  { workflowId: "payment-confirmed", enabled: false },
  { workflowId: "application-received", enabled: true }
];
assert(listTriggersForWorkflow(triggers, "payment-confirmed").length === 1, "workflow triggers");

const actions = [
  { workflowId: "payment-confirmed", enabled: true, sequence: 2 },
  { workflowId: "payment-confirmed", enabled: true, sequence: 1 }
];
const ordered = listActionsForWorkflow(actions, "payment-confirmed");
assert(ordered[0].sequence === 1, "actions ordered by sequence");

const workflow = {
  id: "wf_test",
  workflowRef: "WF-TEST",
  workflowId: "payment-confirmed",
  title: "Test",
  status: "active",
  ownerEmail: "ops@bamsignal.com",
  runCount: 1
};
const paused = pauseWorkflow(workflow, "ops@bamsignal.com");
assert(paused.status === "paused", "workflow paused");

let threw = false;
try {
  pauseWorkflow({ ...workflow, status: "disabled" }, "ops@bamsignal.com");
} catch {
  threw = true;
}
assert(threw, "cannot pause disabled workflow");

const activated = activateWorkflow({ ...workflow, status: "paused" }, "ops@bamsignal.com");
assert(activated.status === "active", "workflow activated");

if (failed) {
  console.error(`\n${failed} workflow engine test(s) failed.`);
  process.exit(1);
}

console.log("Automation & Workflow Engine checks passed.");
