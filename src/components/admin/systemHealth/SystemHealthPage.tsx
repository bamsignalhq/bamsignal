import { useCallback, useEffect, useState } from "react";
import { SYSTEM_HEALTH_FUTURE_CAPABILITIES } from "../../../constants/systemHealth";
import {
  SYSTEM_HEALTH_ADMIN_BRAND,
  SYSTEM_HEALTH_ADMIN_PATH
} from "../../../constants/systemHealthAdmin";
import type { MonitoredServiceId } from "../../../constants/systemHealth";
import type { SystemHealthBundle } from "../../../types/systemHealth";
import { buildLiveSystemHealthBundle } from "../../../utils/systemHealthEngine";
import { DependencyStatusCard } from "./DependencyStatusCard";
import { HealthSummaryCard } from "./HealthSummaryCard";
import { IncidentTimeline } from "./IncidentTimeline";
import { ServiceHealthCard } from "./ServiceHealthCard";

export function SystemHealthPage() {
  const [bundle, setBundle] = useState<SystemHealthBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<MonitoredServiceId | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLiveSystemHealthBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const selectedService =
    bundle?.services.find((service) => service.id === selectedServiceId) ?? bundle?.services[0] ?? null;

  return (
    <div className="system-health-page">
      <header className="system-health-page__head">
        <div>
          <h2>{SYSTEM_HEALTH_ADMIN_BRAND}</h2>
          <p>
            Real-time health dashboard for Supabase, Paystack, scheduling, messaging, storage, and
            institutional background queues.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {bundle ? (
        <>
          <HealthSummaryCard summary={bundle.summary} liveProbe={bundle.liveProbe} />

          <div className="system-health-page__services">
            {bundle.services.map((service) => (
              <ServiceHealthCard
                key={service.id}
                service={service}
                selected={selectedService?.id === service.id}
                onSelect={() => setSelectedServiceId(service.id)}
              />
            ))}
          </div>

          <div className="system-health-page__body">
            <DependencyStatusCard dependencies={bundle.dependencies} />
            <IncidentTimeline incidents={bundle.incidents} />
          </div>

          {selectedService ? (
            <section className="system-health-page__detail concierge-consultant-card--glass cc-reveal">
              <header>
                <h3>{selectedService.label} detail</h3>
                <p>Checked at {new Date(selectedService.checkedAt).toLocaleString()}</p>
              </header>
              <ServiceHealthCard service={selectedService} />
            </section>
          ) : null}

          <section className="system-health-page__future concierge-consultant-card--glass cc-reveal">
            <header>
              <h3>Future ready</h3>
              <p>Documented monitoring integrations planned for institutional operations.</p>
            </header>
            <ul>
              {SYSTEM_HEALTH_FUTURE_CAPABILITIES.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </section>

          <footer className="system-health-page__foot">
            <p>Admin path: {SYSTEM_HEALTH_ADMIN_PATH}</p>
            <p>Auto-refresh: every 60 seconds</p>
          </footer>
        </>
      ) : (
        <p className="system-health-page__empty">Loading system health…</p>
      )}
    </div>
  );
}
