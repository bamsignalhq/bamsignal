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

async function collectWebVitals(page) {
  return page.evaluate(() =>
    new Promise((resolve) => {
      let lcp = 0;
      let cls = 0;
      let fid = 0;

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

      setTimeout(() => resolve({ lcp, cls: Math.round(cls * 1000) / 1000, fid }), 3500);
    })
  );
}

export async function measureWebPerformance(baseUrl, { headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.clearCookies();
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const coldNav = await collectNavigationTiming(page);
  const coldVitals = await collectWebVitals(page);

  let memoryMb = 0;
  try {
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
      }
      return 0;
    });
    memoryMb = metrics;
  } catch {
    memoryMb = 0;
  }

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const warmNav = await collectNavigationTiming(page);

  await page.goto(`${baseUrl}/`);
  await page.waitForTimeout(500);
  const memoryAfter = await page.evaluate(() =>
    performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 0
  );

  const memoryGrowthPercent =
    memoryMb > 0 ? Math.round(((memoryAfter - memoryMb) / memoryMb) * 1000) / 10 : 0;

  const cpuProxyMs = Math.max(0, warmNav.load - coldNav.load);

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
