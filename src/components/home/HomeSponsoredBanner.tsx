import type { HomeFeedAdSlot } from "../../constants/homeFeedAds";
import { ShowcaseImage } from "../ShowcaseImage";

type HomeSponsoredBannerProps = {
  slot: HomeFeedAdSlot;
  slotLabel: string;
};

export function HomeSponsoredBanner({ slot, slotLabel }: HomeSponsoredBannerProps) {
  const image = (
    <ShowcaseImage
      src={slot.imageUrl}
      alt={slot.altText || "Sponsored"}
      className="home-feed-ad__image"
      loading="lazy"
    />
  );

  return (
    <aside className="home-feed-ad" aria-label={`Sponsored ${slotLabel}`}>
      <span className="home-feed-ad__label">Sponsored</span>
      {slot.linkUrl ? (
        <a
          href={slot.linkUrl}
          className="home-feed-ad__link"
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          {image}
        </a>
      ) : (
        <div className="home-feed-ad__link">{image}</div>
      )}
    </aside>
  );
}
