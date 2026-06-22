import {
  getSuccessStorySectionDefinition,
  JOURNEY_TOGETHER_LABEL,
  OUR_STORY_LABEL,
  type SuccessStorySectionEntry
} from "../../../constants/successStoryEngine";
import { getOrderedSuccessStorySections } from "../../../utils/SuccessStoryEngine";

type StoryTimelineCardProps = {
  journeyId: string;
  sections?: SuccessStorySectionEntry[];
};

export function StoryTimelineCard({ journeyId, sections }: StoryTimelineCardProps) {
  const timelineSections = sections ?? getOrderedSuccessStorySections(journeyId);
  const filled = timelineSections.filter((section) => section.body?.trim());

  return (
    <section className="story-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{OUR_STORY_LABEL}</h3>
        <p>{JOURNEY_TOGETHER_LABEL}</p>
      </header>

      {filled.length ? (
        <ol className="story-timeline-card__list">
          {timelineSections.map((section) => {
            const definition = getSuccessStorySectionDefinition(section.id);
            if (!section.body?.trim()) return null;

            return (
              <li key={section.id} className="story-timeline-card__item">
                <span className="story-timeline-card__dot" aria-hidden />
                <div>
                  <h4>{definition?.label ?? section.id}</h4>
                  <p>{section.body}</p>
                  {section.recordedAt ? (
                    <time dateTime={section.recordedAt}>
                      {new Date(section.recordedAt).toLocaleDateString()}
                    </time>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">
          Story sections will appear here as the journey is preserved with care.
        </p>
      )}
    </section>
  );
}
