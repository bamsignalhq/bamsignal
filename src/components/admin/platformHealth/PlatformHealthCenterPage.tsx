import { useCallback, useEffect, useState } from "react";
import { PLATFORM_HEALTH_FUTURE_CAPABILITIES, PLATFORM_HEALTH_REFRESH_INTERVAL_MS } from "../../../constants/platformHealth";
import {
  PLATFORM_HEALTH_ADMIN_BRAND,
  PLATFORM_HEALTH_ADMIN_PATH
} from "../../../constants/platformHealthAdmin";
import type { PlatformHealthCenterBundle } from "../../../types/platformHealth";
import { buildLivePlatformHealthCenterBundle } from "../../../utils/platformHealthEngine";
import { applyPlatformHealthAcknowledgement } from "../../../utils/platformHealthStore";
import { PlatformHealthAlertsCard } from "./PlatformHealthAlertsCard";
import { PlatformHealthIncidentsCard } from "./PlatformHealthIncidentsCard";
import { PlatformHealthSummaryCard } from "./PlatformHealthSummaryCard";
import { PlatformHealthServiceDetail, PlatformHealthServicesCard } from "./PlatformHealthServicesCard";

export function PlatformHealthCenterPage() {
  const [bundle, setBundle] = useState<PlatformHealthCenterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLivePlatformHealthCenterBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, PLATFORM_HEALTH_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleAcknowledge = useCallback(
    (incidentId: string) => {
      applyPlatformHealthAcknowledgement({
        incidentId,
        actor: "ops@bamsignal.com",
        note: "Acknowledged from Platform Health Center"
      });
      void refresh();
    },
    [refresh]
  );

  const selectedService =
    bundle?.services.find((service) => service.id === selectedServiceId) ??
    bundle?.services.find((service) => service.status !== "healthy") ??
    bundle?.services[0] ??
    null;

  return (
    <div className="platform-health-page">
      <header className="platform-health-page__head">
        <div>
          <h2>{PLATFORM_HEALTH_ADMIN_BRAND}</h2>
          <p>
            Single traffic-light view of every critical dependency — the first screen Operations checks
            every morning. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </header>

      {bundle ? (
        <>
          <PlatformHealthSummaryCard summary={bundle.summary} liveProbe={bundle.liveProbe} />
          <PlatformHealthServicesCard
            services={bundle.services}
            selectedId={selectedService?.id ?? null}
            onSelect={setSelectedServiceId}
          />
          <PlatformHealthServiceDetail service={selectedService} />
          <PlatformHealthIncidentsCard
            activeIncidents={bundle.activeIncidents}
            resolvedIncidents={bundle.resolvedIncidents}
            onAcknowledge={handleAcknowledge}
          />
          <PlatformHealthAlertsCard alerts={bundle.alerts} />

          <section className="platform-health-page__future concierge-consultant-card--glass cc-reveal">
            <header>
              <h3>Future ready</h3>
              <p>Planned integrations for enterprise-grade platform health monitoring.</p>
            </header>
            <ul>
              {PLATFORM_HEALTH_FUTURE_CAPABILITIES.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </section>

          <footer className="platform-health-page__foot">
            <p>Admin path: {PLATFORM_HEALTH_ADMIN_PATH}</p>
            <p>Auto-refresh: every 30 seconds</p>
          </footer>
        </>
      ) : (
        <p className="platform-health-page__empty">Loading platform health…</p>
      )}
    </div>
  );
}
