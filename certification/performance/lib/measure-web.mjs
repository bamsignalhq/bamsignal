import { chromium } from "playwright";

async function collectNavigationTiming(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      ttfb: nav ? Math.round(nav.responseStart) : 0,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
      load: nav ? Math.round(nav.loadEventEnd) : 0
    };
  });
}

async function collectWebVitals(page, waitMs = 2800) {
  return page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        let lcp = 0;
        let cls = 0;
        let fid = 0;
        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          resolve({ lcp, cls: Math.round(cls * 1000) / 1000, fid });
        };

        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length) lcp = Math.round(entries[entries.length - 1].startTime);
          });
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        } catch {
          // unsupported
        }

        try {
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) cls += entry.value;
            }
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch {
          // unsupported
        }

        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entry = list.getEntries()[0];
            if (entry) fid = Math.round(entry.processingStart - entry.startTime);
          });
          fidObserver.observe({ type: "first-input", buffered: true });
        } catch {
          // unsupported
        }

        window.setTimeout(finish, timeoutMs);
      }),
    waitMs
  );
}

export async function measureWebPerformance(baseUrl, { headless = true } = {}) {
  const browser = await chromium.launch({ headless });

  const coldContext = await browser.newContext({
    serviceWorkers: "block",
    ignoreHTTPSErrors: true
  });
  const coldPage = await coldContext.newPage();
  await coldPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const coldNav = await collectNavigationTiming(coldPage);
  const coldVitals = await collectWebVitals(coldPage);

  let memoryMb = 0;
  try {
    memoryMb = await coldPage.evaluate(() =>
      performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 0
    );
  } catch {
    memoryMb = 0;
  }

  await coldContext.close();

  const warmContext = await browser.newContext({
    serviceWorkers: "block",
    ignoreHTTPSErrors: true
  });
  const warmPage = await warmContext.newPage();
  await warmPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const warmNav = await collectNavigationTiming(warmPage);

  await warmPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await warmPage.waitForTimeout(400);
  const memoryAfter = await warmPage.evaluate(() =>
    performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 0
  );

  const memoryGrowthPercent =
    memoryMb > 0 ? Math.round(((memoryAfter - memoryMb) / memoryMb) * 1000) / 10 : 0;

  const cpuProxyMs = Math.max(0, warmNav.load - coldNav.load);

  await warmContext.close();
  await browser.close();

  return {
    coldStartupMs: coldNav.domContentLoaded || coldNav.load,
    warmStartupMs: warmNav.domContentLoaded || warmNav.load,
    lcpMs: coldVitals.lcp || coldNav.load,
    cls: coldVitals.cls,
    fidMs: coldVitals.fid,
    ttfbMs: coldNav.ttfb,
    memoryMb: memoryAfter || memoryMb,
    memoryGrowthPercent,
    cpuProxyMs
  };
}
