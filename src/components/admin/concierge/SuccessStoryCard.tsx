import { useMemo } from "react";
import {
  CELEBRATING_LOVE_LABEL,
  JOURNEY_TOGETHER_LABEL,
  OUR_STORY_LABEL,
  SUCCESS_STORY_DEFAULT_PRIVATE_COPY,
  SUCCESS_STORY_ENGINE_RESERVED_COPY,
  SUCCESS_STORY_ENGINE_SUBCOPY,
  SUCCESS_STORY_ENGINE_TITLE,
  SUCCESS_STORY_FUTURE_FORMATS,
  SUCCESS_STORY_SECTIONS,
  type SuccessStoryRecord
} from "../../../constants/successStoryEngine";
import { getSuccessStoryWithConsent } from "../../../utils/SuccessStoryEngine";
import { SuccessStoryBadge } from "./SuccessStoryBadge";

type SuccessStoryCardProps = {
  journeyId: string;
  story?: SuccessStoryRecord;
};

export function SuccessStoryCard({ journeyId, story }: SuccessStoryCardProps) {
  const { story: resolvedStory, publishable } = useMemo(() => {
    if (story) {
      return { story, publishable: false };
    }
    const bundle = getSuccessStoryWithConsent(journeyId);
    return { story: bundle.story, publishable: bundle.publishable };
  }, [journeyId, story]);

  const sectionCount = resolvedStory.sections.filter((section) => section.body?.trim()).length;

  return (
    <section className="success-story-card concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{SUCCESS_STORY_ENGINE_TITLE}</h3>
        <p>{SUCCESS_STORY_ENGINE_SUBCOPY}</p>
      </header>

      <p className="success-story-card__labels">
        {OUR_STORY_LABEL} · {JOURNEY_TOGETHER_LABEL} · {CELEBRATING_LOVE_LABEL}
      </p>

      <p className="success-story-card__private">{SUCCESS_STORY_DEFAULT_PRIVATE_COPY}</p>

      <div className="success-story-card__summary">
        {resolvedStory.coupleLabel ? (
          <p className="success-story-card__couple">{resolvedStory.coupleLabel}</p>
        ) : null}
        <SuccessStoryBadge
          storyType={resolvedStory.storyType}
          publishable={publishable}
        />
        <p className="success-story-card__meta">
          {sectionCount} of {SUCCESS_STORY_SECTIONS.length} sections preserved
        </p>
      </div>

      <div className="success-story-card__sections">
        <h4>Story sections</h4>
        <ul>
          {SUCCESS_STORY_SECTIONS.map((section) => {
            const entry = resolvedStory.sections.find((item) => item.id === section.id);
            const hasBody = Boolean(entry?.body?.trim());
            return (
              <li key={section.id} className={hasBody ? "is-recorded" : ""}>
                {section.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="success-story-card__future">
        <h4>Future ready</h4>
        <ul>
          {SUCCESS_STORY_FUTURE_FORMATS.map((format) => (
            <li key={format.id}>
              <strong>{format.label}</strong>
              <span>{format.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="success-story-card__reserved">{SUCCESS_STORY_ENGINE_RESERVED_COPY}</p>
    </section>
  );
}
