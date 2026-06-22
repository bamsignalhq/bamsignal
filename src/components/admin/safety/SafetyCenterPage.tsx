import { useCallback, useMemo, useState } from "react";
import { SAFETY_CENTER_FUTURE_KINDS } from "../../../constants/safetyCenter";
import {
  SAFETY_CENTER_ADMIN_BRAND,
  SAFETY_CENTER_ADMIN_PATH
} from "../../../constants/safetyCenterAdmin";
import { buildSafetyCenterBundle } from "../../../utils/safetyCenterEngine";
import { emptySafetyFilters } from "../../../utils/safetyCenterLogic";
import { EscalationWorkflowCard } from "./EscalationWorkflowCard";
import { IncidentTimelineCard } from "./IncidentTimelineCard";
import { SafetyIncidentCard } from "./SafetyIncidentCard";
import { SafetyQueueCard } from "./SafetyQueueCard";

export function SafetyCenterPage() {
  const [filters, setFilters] = useState(() => emptySafetyFilters());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildSafetyCenterBundle(filters, selectedIncidentId);
  }, [filters, refreshKey, selectedIncidentId]);

  const selectedIncident =
    bundle.queue.find((incident) => incident.id === selectedIncidentId) ?? bundle.selectedIncident;

  const handleResetFilters = useCallback(() => {
    setFilters(emptySafetyFilters());
    setSelectedIncidentId(null);
  }, []);

  return (
    <div className="safety-center-page">
      <header className="safety-center-page__head">
        <div>
          <h2>{SAFETY_CENTER_ADMIN_BRAND}</h2>
          <p>
            Proactive safety infrastructure for harassment, fraud, threats, payment abuse,
            consultant misconduct, and emergency escalation — with immutable incident records.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <div className="safety-center-page__body">
        <SafetyQueueCard
          metrics={bundle.metrics}
          queue={bundle.queue}
          filters={filters}
          selectedIncidentId={selectedIncidentId}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          onSelectIncident={setSelectedIncidentId}
        />

        <div className="safety-center-page__detail">
          {selectedIncident ? (
            <>
              <SafetyIncidentCard incident={selectedIncident} />
              <IncidentTimelineCard timeline={selectedIncident.timeline} />
            </>
          ) : (
            <p className="safety-center-page__empty">
              Select an incident to inspect full timeline and audit trail.
            </p>
          )}
        </div>

        <EscalationWorkflowCard />
      </div>

      <footer className="safety-center-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {SAFETY_CENTER_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {SAFETY_CENTER_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
