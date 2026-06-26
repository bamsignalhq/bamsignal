import { lazy } from "react";

export const LazyTwoFactorSettingsCard = lazy(() =>
  import("./TwoFactorSettingsCard").then((module) => ({ default: module.TwoFactorSettingsCard }))
);

export const LazySafetySettingsCard = lazy(() =>
  import("./SafetySettingsCard").then((module) => ({ default: module.SafetySettingsCard }))
);

export const LazyProfileAccountPanel = lazy(() =>
  import("./profile/ProfileAccountPanel").then((module) => ({ default: module.ProfileAccountPanel }))
);

export const LazyCoverPhotoUpload = lazy(() =>
  import("./CoverPhotoUpload").then((module) => ({ default: module.CoverPhotoUpload }))
);
