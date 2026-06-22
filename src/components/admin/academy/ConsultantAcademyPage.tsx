import { useCallback, useMemo, useState } from "react";
import {
  ACADEMY_TRACKS,
  CERTIFICATION_LEVELS,
  CERTIFICATION_LEVEL_LABELS,
  CONSULTANT_ACADEMY_FUTURE_KINDS
} from "../../../constants/consultantAcademy";
import {
  CONSULTANT_ACADEMY_ADMIN_BRAND,
  CONSULTANT_ACADEMY_ADMIN_PATH
} from "../../../constants/consultantAcademyAdmin";
import type { AcademyTrackId, CertificationLevelId } from "../../../constants/consultantAcademy";
import { buildConsultantAcademyBundle } from "../../../utils/consultantAcademyEngine";
import { emptyAcademyFilters } from "../../../utils/consultantAcademyLogic";
import { AcademyTimelineCard } from "./AcademyTimelineCard";
import { AcademyTrackCard } from "./AcademyTrackCard";
import { AssessmentCard } from "./AssessmentCard";
import { CertificationCard } from "./CertificationCard";
import { LearningProgressCard } from "./LearningProgressCard";
import { TrainingModuleCard } from "./TrainingModuleCard";

export function ConsultantAcademyPage() {
  const [filters, setFilters] = useState(() => emptyAcademyFilters());
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildConsultantAcademyBundle(filters, selectedConsultantId);
  }, [filters, refreshKey, selectedConsultantId]);

  const selectedConsultant =
    bundle.consultants.find((consultant) => consultant.id === selectedConsultantId) ??
    bundle.selectedConsultant;

  const handleTrackSelect = useCallback((trackId: AcademyTrackId) => {
    setFilters((current) => ({
      ...current,
      trackId: current.trackId === trackId ? "all" : trackId
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(emptyAcademyFilters());
    setSelectedConsultantId(null);
  }, []);

  return (
    <div className="consultant-academy-page">
      <header className="consultant-academy-page__head">
        <div>
          <h2>{CONSULTANT_ACADEMY_ADMIN_BRAND}</h2>
          <p>
            Internal training and certification system — structured tracks, academy modules,
            and certification levels so every consultant follows institutional process.
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

      <section className="consultant-academy-page__tracks" aria-label="Training tracks">
        {ACADEMY_TRACKS.map((track) => {
          const summary = bundle.tracks.find((item) => item.trackId === track.id);
          return (
            <AcademyTrackCard
              key={track.id}
              trackId={track.id}
              hint={track.hint}
              consultantCount={summary?.consultantCount ?? 0}
              active={filters.trackId === track.id}
              onSelect={() => handleTrackSelect(track.id)}
            />
          );
        })}
      </section>

      <LearningProgressCard metrics={bundle.metrics} consultantCount={bundle.consultants.length} />

      <div className="consultant-academy-page__filters">
        <label className="academy-search-field">
          <span>Search consultants</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Name or ref…"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="academy-search-field">
          <span>Certification</span>
          <select
            value={filters.certificationLevel}
            onChange={(event) =>
              setFilters({
                ...filters,
                certificationLevel: event.target.value as CertificationLevelId | "all"
              })
            }
          >
            <option value="all">All levels</option>
            {CERTIFICATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {CERTIFICATION_LEVEL_LABELS[level.id]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="consultant-academy-page__body">
        <section className="consultant-academy-page__roster">
          <h3>Consultants</h3>
          {bundle.consultants.length ? (
            bundle.consultants.map((consultant) => (
              <button
                key={consultant.id}
                type="button"
                className={`consultant-academy-roster-card${
                  selectedConsultantId === consultant.id ? " is-selected" : ""
                }`}
                onClick={() => setSelectedConsultantId(consultant.id)}
              >
                <strong>{consultant.consultantName}</strong>
                <span>{CERTIFICATION_LEVEL_LABELS[consultant.certificationLevel]}</span>
              </button>
            ))
          ) : (
            <p className="consultant-academy-page__empty">No consultants match the current filters.</p>
          )}
        </section>

        <div className="consultant-academy-page__detail">
          {selectedConsultant ? (
            <>
              <CertificationCard consultant={selectedConsultant} />
              <section className="consultant-academy-page__modules">
                <h3>Training modules</h3>
                <div className="consultant-academy-page__module-grid">
                  {selectedConsultant.moduleProgress.map((progress) => (
                    <TrainingModuleCard key={progress.moduleId} progress={progress} />
                  ))}
                </div>
              </section>
              <AssessmentCard assessments={selectedConsultant.assessments} />
              <AcademyTimelineCard timeline={selectedConsultant.timeline} />
            </>
          ) : (
            <p className="consultant-academy-page__empty">
              Select a consultant to view certification, modules, and assessments.
            </p>
          )}
        </div>
      </div>

      <footer className="consultant-academy-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {CONSULTANT_ACADEMY_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {CONSULTANT_ACADEMY_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
