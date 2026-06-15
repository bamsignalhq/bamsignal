export type HomeFeedAdSlot = {
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  altText: string;
};

export type HomeFeedAdsSettings = {
  /** Master switch — ads only render when true and a slot is enabled with an image */
  enabled: boolean;
  slots: [HomeFeedAdSlot, HomeFeedAdSlot, HomeFeedAdSlot];
};

export const HOME_FEED_AD_IMAGE_SPEC = {
  width: 1080,
  height: 320,
  aspectRatio: "27:8",
  maxFileKb: 400,
  formats: "WebP or JPG",
  label: "1080 × 320 px (27:8 wide banner)"
} as const;

export const DEFAULT_HOME_FEED_AD_SLOT = (): HomeFeedAdSlot => ({
  enabled: false,
  imageUrl: "",
  linkUrl: "",
  altText: ""
});

export const DEFAULT_HOME_FEED_ADS: HomeFeedAdsSettings = {
  enabled: false,
  slots: [DEFAULT_HOME_FEED_AD_SLOT(), DEFAULT_HOME_FEED_AD_SLOT(), DEFAULT_HOME_FEED_AD_SLOT()]
};

export const HOME_FEED_PROFILE_COUNT = 60;
export const HOME_FEED_COLUMNS = 3;
export const HOME_FEED_ROWS = 20;
export const HOME_FEED_ROWS_PER_AD = 5;
export const HOME_FEED_PROFILES_PER_BLOCK = HOME_FEED_COLUMNS * HOME_FEED_ROWS_PER_AD;
