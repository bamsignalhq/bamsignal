import { lazy } from "react";

export const LazyVoiceVibePlayer = lazy(() =>
  import("./voice/VoiceVibePlayer").then((module) => ({ default: module.VoiceVibePlayer }))
);

/** @deprecated use LazyVoiceVibePlayer */
export const LazyVoiceIntro = lazy(() =>
  import("./voice/VoiceVibePlayer").then((module) => ({ default: module.VoiceVibePlayer }))
);

/** @deprecated recording lives on VoiceVibePage */
export const LazyVoiceIntroRecorder = lazy(() =>
  import("../pages/VoiceVibePage").then((module) => ({ default: module.VoiceVibePage }))
);

export const LazyTwoFactorSettingsCard = lazy(() =>
  import("./TwoFactorSettingsCard").then((module) => ({ default: module.TwoFactorSettingsCard }))
);

export const LazySafetySettingsCard = lazy(() =>
  import("./SafetySettingsCard").then((module) => ({ default: module.SafetySettingsCard }))
);

export const LazyProfileAccountPanel = lazy(() =>
  import("./profile/ProfileAccountPanel").then((module) => ({ default: module.ProfileAccountPanel }))
);

export const LazyPhotoUploadGrid = lazy(() =>
  import("./PhotoUploadGrid").then((module) => ({ default: module.PhotoUploadGrid }))
);

export const LazyCoverPhotoUpload = lazy(() =>
  import("./CoverPhotoUpload").then((module) => ({ default: module.CoverPhotoUpload }))
);
