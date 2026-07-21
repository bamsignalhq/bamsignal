#!/usr/bin/env node
/**
 * Validates BamSignal canonical migrations/ integrity.
 * Does not connect to a database or run SQL.
 *
 * Exit 0 on PASS, 1 on FAIL.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "migrations");

/** Intentional unused numbers (Recovery Baseline — July 2026). Do not invent new gaps without updating PLATFORM_GOVERNANCE.md. */
const INTENTIONAL_GAPS = new Set([40, 41, 42, 43, 44, 45, 46, 47]);

const FILENAME_PATTERN = /^(\d{4})_([a-z0-9_]+)\.sql$/i;

function fail(errors) {
  console.log("Migration Integrity Guard");
  console.log("=========================");
  console.log("Directory:  migrations/");
  console.log(`Status:     FAIL (${errors.length} issue${errors.length === 1 ? "" : "s"})`);
  console.log("");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error("");
  console.error("See docs/engineering/PLATFORM_GOVERNANCE.md");
  process.exit(1);
}

function main() {
  const errors = [];

  if (!existsSync(migrationsDir)) {
    fail(["Missing migrations/ directory."]);
  }

  const entries = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (entries.length === 0) {
    fail(["No .sql files found in migrations/."]);
  }

  const byNumber = new Map();
  const byHash = new Map();
  const numbers = [];

  for (const name of entries) {
    const match = name.match(FILENAME_PATTERN);
    if (!match) {
      errors.push(
        `Invalid filename "${name}" — expected NNNN_snake_case_description.sql (four-digit prefix).`
      );
      continue;
    }

    const num = Number.parseInt(match[1], 10);
    const stem = name.replace(/\.sql$/i, "");

    if (byNumber.has(num)) {
      errors.push(`Duplicate migration number ${String(num).padStart(4, "0")}: ${byNumber.get(num)} and ${name}`);
    } else {
      byNumber.set(num, name);
    }

    numbers.push(num);

    const bytes = readFileSync(join(migrationsDir, name));
    if (bytes.length === 0) {
      errors.push(`Empty migration file: ${name}`);
    }

    const hash = createHash("sha256").update(bytes).digest("hex");
    if (byHash.has(hash)) {
      errors.push(`Duplicate SQL content (SHA-256 ${hash.slice(0, 12)}…): ${byHash.get(hash)} and ${name}`);
    } else {
      byHash.set(hash, name);
    }

    // Stem must equal padded number + underscore + description (already enforced by pattern).
    const expectedPrefix = String(num).padStart(4, "0");
    if (!stem.startsWith(`${expectedPrefix}_`)) {
      errors.push(`Stem/number mismatch for ${name}`);
    }
  }

  // Strictly increasing when sorted by filename order (already sorted).
  for (let i = 1; i < numbers.length; i += 1) {
    if (numbers[i] <= numbers[i - 1]) {
      errors.push(
        `Numbering not strictly increasing: ${String(numbers[i - 1]).padStart(4, "0")} then ${String(numbers[i]).padStart(4, "0")}`
      );
    }
  }

  if (numbers.length > 0) {
    const min = numbers[0];
    const max = numbers[numbers.length - 1];
    if (min !== 1) {
      errors.push(`Expected first migration number 0001, found ${String(min).padStart(4, "0")}`);
    }
    for (let n = min; n <= max; n += 1) {
      if (INTENTIONAL_GAPS.has(n)) continue;
      if (!byNumber.has(n)) {
        errors.push(
          `Missing migration number ${String(n).padStart(4, "0")} (not in intentional gap list 0040–0047).`
        );
      }
    }
  }

  if (errors.length > 0) {
    fail(errors);
  }

  const max = numbers[numbers.length - 1];
  console.log("Migration Integrity Guard");
  console.log("=========================");
  console.log("Directory:     migrations/");
  console.log(`File count:    ${entries.length}`);
  console.log(`Number range:  ${String(numbers[0]).padStart(4, "0")} … ${String(max).padStart(4, "0")}`);
  console.log(`Intentional gaps: 0040–0047`);
  console.log(`Next expected: ${String(max + 1).padStart(4, "0")}_…`);
  console.log("Status:        PASS");
  process.exit(0);
}

main();
