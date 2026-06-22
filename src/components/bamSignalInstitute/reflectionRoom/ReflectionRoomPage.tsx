import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  FAITH_RESPECT_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FAITH_RESPECT_TRADITIONS,
  PREPARED_REFLECTION_PURPOSES,
  REFLECTION_ROOM_FAITH_RESPECT_COPY,
  REFLECTION_ROOM_LABEL,
  REFLECTION_ROOM_PURPOSE_COPY,
  REFLECTION_ROOM_RESERVED_COPY,
  REFLECTION_ROOM_SUBCOPY,
  REFLECTION_ROOM_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/reflectionRoom";
import { getReflectionRoomBundle } from "../../../utils/ReflectionRoomEngine";
import { MeditationCard } from "./MeditationCard";
import { PrayerCard } from "./PrayerCard";
import { ReflectionCard } from "./ReflectionCard";

export function ReflectionRoomPage() {
  const bundle = useMemo(() => getReflectionRoomBundle(), []);

  return (
    <div className="rfrm-page">
      <header className="rfrm-page__hero institute-glass">
        <p className="bi-page__eyebrow">{REFLECTION_ROOM_LABEL}</p>
        <h1>{REFLECTION_ROOM_TITLE}</h1>
        <p>{REFLECTION_ROOM_SUBCOPY}</p>
        <p className="rfrm-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rfrm-page__purpose">{REFLECTION_ROOM_PURPOSE_COPY}</p>
      </header>

      <section className="rfrm-page__prepared institute-glass">
        <h2>Purpose</h2>
        <p>{bundle.purposeCount} pillars — quiet sacred architecture at the House.</p>
        <ul className="rfrm-page__prepared-list">
          {PREPARED_REFLECTION_PURPOSES.map((purpose) => (
            <li key={purpose.id}>
              <strong>{purpose.title}</strong>
              <span>{purpose.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rfrm-page__section">
        <header className="bi-section-head">
          <h2>Prayer</h2>
          <p>Sacred stillness — prepared, not enabled yet.</p>
        </header>
        <div className="rfrm-page__grid">
          {bundle.prayerPurposes.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))}
        </div>
      </section>

      <section className="rfrm-page__section">
        <header className="bi-section-head">
          <h2>Reflection</h2>
          <p>Thoughtful pause and quiet moments — architecture preview only.</p>
        </header>
        <div className="rfrm-page__grid">
          {bundle.reflectionPurposes.map((reflection) => (
            <ReflectionCard key={reflection.id} reflection={reflection} />
          ))}
        </div>
      </section>

      <section className="rfrm-page__section">
        <header className="bi-section-head">
          <h2>Meditation</h2>
          <p>Guided quiet — reserved, not headquarters wellness yet.</p>
        </header>
        <div className="rfrm-page__grid">
          {bundle.meditationPurposes.map((meditation) => (
            <MeditationCard key={meditation.id} meditation={meditation} />
          ))}
        </div>
      </section>

      <section className="rfrm-page__faith-respect institute-glass">
        <h2>{FAITH_RESPECT_LABEL}</h2>
        <p>{REFLECTION_ROOM_FAITH_RESPECT_COPY}</p>
        <ul className="rfrm-page__prepared-list">
          {PREPARED_FAITH_RESPECT_TRADITIONS.map((tradition) => (
            <li key={tradition.id}>
              <strong>{tradition.title}</strong>
              <span>{tradition.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rfrm-page__reserved-note institute-glass">
        <p>{REFLECTION_ROOM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
