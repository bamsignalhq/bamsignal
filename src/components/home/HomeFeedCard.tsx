import type { DiscoverFeedCardProps } from "../discover/DiscoverFeedCard";
import { DiscoverFeedCard } from "../discover/DiscoverFeedCard";

/** Home tab reuses the same compact discover grid card. */
export function HomeFeedCard(props: DiscoverFeedCardProps) {
  return <DiscoverFeedCard {...props} />;
}

export type { DiscoverFeedCardProps as HomeFeedCardProps };
