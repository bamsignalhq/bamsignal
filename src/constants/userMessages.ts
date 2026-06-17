/** Stable user-facing copy for critical flows — warm, never technical. */
export const USER_MESSAGES = {
  tryAgain: "We couldn't do that right now. Please try again.",
  tryAgainSoon: "Something went wrong. Please try again shortly.",
  otpSendFailed: "Something went wrong. Please try again shortly.",
  otpVerifyFailed: "We couldn't verify that code. Please try again.",
  signupCompleteFailed: "We couldn't finish setting up your account. Please try again.",
  progressSaveFailed: "We couldn't save your progress. Please try again.",
  photoUploadFailed: "We couldn't upload that photo. Please try again.",
  photoRejected: "We couldn't use that image. Try another clear photo.",
  profileSaveFailed: "We couldn't save just now. Your changes are kept on this device — please try again.",
  paymentNotCompleted: "No worries — your upgrade is still available whenever you're ready."
} as const;
