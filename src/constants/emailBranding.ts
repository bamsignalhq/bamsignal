export type EmailBrandingSettings = {
  bannerEnabled: boolean;
  bannerImageUrl: string;
  bannerLinkUrl: string;
  bannerAltText: string;
};

export const DEFAULT_EMAIL_BRANDING: EmailBrandingSettings = {
  bannerEnabled: false,
  bannerImageUrl: "",
  bannerLinkUrl: "",
  bannerAltText: ""
};
