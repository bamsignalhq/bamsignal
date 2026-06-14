import { useEffect, useMemo, useState } from "react";
import type { DiscoverProfile } from "../../types";
import {
  getActivityBarState,
  getActivityRotatorSlides,
  getConfidenceRotatorSlides,
  getDiscoverHeadline,
  type RotatorSlide
} from "../../utils/discoverCityActivity";

const ROTATE_MS = 4000;

type DiscoverCityHeaderProps = {
  city: string;
  profiles: DiscoverProfile[];
  blocked?: string[];
  passedIds?: string[];
};

function useRotator(slides: RotatorSlide[], intervalMs = ROTATE_MS): RotatorSlide {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  return slides[index] ?? slides[0];
}

export function DiscoverCityHeader({
  city,
  profiles,
  blocked = [],
  passedIds = []
}: DiscoverCityHeaderProps) {
  const displayCity = city.trim() || "Lagos";

  const activityBar = useMemo(
    () => getActivityBarState(displayCity, profiles, blocked, passedIds),
    [displayCity, profiles, blocked, passedIds]
  );

  const activitySlides = useMemo(
    () => getActivityRotatorSlides(displayCity, profiles, blocked, passedIds),
    [displayCity, profiles, blocked, passedIds]
  );

  const confidenceSlides = useMemo(
    () => getConfidenceRotatorSlides(displayCity, profiles, blocked, passedIds),
    [displayCity, profiles, blocked, passedIds]
  );

  const headline = useMemo(() => getDiscoverHeadline(displayCity), [displayCity]);
  const activitySlide = useRotator(activitySlides);
  const confidenceSlide = useRotator(confidenceSlides, ROTATE_MS + 800);

  return (
    <header className="discover-city-header">
      <div className="discover-city-header__main">
        <h1 className="discover-city-header__city">📍 {displayCity}</h1>
        <p className="discover-city-header__tagline">{headline}</p>
      </div>

      <p className="discover-city-header__activity" role="status" aria-live="polite">
        📍 {activityBar.city} • {activityBar.message}
      </p>

      <div className="discover-city-header__rotators">
        <p className="discover-city-header__rotator discover-city-header__rotator--activity" aria-live="polite">
          <span className="discover-city-header__rotator-icon">{activitySlide.icon}</span>
          {activitySlide.text}
        </p>
        <p className="discover-city-header__rotator discover-city-header__rotator--confidence" aria-live="polite">
          <span className="discover-city-header__rotator-icon">{confidenceSlide.icon}</span>
          {confidenceSlide.text}
        </p>
      </div>
    </header>
  );
}
