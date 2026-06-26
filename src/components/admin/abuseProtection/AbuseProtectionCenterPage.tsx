import { useCallback, useEffect, useState } from "react";
import {
  ABUSE_PROTECTION_FUTURE_CAPABILITIES,
  ABUSE_PROTECTION_REFRESH_INTERVAL_MS
} from "../../../constants/abuseProtection";
import {
  ABUSE_PROTECTION_ADMIN_BRAND,
  ABUSE_PROTECTION_ADMIN_PATH
} from "../../../constants/abuseProtectionAdmin";
import type { AbuseProtectionCenterBundle } from "../../../types/abuseProtection";
import { exportAbuseReportCsv } from "../../../utils/abuseProtectionLogic";
import { buildLiveAbuseProtectionCenterBundle } from "../../../utils/abuseProtectionEngine";
import { applyAbuseProtectionAction } from "../../../utils/abuseProtectionStore";
import { AbuseForensicsCard } from "./AbuseForensicsCard";
import { AbuseLiveViewCard } from "./AbuseLiveViewCard";
import { AbuseMonitorCard } from "./AbuseMonitorCard";
import { AbuseProtectionSummaryCard } from "./AbuseProtectionSummaryCard";
import { AbuseRateLimitsCard } from "./AbuseRateLimitsCard";
import { AbuseReportingCard } from "./AbuseReportingCard";

export function AbuseProtectionCenterPage() {
  const [bundle, setBundle] = useState<AbuseProtectionCenterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [forensicsId, setForensicsId] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLiveAbuseProtectionCenterBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, ABUSE_PROTECTION_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleTool = useCallback(
    (tool: "unblock" | "blacklist" | "whitelist" | "manual-review", targetId: string) => {
      applyAbuseProtectionAction({
        tool,
        targetId,
        actor: "safety@bamsignal.com"
      });
      void refresh();
    },
    [refresh]
  );

  const handleAdjustLimit = useCallback(
    (ruleId: string, direction: "increase-limits" | "decrease-limits") => {
      applyAbuseProtectionAction({
        tool: direction,
        targetId: ruleId,
        actor: "safety@bamsignal.com"
      });
      void refresh();
    },
    [refresh]
  );

  const handleExport = useCallback(
    (period: string) => {
      if (!bundle) return;
      const csv = exportAbuseReportCsv(bundle, period);
      if (!csv) return;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `abuse-report-${period}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportMessage(`Exported ${period} abuse report.`);
    },
    [bundle]
  );

  return (
    <div className="abuse-protection-page">
      <header className="abuse-protection-page__head">
        <div>
          <h2>{ABUSE_PROTECTION_ADMIN_BRAND}</h2>
          <p>
            Centralized dashboard for spam, fraud, scraping, OTP abuse, fake accounts, and automated
            attacks — with rate limiting, live blocks, forensics, and reporting. Auto-refreshes every
            30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </header>

      {exportMessage ? <p className="abuse-protection-page__toast">{exportMessage}</p> : null}

      {bundle ? (
        <>
          <AbuseProtectionSummaryCard summary={bundle.summary} />
          <AbuseMonitorCard monitors={bundle.monitors} />
          <AbuseRateLimitsCard rateLimits={bundle.rateLimits} onAdjust={handleAdjustLimit} />
          <AbuseLiveViewCard
            blocks={bundle.blocks}
            suspicious={bundle.suspicious}
            countryStats={bundle.countryStats}
            topIps={bundle.topIps}
            onTool={handleTool}
          />
          <AbuseForensicsCard
            forensics={bundle.forensics}
            selectedId={forensicsId}
            onSelect={setForensicsId}
          />
          <AbuseReportingCard reports={bundle.reports} onExport={handleExport} />

          <section className="abuse-protection-page__future concierge-consultant-card--glass cc-reveal">
            <header>
              <h3>Future ready</h3>
              <p>Planned trust &amp; safety integrations for enterprise-grade abuse defense.</p>
            </header>
            <ul>
              {ABUSE_PROTECTION_FUTURE_CAPABILITIES.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </section>

          <footer className="abuse-protection-page__foot">
            <p>Admin path: {ABUSE_PROTECTION_ADMIN_PATH}</p>
            <p>Auto-refresh: every 30 seconds</p>
          </footer>
        </>
      ) : (
        <p className="abuse-protection-page__empty">Loading abuse protection…</p>
      )}
    </div>
  );
}
