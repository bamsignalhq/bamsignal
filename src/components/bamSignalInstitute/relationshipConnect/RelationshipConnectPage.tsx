import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_CONNECT_ACTIVITIES,
  PREPARED_CONNECT_GUESTS,
  PREPARED_CONNECT_PROGRAMS,
  PREPARED_FUTURE_CITIES,
  PREPARED_PREMIUM_EXPERIENCES,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY,
  RELATIONSHIP_CONNECT_GOOD_COPY,
  RELATIONSHIP_CONNECT_LABEL,
  RELATIONSHIP_CONNECT_PURPOSE_COPY,
  RELATIONSHIP_CONNECT_RESERVED_COPY,
  RELATIONSHIP_CONNECT_SUBCOPY,
  RELATIONSHIP_CONNECT_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipConnect";
import { getRelationshipConnectBundle } from "../../../utils/RelationshipConnectEngine";
import { ArtistCard } from "./ArtistCard";
import { ConferenceCard } from "./ConferenceCard";
import { ExperienceCard } from "./ExperienceCard";
import { NetworkingCard } from "./NetworkingCard";
import { SpeakerCard } from "./SpeakerCard";
import { WorkshopCard } from "./WorkshopCard";

export function RelationshipConnectPage() {
  const bundle = useMemo(() => getRelationshipConnectBundle(), []);

  return (
    <div className="rconn-page">
      <header className="rconn-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_CONNECT_LABEL}</p>
        <h1>{RELATIONSHIP_CONNECT_TITLE}</h1>
        <p>{RELATIONSHIP_CONNECT_SUBCOPY}</p>
        <p className="rconn-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rconn-page__purpose">{RELATIONSHIP_CONNECT_PURPOSE_COPY}</p>
      </header>

      <section className="rconn-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {RELATIONSHIP_CONNECT_GOOD_COPY.join(", ")}. Avoid:{" "}
          {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="rconn-page__prepared institute-glass">
        <h2>Prepared programs</h2>
        <p>{bundle.programCount} programs — conference and summit, not convention.</p>
        <ul className="rconn-page__prepared-list">
          {PREPARED_CONNECT_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Conferences</h2>
          <p>Relationship Connect programs — prepared, not enabled yet.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.conferences.map((conference) => (
            <ConferenceCard key={conference.id} conference={conference} />
          ))}
        </div>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Premium experiences</h2>
          <p>Celebration and gathering — reserved, not ticketing yet.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Workshops</h2>
          <p>{PREPARED_CONNECT_ACTIVITIES.filter((a) => a.kind === "workshop").length} activities prepared.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Networking</h2>
          <p>Gathering and connection — not a dating expo.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.networking.map((item) => (
            <NetworkingCard key={item.id} networking={item} />
          ))}
        </div>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Speakers</h2>
          <p>{bundle.guestCount} guest types — experts reserved.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.speakers.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </section>

      <section className="rconn-page__section">
        <header className="bi-section-head">
          <h2>Artists &amp; celebration</h2>
          <p>Live performances and entertainment — architecture preview.</p>
        </header>
        <div className="rconn-page__grid">
          {bundle.artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section className="rconn-page__future-cities institute-glass">
        <h2>Future cities</h2>
        <p>{PREPARED_FUTURE_CITIES.length} cities — gatherings reserved, not scheduled yet.</p>
        <ul className="rconn-page__city-list">
          {PREPARED_FUTURE_CITIES.map((city) => (
            <li key={city.id}>
              <strong>{city.title}</strong>
              <span>{city.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rconn-page__guests-summary institute-glass">
        <h2>Prepared guests</h2>
        <ul className="rconn-page__prepared-list">
          {PREPARED_CONNECT_GUESTS.map((guest) => (
            <li key={guest.id}>
              <strong>{guest.title}</strong>
              <span>{guest.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rconn-page__reserved-note institute-glass">
        <p>{RELATIONSHIP_CONNECT_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
