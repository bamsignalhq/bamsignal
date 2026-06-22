import { useMemo } from "react";
import {
  BAMSIGNAL_OBSERVATORY_FUTURE_CAPABILITIES,
  BAMSIGNAL_OBSERVATORY_PURPOSE_COPY,
  BAMSIGNAL_OBSERVATORY_RESERVED_COPY,
  BAMSIGNAL_OBSERVATORY_SUBCOPY,
  BAMSIGNAL_OBSERVATORY_TITLE,
  COMMUNITIES_LABEL,
  LEGACY_LABEL,
  OBSERVATORY_LABEL,
  OBSERVATORY_SECTIONS,
  RELATIONSHIP_TRENDS_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalObservatory";
import { getBamSignalObservatoryBundle } from "../../../utils/BamSignalObservatoryEngine";
import { getHouseInstituteDataPipelineBundle } from "../../../utils/houseInstituteDataPipelineEngine";
import { AnnualReportsCard } from "./AnnualReportsCard";
import { CommunityGrowthCard } from "./CommunityGrowthCard";
import { DiasporaCorridorCard } from "./DiasporaCorridorCard";
import { LegacyFamiliesCard } from "./LegacyFamiliesCard";
import { RelationshipDashboardCard } from "./RelationshipDashboardCard";
import { TrendCard } from "./TrendCard";
import { ObservatoryFeedCard } from "../houseInstitute/dataPipeline/ObservatoryFeedCard";

export function ObservatoryPage() {
  const bundle = useMemo(() => getBamSignalObservatoryBundle(), []);
  const pipeline = useMemo(() => getHouseInstituteDataPipelineBundle(), []);

  return (
    <div className="bso-page">
      <header className="bso-page__hero institute-glass">
        <p className="bi-page__eyebrow">{OBSERVATORY_LABEL}</p>
        <h1>{BAMSIGNAL_OBSERVATORY_TITLE}</h1>
        <p>{BAMSIGNAL_OBSERVATORY_SUBCOPY}</p>
        <p className="bso-page__labels">
          {RELATIONSHIP_TRENDS_LABEL} · {COMMUNITIES_LABEL} · {LEGACY_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bso-page__purpose">{BAMSIGNAL_OBSERVATORY_PURPOSE_COPY}</p>
      </header>

      <section className="bso-page__prepared institute-glass">
        <h2>Observatory pillars</h2>
        <p>{bundle.sectionCount} pillars — architecture preview, never analytics or metrics.</p>
        <ul className="bso-page__prepared-list">
          {OBSERVATORY_SECTIONS.map((section) => (
            <li key={section.id}>
              <strong>{section.title}</strong>
              <span>{section.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bso-page__section">
        <header className="bi-section-head">
          <h2>Observatory</h2>
          <p>Relationship observatory — prepared, not enabled.</p>
        </header>
        <div className="bso-page__grid">
          {bundle.relationshipDashboard ? (
            <RelationshipDashboardCard section={bundle.relationshipDashboard} />
          ) : null}
          {bundle.marriageTrends ? <TrendCard section={bundle.marriageTrends} /> : null}
          {bundle.communityGrowth ? (
            <CommunityGrowthCard section={bundle.communityGrowth} />
          ) : null}
          {bundle.legacyFamilies ? <LegacyFamiliesCard section={bundle.legacyFamilies} /> : null}
          {bundle.diasporaCorridors ? (
            <DiasporaCorridorCard section={bundle.diasporaCorridors} />
          ) : null}
          {bundle.annualReports ? <AnnualReportsCard section={bundle.annualReports} /> : null}
        </div>
      </section>

      <section className="bso-page__section">
        <ObservatoryFeedCard
          feed={pipeline.observatoryFeed}
          description="Live anonymous aggregates from the House Institute Data Pipeline™."
        />
      </section>

      <section className="bso-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {BAMSIGNAL_OBSERVATORY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bso-page__reserved">{BAMSIGNAL_OBSERVATORY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
