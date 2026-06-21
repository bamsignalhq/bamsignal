import {
  icebreakerSectionEyebrow,
  icebreakerSectionTitle,
  type IcebreakerContext,
  type IcebreakerProfile
} from "../../constants/icebreakers";
import { useIcebreakers } from "../../hooks/useIcebreakers";
import { IcebreakerChip } from "./IcebreakerChip";

type IcebreakersSectionProps = {
  viewer: IcebreakerProfile;
  target: IcebreakerProfile;
  context?: IcebreakerContext;
  messageCount?: number;
  limit?: number;
  onSelect: (text: string) => void;
  className?: string;
};

export function IcebreakersSection({
  viewer,
  target,
  context = "profile",
  messageCount = 0,
  limit,
  onSelect,
  className = ""
}: IcebreakersSectionProps) {
  const { icebreakers } = useIcebreakers({ viewer, target, context, limit });
  if (!icebreakers.length) return null;

  const eyebrow = icebreakerSectionEyebrow(context);
  const title = icebreakerSectionTitle(context, messageCount);

  return (
    <section
      className={`icebreakers-section ${className}`.trim()}
      aria-label={title}
    >
      {eyebrow ? <p className="icebreakers-section__eyebrow">{eyebrow}</p> : null}
      <h3 className="icebreakers-section__title">{title}</h3>
      <div className="icebreakers-section__track" role="list">
        {icebreakers.map((text) => (
          <IcebreakerChip key={text} text={text} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
