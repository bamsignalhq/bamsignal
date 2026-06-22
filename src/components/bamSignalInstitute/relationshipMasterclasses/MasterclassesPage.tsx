import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_MASTERCLASSES,
  RELATIONSHIP_MASTERCLASSES_FUTURE_CAPABILITIES,
  RELATIONSHIP_MASTERCLASSES_LABEL,
  RELATIONSHIP_MASTERCLASSES_PURPOSE_COPY,
  RELATIONSHIP_MASTERCLASSES_RESERVED_COPY,
  RELATIONSHIP_MASTERCLASSES_SUBCOPY,
  RELATIONSHIP_MASTERCLASSES_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipMasterclasses";
import { getRelationshipMasterclassesBundle } from "../../../utils/RelationshipMasterclassesEngine";
import { MasterclassCard } from "./MasterclassCard";
import { SpeakerCard } from "./SpeakerCard";

export function MasterclassesPage() {
  const bundle = useMemo(() => getRelationshipMasterclassesBundle(), []);

  return (
    <div className="rmc-page">
      <header className="rmc-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_MASTERCLASSES_LABEL}</p>
        <h1>{RELATIONSHIP_MASTERCLASSES_TITLE}</h1>
        <p>{RELATIONSHIP_MASTERCLASSES_SUBCOPY}</p>
        <p className="rmc-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rmc-page__purpose">{RELATIONSHIP_MASTERCLASSES_PURPOSE_COPY}</p>
      </header>

      <section className="rmc-page__prepared institute-glass">
        <h2>Prepared masterclasses</h2>
        <p>{bundle.masterclassCount} masterclasses — architecture preview, not live yet.</p>
        <ul className="rmc-page__prepared-list">
          {PREPARED_MASTERCLASSES.map((masterclass) => (
            <li key={masterclass.id}>
              <strong>{masterclass.title}</strong>
              <span>{masterclass.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rmc-page__section">
        <header className="bi-section-head">
          <h2>Masterclasses</h2>
          <p>Deep-dive learning prepared — not enabled yet.</p>
        </header>
        <div className="rmc-page__grid">
          {bundle.masterclasses.map((masterclass) => (
            <MasterclassCard key={masterclass.id} masterclass={masterclass} />
          ))}
        </div>
      </section>

      <section className="rmc-page__section">
        <header className="bi-section-head">
          <h2>Speakers</h2>
          <p>Reserved facilitators — dignity-first masterclass framing.</p>
        </header>
        <div className="rmc-page__grid">
          {bundle.speakers.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </section>

      <section className="rmc-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {RELATIONSHIP_MASTERCLASSES_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="rmc-page__reserved">{RELATIONSHIP_MASTERCLASSES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
