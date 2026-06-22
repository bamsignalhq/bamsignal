import { useMemo } from "react";
import {
  BAMSIGNAL_FOUNDATION_PURPOSE_COPY,
  BAMSIGNAL_FOUNDATION_RESERVED_COPY,
  BAMSIGNAL_FOUNDATION_SUBCOPY,
  BAMSIGNAL_FOUNDATION_TITLE,
  BUILDING_STRONG_COMMUNITIES_LABEL,
  FOUNDATION_PARTNERSHIP_FUTURE_CAPABILITIES,
  GIVING_BACK_LABEL,
  IMPACT_LABEL,
  SUPPORTING_FAMILIES_LABEL
} from "../../constants/bamSignalFoundation";
import { bamSignalFoundationPathForRoute } from "../../constants/bamSignalFoundationRoutes";
import { navigateToPath } from "../../constants/routes";
import { getBamSignalFoundationBundle } from "../../utils/BamSignalFoundationEngine";
import { FoundationImpactCard } from "./FoundationImpactCard";

export function BamSignalFoundationPage() {
  const bundle = useMemo(() => getBamSignalFoundationBundle(), []);

  return (
    <div className="bf-page">
      <header className="bf-page__hero foundation-glass">
        <p className="bf-page__eyebrow">{IMPACT_LABEL}</p>
        <h1>{BAMSIGNAL_FOUNDATION_TITLE}</h1>
        <p>{BAMSIGNAL_FOUNDATION_SUBCOPY}</p>
        <p className="bf-page__labels">
          {GIVING_BACK_LABEL} · {SUPPORTING_FAMILIES_LABEL} · {BUILDING_STRONG_COMMUNITIES_LABEL}
        </p>
        <p className="bf-page__purpose">{BAMSIGNAL_FOUNDATION_PURPOSE_COPY}</p>
        <div className="bf-page__actions">
          <button
            type="button"
            className="bf-page__btn bf-page__btn--primary"
            onClick={() => navigateToPath(bamSignalFoundationPathForRoute("programs"))}
          >
            Foundation programs
          </button>
          <button
            type="button"
            className="bf-page__btn"
            onClick={() => navigateToPath(bamSignalFoundationPathForRoute("stories"))}
          >
            Impact stories
          </button>
        </div>
      </header>

      <FoundationImpactCard />

      <section className="bf-page__preview foundation-glass">
        <h2>Prepared programs</h2>
        <p>{bundle.programs.length} programs — architecture preview, alphabetical.</p>
        <ul className="bf-page__program-list">
          {bundle.programs.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bf-page__future foundation-glass">
        <h2>Future ready</h2>
        <ul>
          {FOUNDATION_PARTNERSHIP_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bf-page__reserved">{BAMSIGNAL_FOUNDATION_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
