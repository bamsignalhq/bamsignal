import {
  CORRIDOR_STORIES_CONSENT_COPY,
  CORRIDOR_STORY_CONSENT_LEVELS,
  DIASPORA_STORY_LABEL
} from "../../../constants/corridorStories";
import { CorridorStoryConsentBadge } from "./CorridorStoryConsentBadge";

export function CorridorStoryCategoryCard() {
  return (
    <section className="cs-category-card signal-events-glass">
      <header className="cs-category-card__head">
        <h3>Consent levels</h3>
        <p>{DIASPORA_STORY_LABEL}</p>
      </header>

      <p className="cs-category-card__consent">{CORRIDOR_STORIES_CONSENT_COPY}</p>

      <ul className="cs-category-card__list">
        {CORRIDOR_STORY_CONSENT_LEVELS.map((level) => (
          <li key={level.id}>
            <CorridorStoryConsentBadge
              consentLevel={level.id}
              consentGranted={level.id !== "private"}
            />
            <div>
              <strong>{level.label}</strong>
              <p>{level.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
