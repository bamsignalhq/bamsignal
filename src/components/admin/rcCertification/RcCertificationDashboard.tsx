import { useMemo, useState } from "react";
import {
  RC_CERTIFICATION_ADMIN_PATH,
  RC_CERTIFICATION_BRAND
} from "../../../constants/rcCertificationAdmin";
import { RC_CERTIFICATION_RELEASE_RULE } from "../../../constants/rcCertification";
import { FOUNDER_CERTIFICATION_ADMIN_PATH } from "../../../constants/founderCertificationAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildRcCertificationBundle } from "../../../utils/rcCertificationEngine";
import { RcCertificationReportCard } from "./RcCertificationReportCard";
import { RcCertificationSubsystemList } from "./RcCertificationSubsystemList";

export function RcCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildRcCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page rc-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{RC_CERTIFICATION_BRAND}</h2>
          <p>
            Final automated release gate aggregating every certification system. Run{" "}
            <code>npm run certify:rc</code> after all subsystem certs complete.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(FOUNDER_CERTIFICATION_ADMIN_PATH)}
          >
            Founder certification
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh report
          </button>
        </div>
      </header>

      <RcCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <RcCertificationSubsystemList subsystems={report.subsystemScores} />

        <div className="institutional-page__column">
          {report.blockers.length > 0 && (
            <section className="institutional-card rc-blockers-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Release blockers</h3>
                <p>{RC_CERTIFICATION_RELEASE_RULE}</p>
              </header>
              <ul className="institutional-card__fixes">
                {report.blockers.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> — {item.detail}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="institutional-card rc-warnings-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Warnings</h3>
              <p>Conditions to resolve before scale events.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.warnings.length ? (
                report.warnings.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> — {item.detail}
                  </li>
                ))
              ) : (
                <li>No warnings.</li>
              )}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {RC_CERTIFICATION_ADMIN_PATH}</span>
        <span>RC: {report.rcNumber}</span>
        <span>Generated {new Date(report.certificationTimestamp).toLocaleString()}</span>
      </footer>
    </div>
  );
}
