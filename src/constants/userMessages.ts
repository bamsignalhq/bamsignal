/** Stable user-facing copy for critical flows — keep wording simple. */
export const USER_MESSAGES = {
  otpSendFailed: "We couldn't send the code. Please try again.",
  otpVerifyFailed: "We couldn't verify that code. Check it and try again.",
  progressSaveFailed: "We couldn't save your progress. Please try again.",
  photoUploadFailed: "We couldn't upload that photo. Try another clear photo.",
  profileSaveFailed: "We couldn't sync your profile. Changes are saved on this device — try again.",
  paymentNotCompleted: "Payment was not completed."
} as const;
