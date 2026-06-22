import { useMemo } from "react";
import {
  CELEBRATING_FIRST_STORIES_LABEL,
  FOUNDERS_WALL_PURPOSE_COPY,
  FOUNDERS_WALL_RESERVED_COPY,
  FOUNDERS_WALL_SUBCOPY,
  FOUNDERS_WALL_TITLE,
  LEGACY_COUPLES_LABEL
} from "../../../../constants/foundersWall";
import { getFoundersWallBundle } from "../../../../utils/FoundersWallEngine";
import { FoundersCoupleCard } from "./FoundersCoupleCard";
import { FoundersTimeline } from "./FoundersTimeline";

export function FoundersWallPage() {
  const bundle = useMemo(() => getFoundersWallBundle(), []);

  return (
    <div className="founders-wall-page">
      <header className="founders-wall-page__head">
        <h2>{FOUNDERS_WALL_TITLE}</h2>
        <p>{FOUNDERS_WALL_SUBCOPY}</p>
        <p className="founders-wall-page__labels">
          {LEGACY_COUPLES_LABEL} · {CELEBRATING_FIRST_STORIES_LABEL}
        </p>
        <p className="founders-wall-page__purpose">{FOUNDERS_WALL_PURPOSE_COPY}</p>
      </header>

      <FoundersTimeline couples={bundle.couples} />

      <div className="founders-wall-page__grid">
        {bundle.couples.map((couple) => (
          <FoundersCoupleCard key={couple.journeyId} couple={couple} />
        ))}
      </div>

      <p className="founders-wall-page__reserved">{FOUNDERS_WALL_RESERVED_COPY}</p>
    </div>
  );
}
