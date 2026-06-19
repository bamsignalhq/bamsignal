declare module "../../shared/interestedInDefaults.mjs" {
  export function defaultLookingForFromGender(
    gender?: "Man" | "Woman" | "Non-binary" | ""
  ): "Men" | "Women" | undefined;

  export function resolveLookingFor(options: {
    raw?: "Men" | "Women" | string;
    gender?: "Man" | "Woman" | "Non-binary" | "";
    interestedInManuallyChanged?: boolean;
    onboardingComplete?: boolean;
    fallback?: "Men" | "Women";
  }): "Men" | "Women" | undefined;

  export function applyGenderInterestedInDefault<T extends Record<string, unknown>>(
    profile: T,
    nextGender: "Man" | "Woman" | "Non-binary"
  ): T;

  export function applyInterestedInManualChange<T extends Record<string, unknown>>(
    profile: T,
    lookingFor: "Men" | "Women" | undefined
  ): T;
}

declare module "*/shared/interestedInDefaults.mjs" {
  export function defaultLookingForFromGender(
    gender?: "Man" | "Woman" | "Non-binary" | ""
  ): "Men" | "Women" | undefined;

  export function resolveLookingFor(options: {
    raw?: "Men" | "Women" | string;
    gender?: "Man" | "Woman" | "Non-binary" | "";
    interestedInManuallyChanged?: boolean;
    onboardingComplete?: boolean;
    fallback?: "Men" | "Women";
  }): "Men" | "Women" | undefined;

  export function applyGenderInterestedInDefault<T extends Record<string, unknown>>(
    profile: T,
    nextGender: "Man" | "Woman" | "Non-binary"
  ): T;

  export function applyInterestedInManualChange<T extends Record<string, unknown>>(
    profile: T,
    lookingFor: "Men" | "Women" | undefined
  ): T;
}
