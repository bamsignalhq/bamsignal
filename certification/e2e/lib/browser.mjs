/**
 * Playwright browser harness with console / error monitoring.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "../config.mjs";

export async function launchCertBrowser(outputDir) {
  mkdirSync(join(outputDir, "screenshots"), { recursive: true });
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: { width: 390, height: 844 },
    userAgent:
      "BamSignal-Production-Certification/1.0 (Playwright; release-candidate-validation)"
  });

  const consoleErrors = [];
  const pageErrors = [];
  const rejections = [];

  context.on("page", (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({ url: page.url(), text: msg.text() });
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push({ url: page.url(), text: error.message });
    });
    page.on("requestfailed", () => {});
  });

  context.exposeFunction("__certReportRejection", (reason) => {
    rejections.push(String(reason));
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.addEventListener("unhandledrejection", (event) => {
      window.__certReportRejection?.(event.reason?.message || String(event.reason));
    });
  });

  return {
    browser,
    context,
    page,
    monitors: { consoleErrors, pageErrors, rejections },
    async screenshot(label) {
      const safe = label.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      const path = join(outputDir, "screenshots", `${safe}.png`);
      await page.screenshot({ path, fullPage: true });
      return path;
    },
    async close() {
      await context.close();
      await browser.close();
    },
    hasRouteErrorBoundary() {
      return page.locator(".route-error-boundary, [data-route-error]").count();
    }
  };
}

export async function assertNoClientFaults(monitors, checks) {
  if (monitors.consoleErrors.length) {
    checks.push({
      layer: "ui",
      name: "no-console-errors",
      ok: false,
      detail: monitors.consoleErrors.map((e) => e.text).join(" | ")
    });
  } else {
    checks.push({ layer: "ui", name: "no-console-errors", ok: true });
  }

  if (monitors.pageErrors.length) {
    checks.push({
      layer: "ui",
      name: "no-page-errors",
      ok: false,
      detail: monitors.pageErrors.map((e) => e.text).join(" | ")
    });
  } else {
    checks.push({ layer: "ui", name: "no-page-errors", ok: true });
  }

  if (monitors.rejections.length) {
    checks.push({
      layer: "ui",
      name: "no-uncaught-rejections",
      ok: false,
      detail: monitors.rejections.join(" | ")
    });
  } else {
    checks.push({ layer: "ui", name: "no-uncaught-rejections", ok: true });
  }
}

export async function waitForMemberPath(page, expectedPath, timeout = 30_000) {
  await page.waitForFunction(
    (path) => window.location.pathname.replace(/\/$/, "") === path,
    expectedPath,
    { timeout }
  );
}
