import {
  REPORT_EXPORT_FORMATS,
  REPORT_FILTERS,
  REPORT_FILTER_LABELS
} from "../../../constants/reportingCenter";
import type { ReportFilterPreset } from "../../../types/reportingCenter";

type ReportBuilderCardProps = {
  filterPresets: ReportFilterPreset[];
};

export function ReportBuilderCard({ filterPresets }: ReportBuilderCardProps) {
  return (
    <section className="reporting-center-card report-builder-card concierge-consultant-card--glass cc-reveal">
      <header className="reporting-center-card__head">
        <h3>Report builder</h3>
        <p>Compose institutional reports with filters and export formats.</p>
      </header>

      <div className="report-builder-card__filters">
        <h4>Available filters</h4>
        <div className="reporting-center-card__tags">
          {REPORT_FILTERS.map((filter) => (
            <span key={filter.id} className="reporting-center-card__tag">
              {REPORT_FILTER_LABELS[filter.id]}
            </span>
          ))}
        </div>
      </div>

      <div className="report-builder-card__exports">
        <h4>Export formats</h4>
        <div className="reporting-center-card__tags">
          {REPORT_EXPORT_FORMATS.map((format) => (
            <span key={format.id} className="reporting-center-card__tag reporting-center-card__tag--export">
              {format.label}
            </span>
          ))}
        </div>
      </div>

      {filterPresets.length ? (
        <div className="report-builder-card__presets">
          <h4>Saved filter presets</h4>
          <ul className="reporting-center-card__list">
            {filterPresets.map((preset) => (
              <li key={preset.id}>
                <div className="reporting-center-card__row">
                  <strong>{preset.label}</strong>
                  <span className="reporting-center-card__tag">{preset.presetRef}</span>
                </div>
                <div className="reporting-center-card__meta">
                  {Object.entries(preset.filters).map(([key, value]) => (
                    <span key={key}>
                      {REPORT_FILTER_LABELS[key as keyof typeof REPORT_FILTER_LABELS]}: {value}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="reporting-center-card__empty">No filter presets saved yet.</p>
      )}
    </section>
  );
}
