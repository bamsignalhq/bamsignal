import { useMemo } from "react";
import {
  HOUSE_OPERATING_SYSTEM_FUTURE_MODULES,
  HOUSE_OPERATING_SYSTEM_GOOD_COPY,
  HOUSE_OPERATING_SYSTEM_FORBIDDEN_COPY,
  HOUSE_OPERATING_SYSTEM_LABEL,
  HOUSE_OPERATING_SYSTEM_PURPOSE_COPY,
  HOUSE_OPERATING_SYSTEM_RESERVED_COPY,
  HOUSE_OPERATING_SYSTEM_SUBCOPY,
  HOUSE_OPERATING_SYSTEM_TITLE,
  HOUSE_SYSTEMS,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseOperatingSystem";
import { getHouseOperatingSystemBundle } from "../../../utils/HouseOperatingSystemEngine";
import { CenturyVisionCard } from "./CenturyVisionCard";
import { InstitutionMapCard } from "./InstitutionMapCard";
import { OperatingPrinciplesCard } from "./OperatingPrinciplesCard";
import { SystemOverviewCard } from "./SystemOverviewCard";

export function HouseOSPage() {
  const bundle = useMemo(() => getHouseOperatingSystemBundle(), []);

  return (
    <div className="hos-page">
      <header className="hos-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_OPERATING_SYSTEM_LABEL}</p>
        <h1>{HOUSE_OPERATING_SYSTEM_TITLE}</h1>
        <p>{HOUSE_OPERATING_SYSTEM_SUBCOPY}</p>
        <p className="hos-page__labels">
          {UNDERSTANDING_RELATIONSHIPS_LABEL} · {HOUSE_OPERATING_SYSTEM_GOOD_COPY.join(" · ")}
        </p>
        <p className="hos-page__forbidden">
          Not {HOUSE_OPERATING_SYSTEM_FORBIDDEN_COPY.join(", ")}.
        </p>
        <p className="hos-page__purpose">{HOUSE_OPERATING_SYSTEM_PURPOSE_COPY}</p>
      </header>

      <section className="hos-page__section">
        <CenturyVisionCard vision={bundle.centuryVision} />
      </section>

      <section className="hos-page__prepared institute-glass">
        <h2>House systems</h2>
        <p>
          {bundle.systemCount} institutional systems — umbrella architecture, not an operational
          dashboard.
        </p>
        <ul className="hos-page__prepared-list">
          {HOUSE_SYSTEMS.map((system) => (
            <li key={system.id}>
              <strong>{system.title}</strong>
              <span>{system.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hos-page__section">
        <header className="bi-section-head">
          <h2>System overview</h2>
          <p>The top layer — every major BamSignal institution represented.</p>
        </header>
        <div className="hos-page__grid">
          {bundle.systems.map((system) => (
            <SystemOverviewCard key={system.id} system={system} />
          ))}
        </div>
      </section>

      <section className="hos-page__section hos-page__split">
        <InstitutionMapCard nodes={bundle.mapNodes} />
        <OperatingPrinciplesCard principles={bundle.principles} />
      </section>

      <section className="hos-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {HOUSE_OPERATING_SYSTEM_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hos-page__reserved-note institute-glass">
        <p>{HOUSE_OPERATING_SYSTEM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
