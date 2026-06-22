import { useMemo } from "react";
import {
  CITY_AMBASSADOR_FUTURE_CAPABILITIES,
  CITY_AMBASSADOR_ROLES,
  CITY_AMBASSADORS_NEVER_SALESPERSON_COPY,
  CITY_AMBASSADORS_PURPOSE_COPY,
  CITY_AMBASSADORS_RESERVED_COPY,
  CITY_AMBASSADORS_SUBCOPY,
  CITY_AMBASSADORS_TITLE,
  COMMUNITY_AMBASSADOR_LABEL,
  COMMUNITY_BUILDER_LABEL,
  LEGACY_ADVOCATE_LABEL,
  PREPARED_CITY_AMBASSADORS,
  STEWARD_LABEL
} from "../../../constants/cityAmbassadors";
import { getCityAmbassadorsBundle } from "../../../utils/CityAmbassadorsEngine";
import { AmbassadorBadge } from "./AmbassadorBadge";
import { AmbassadorJourneyCard } from "./AmbassadorJourneyCard";
import { CityAmbassadorCard } from "./CityAmbassadorCard";

export function CityAmbassadorsPage() {
  const bundle = useMemo(() => getCityAmbassadorsBundle(), []);

  return (
    <div className="ca-page">
      <header className="ca-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{COMMUNITY_AMBASSADOR_LABEL}</p>
        <h1>{CITY_AMBASSADORS_TITLE}</h1>
        <p>{CITY_AMBASSADORS_SUBCOPY}</p>
        <p className="ca-page__labels">
          {STEWARD_LABEL} · {LEGACY_ADVOCATE_LABEL} · {COMMUNITY_BUILDER_LABEL}
        </p>
        <p className="ca-page__purpose">{CITY_AMBASSADORS_PURPOSE_COPY}</p>
        <p className="ca-page__never-sales">{CITY_AMBASSADORS_NEVER_SALESPERSON_COPY}</p>
      </header>

      <section className="ca-page__roles signal-events-glass">
        <h2>Ambassador roles</h2>
        <p>Stewardship — never a salesperson, representative, or influencer.</p>
        <ul className="ca-page__role-list">
          {CITY_AMBASSADOR_ROLES.map((role) => (
            <li key={role.id}>
              <AmbassadorBadge role={role.id} />
              <span>{role.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-page__prepared signal-events-glass">
        <h2>Prepared ambassadors</h2>
        <p>Architecture preview — alphabetical, not ranked.</p>
        <ul className="ca-page__prepared-list">
          {PREPARED_CITY_AMBASSADORS.map((ambassador) => (
            <li key={ambassador.slug}>
              <strong>{ambassador.title}</strong>
              <span>{ambassador.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-page__section">
        <header className="se-section-head">
          <h2>City ambassadors</h2>
          <p>Community stewardship prepared — not enabled yet.</p>
        </header>
        <div className="ca-page__grid">
          {bundle.ambassadors.map((ambassador) => (
            <CityAmbassadorCard key={ambassador.slug} ambassador={ambassador} />
          ))}
        </div>
      </section>

      {bundle.ambassadors.map((ambassador) => (
        <AmbassadorJourneyCard
          key={`${ambassador.slug}-journey`}
          title={ambassador.title}
          steps={bundle.journeysBySlug[ambassador.slug] ?? []}
        />
      ))}

      <section className="ca-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {CITY_AMBASSADOR_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="ca-page__reserved">{CITY_AMBASSADORS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
