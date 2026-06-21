import type { CommonGroundStory } from "../../utils/buildCommonGroundStories";

type CommonGroundRowProps = {
  story: CommonGroundStory;
  staggerIndex?: number;
  className?: string;
};

export function CommonGroundRow({ story, staggerIndex = 0, className = "" }: CommonGroundRowProps) {
  return (
    <p
      className={`common-ground-row ${className}`.trim()}
      style={{ animationDelay: `${staggerIndex * 70}ms` }}
    >
      {story.text}
    </p>
  );
}
