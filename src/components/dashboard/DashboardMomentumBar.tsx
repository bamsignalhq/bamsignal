import { useMemo } from "react";
import { useCountUp } from "../../hooks/useCountUp";

export type MomentumItem = {
  id: string;
  emoji: string;
  text: string;
  onClick?: () => void;
};

type DashboardMomentumBarProps = {
  viewsToday: number;
  totalViews: number;
  nearbyCount: number;
  onOpenProfileViews: () => void;
  onCompleteProfile: () => void;
  onDiscover: () => void;
  extraItems?: MomentumItem[];
};

function buildItems(input: {
  viewsToday: number;
  totalViews: number;
  nearbyCount: number;
  animatedViews: number;
  animatedNearby: number;
  onOpenProfileViews: () => void;
  onCompleteProfile: () => void;
  onDiscover: () => void;
  extraItems?: MomentumItem[];
}): MomentumItem[] {
  const items: MomentumItem[] = [];

  if (input.totalViews > 0) {
    items.push({
      id: "views",
      emoji: "🔥",
      text: `${input.animatedViews} ${input.animatedViews === 1 ? "person" : "people"} viewed your profile today`,
      onClick: input.onOpenProfileViews
    });
  } else {
    items.push({
      id: "views-empty",
      emoji: "✨",
      text: "Complete your profile to attract more views",
      onClick: input.onCompleteProfile
    });
  }

  if (input.nearbyCount > 0) {
    items.push({
      id: "nearby",
      emoji: "✨",
      text: `${input.animatedNearby} new signal${input.animatedNearby === 1 ? "" : "s"} nearby`,
      onClick: input.onDiscover
    });
  } else {
    items.push({
      id: "nearby-empty",
      emoji: "📍",
      text: "Expanding discovery radius…",
      onClick: input.onDiscover
    });
  }

  if (input.extraItems?.length) {
    items.push(...input.extraItems);
  }

  return items;
}

export function DashboardMomentumBar({
  viewsToday,
  totalViews,
  nearbyCount,
  onOpenProfileViews,
  onCompleteProfile,
  onDiscover,
  extraItems
}: DashboardMomentumBarProps) {
  const viewTarget = viewsToday > 0 ? viewsToday : totalViews;
  const animatedViews = useCountUp(viewTarget, 650, totalViews > 0);
  const animatedNearby = useCountUp(nearbyCount, 650, nearbyCount > 0);

  const items = useMemo(
    () =>
      buildItems({
        viewsToday,
        totalViews,
        nearbyCount,
        animatedViews,
        animatedNearby,
        onOpenProfileViews,
        onCompleteProfile,
        onDiscover,
        extraItems
      }),
    [
      viewsToday,
      totalViews,
      nearbyCount,
      animatedViews,
      animatedNearby,
      onOpenProfileViews,
      onCompleteProfile,
      onDiscover,
      extraItems
    ]
  );

  return (
    <section className="dash-momentum dash-animate" aria-label="Your momentum">
      <div className="dash-momentum__glow" aria-hidden />
      <ul className="dash-momentum__list">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className="dash-momentum__item" onClick={item.onClick}>
              <span className="dash-momentum__emoji" aria-hidden>
                {item.emoji}
              </span>
              <span className="dash-momentum__text">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
