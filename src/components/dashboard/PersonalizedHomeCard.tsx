import { Compass } from "lucide-react";
import { useMemo } from "react";
import type { DatingProfile, UserProfile } from "../../types";
import { navigateToPath } from "../../constants/routes";
import {
  acceptRecommendation,
  recommendHome,
  type PersonalizedRecommendation,
} from "../../utils/personalizationEngine";

type PersonalizedHomeCardProps = {
  user: UserProfile;
  profile?: DatingProfile | null;
};

export function PersonalizedHomeCard({ user, profile }: PersonalizedHomeCardProps) {
  const recommendations = useMemo(
    () => recommendHome({ user, profile: profile ?? null }),
    [user, profile],
  );

  if (!recommendations.length) return null;

  const onSelect = (item: PersonalizedRecommendation) => {
    acceptRecommendation(item.id);
    if (item.path) navigateToPath(item.path, true);
  };

  return (
    <section className="card personalized-home-card dash-animate">
      <header className="personalized-home-card__head">
        <Compass size={20} aria-hidden />
        <div>
          <h2>For you</h2>
          <p>Relevant next steps — never pressure.</p>
        </div>
      </header>
      <ul className="personalized-home-card__list">
        {recommendations.map((item) => (
          <li key={item.id}>
            <button type="button" className="personalized-home-card__item" onClick={() => onSelect(item)}>
              <strong>{item.label}</strong>
              <span>{item.reason}</span>
              <em>{item.actionLabel}</em>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
