import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { BuildProfileLaterCard } from "../components/profile/BuildProfileLaterCard";
import { Preloader } from "../components/Preloader";
import { StateCitySelect, resolveProfileLocation } from "../components/StateCitySelect";
import { WhatBringsYouHerePicker } from "../components/relationshipIntent/WhatBringsYouHerePicker";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import { hasMinimumRelationshipIntents } from "../utils/relationshipIntent";
import { isFastConnectionInterested } from "../utils/fastConnectionState";
import { isQuickiePassActive } from "../utils/quickie";
import { PHOTO_UPLOAD_FAIL } from "../constants/photos";
import { ONBOARDING_REQUIRED_PHOTOS } from "../utils/buildProfileLater";
import { CONTACT_LEAK_BLOCK_MESSAGE, validateDisplayName, validateProfileContactLeaks, validateUserText } from "../utils/contactGuard";
import { STORAGE_KEYS } from "../constants/limits";
import { MoreAboutMePicker } from "../components/moreAboutMe/MoreAboutMePicker";
import { MORE_ABOUT_ME_HEADLINE, MORE_ABOUT_ME_SUBTEXT } from "../constants/moreAboutMe";
import { MatchPreferenceFields } from "../components/preferences/MatchPreferenceFields";
import type {
  DatingProfile,
  Gender,
  UserProfile
} from "../types";
import { USER_MESSAGES } from "../constants/userMessages";
import { SUCCESS_COPY } from "../constants/copy";
import { navigateToPath } from "../constants/routes";
import { trackEvent } from "../utils/analytics";
import { defaultSafetySettings } from "../constants/safety";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt, persistCitySelection } from "../utils/launchSeed";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { syncMemberProfileRemote } from "../services/cityHome";
import { completeOnboardingRemote } from "../services/memberData";
import {
  applyOnboardingRepairLocal,
  fetchOnboardingStatus
} from "../services/onboardingRepair";
import { defaultDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { clearOnboardingDrafts, looksLikeSavedOnboardingProgress } from "../utils/onboardingStatus";
import { resolveMemberIdentity } from "../utils/authIdentity";
import { writeJson, readJson } from "../utils/storage";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { isSignupPhotoCountable } from "../utils/photoMeta";
import { flowLog } from "../utils/flowLog";
import { normalizeSearchCities } from "../utils/searchLocationPrefs";
import {
  resolveLookingFor,
  applyGenderInterestedInDefault,
  applyInterestedInManualChange
} from "../utils/interestedInDefaults";

function countSignupPhotos(profile: Pick<DatingProfile, "photos" | "photoMeta">): number {
  return profile.photos.filter(
    (url) => isStoragePhotoUrl(url) && isSignupPhotoCountable(url, profile.photoMeta)
  ).length;
}

const REQUIRED_STEPS = ["Basic info", "Photo & what brings you here"] as const;
const OPTIONAL_STEPS = ["About you", "More photos", "Preferences"] as const;
type OnboardingPhase = "required" | "ready" | "optional";
const GENDERS: Gender[] = ["Man", "Woman", "Non-binary"];
const MIN_ONBOARDING_AGE = 17;
const MAX_ONBOARDING_AGE = 75;
const ONBOARDING_AGES = Array.from(
  { length: MAX_ONBOARDING_AGE - MIN_ONBOARDING_AGE + 1 },
  (_, i) => MIN_ONBOARDING_AGE + i
);

const STEP_TITLES = [
  "Welcome to BamSignal",
  "What brings you here?",
  "Tell people more about you",
  SUCCESS_COPY.photoHeader,
  "Your preferences"
] as const;

function stepTitleIndex(phase: OnboardingPhase, step: number, optionalStep: number): number {
  if (phase === "required") return step;
  if (optionalStep === 0) return 2;
  if (optionalStep === 1) return 3;
  return 4;
}

function OnboardingStepHead({
  stepIndex,
  totalSteps,
  subtitle
}: {
  stepIndex: number;
  totalSteps: number;
  subtitle?: string;
}) {
  return (
    <header className="onboarding-step-head">
      <p className="onboarding-step-eyebrow">
        Step {stepIndex + 1} of {totalSteps}
      </p>
      <h2 className="onboarding-step-title">{STEP_TITLES[stepIndex]}</h2>
      {subtitle ? <p className="onboarding-step-lede">{subtitle}</p> : null}
    </header>
  );
}

type OnboardingPageProps = {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onComplete: () => void;
};

export function OnboardingPage({ user, onUserChange, onComplete }: OnboardingPageProps) {
  const [gateReady, setGateReady] = useState(false);
  const [phase, setPhase] = useState<OnboardingPhase>("required");
  const [step, setStep] = useState(() => {
    const saved = readJson<number>(STORAGE_KEYS.onboardingStep, 0);
    return Number.isFinite(saved) ? Math.min(Math.max(0, saved), REQUIRED_STEPS.length - 1) : 0;
  });
  const [optionalStep, setOptionalStep] = useState(0);
  const [modMessage, setModMessage] = useState("");
  const modMessageTimerRef = useRef<number | undefined>(undefined);

  const showModMessage = (msg: string) => {
    if (modMessageTimerRef.current !== undefined) clearTimeout(modMessageTimerRef.current);
    setModMessage(msg);
    modMessageTimerRef.current = window.setTimeout(() => {
      setModMessage("");
      modMessageTimerRef.current = undefined;
    }, 4000);
  };
  const [profile, setProfile] = useState<DatingProfile>(() => {
    const stored = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
    const normalized = normalizeDatingProfile(stored);
    const resuming = looksLikeSavedOnboardingProgress(stored);
    if (!resuming) {
      return {
        ...normalized,
        interests: [],
        interestsTouched: false,
        age: 0,
        gender: "" as Gender,
        lookingFor: undefined,
        interestedInManuallyChanged: false,
        dateOfBirth: undefined,
        state: "",
        city: ""
      };
    }
    const synced = !normalized.interestedInManuallyChanged
      ? {
          ...normalized,
          lookingFor: resolveLookingFor({
            raw: normalized.lookingFor,
            gender: normalized.gender,
            interestedInManuallyChanged: false,
            onboardingComplete: false
          })
        }
      : normalized;
    if (stored.dateOfBirth && !stored.age) {
      return { ...synced, dateOfBirth: undefined };
    }
    return synced;
  });
  const [prefSearchState, setPrefSearchState] = useState("");
  const [prefCities, setPrefCities] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(22);
  const [ageMax, setAgeMax] = useState(35);

  const progress =
    phase === "required"
      ? ((step + 1) / REQUIRED_STEPS.length) * 100
      : phase === "optional"
        ? ((optionalStep + 1) / OPTIONAL_STEPS.length) * 100
        : 100;

  useEffect(() => {
    let cancelled = false;
    const identity = resolveMemberIdentity(user);
    void (async () => {
      const status = await fetchOnboardingStatus(identity);
      if (cancelled) return;
      if (status?.completed) {
        if (status.datingProfile) {
          applyOnboardingRepairLocal({
            ok: true,
            completed: true,
            repaired: Boolean(status.repaired),
            nextRoute: "/home",
            datingProfile: status.datingProfile
          });
        }
        clearOnboardingDrafts();
        onComplete();
        navigateToPath("/home", true);
        return;
      }
      setGateReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [onComplete, user]);

  useEffect(() => {
    setProfile((prev) => {
      if (prev.interestsTouched || !prev.interests?.length) return prev;
      return { ...prev, interests: [], interestsTouched: false };
    });
  }, []);

  useEffect(() => {
    if (phase !== "required") return;
    flowLog("onboarding_step", { step });
    if (!writeJson(STORAGE_KEYS.onboardingStep, step)) {
      showModMessage(USER_MESSAGES.progressSaveFailed);
    }
  }, [phase, step]);

  useEffect(() => {
    if (profile.onboardingComplete) return;
    if (!writeJson(STORAGE_KEYS.datingProfile, { ...profile, onboardingComplete: false })) {
      showModMessage(USER_MESSAGES.progressSaveFailed);
    }
  }, [profile]);

  const saveAndFinish = async () => {
    const nameError = validateDisplayName(user.name);
    if (nameError) {
      showModMessage(nameError);
      return;
    }
    const bioError = profile.bio.trim() ? validateUserText(profile.bio) : null;
    if (bioError) {
      showModMessage(bioError);
      return;
    }
    const profileLeak = validateProfileContactLeaks(profile, user);
    if (profileLeak.blocked) {
      showModMessage(CONTACT_LEAK_BLOCK_MESSAGE);
      return;
    }
    const located = resolveProfileLocation(profile.city, profile.state);
    const withSafety = applyFemaleFirstDefaults({
      ...profile,
      ...located,
      safetySettings: profile.safetySettings ?? defaultSafetySettings(profile.gender)
    });
    const joinedAt = markJoinedAt();
    const now = new Date().toISOString();
    const final: DatingProfile = {
      ...withSafety,
      onboardingComplete: true,
      setupCompleted: true,
      onboardingCompletedAt: now,
      profileCompletedAt: now,
      completedAt: now,
      createdAt: joinedAt,
      coverPhoto: undefined,
      coverPhotoExplicit: false
    };

    const synced = await syncMemberProfileRemote(user, final);
    if (!synced) {
      showModMessage("We couldn't finish setup. Please try again.");
      return;
    }
    const completed = await completeOnboardingRemote(user);
    if (!completed) {
      showModMessage("We couldn't finish setup. Please try again.");
      return;
    }
    if (!writeJson(STORAGE_KEYS.datingProfile, final)) {
      showModMessage(USER_MESSAGES.progressSaveFailed);
      return;
    }
    clearOnboardingDrafts();
    if (
      !writeJson(STORAGE_KEYS.matchPreferences, {
        ...readJson(STORAGE_KEYS.matchPreferences, {}),
        states: prefSearchState ? [prefSearchState] : [],
        cities: prefCities,
        ageMin,
        ageMax,
        religions: profile.religion ? [profile.religion] : [],
        lifestyles: profile.lifestyles?.length
          ? profile.lifestyles
          : profile.lifestyle
            ? [profile.lifestyle]
            : []
      })
    ) {
      showModMessage(USER_MESSAGES.progressSaveFailed);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.firstSignalPromptAt, String(Date.now()));
    trackEvent("profile_completed", { city: final.city, state: final.state ?? "" });
    markFirstDayStep("profile_complete");
    onComplete();
  };

  const canContinue = () => {
    if (phase === "optional") return true;
    if (step === 0) {
      return (
        user.name.trim().length >= 2 &&
        profile.age >= MIN_ONBOARDING_AGE &&
        profile.age <= MAX_ONBOARDING_AGE &&
        Boolean(profile.gender) &&
        Boolean(profile.state && profile.city)
      );
    }
    if (step === 1) {
      return countSignupPhotos(profile) >= ONBOARDING_REQUIRED_PHOTOS && hasMinimumRelationshipIntents(profile.intents);
    }
    return true;
  };

  const next = () => {
    if (phase === "required" && step === 0) {
      const nameError = validateDisplayName(user.name);
      if (nameError) {
        showModMessage(nameError);
        return;
      }
    }
    if (phase === "required" && step === 1) {
      if (countSignupPhotos(profile) >= ONBOARDING_REQUIRED_PHOTOS) {
        trackEvent("photo_uploaded");
      }
      setPhase("ready");
      return;
    }
    if (phase === "optional") {
      if (optionalStep === 0 && profile.bio.trim()) {
        const bioError = validateUserText(profile.bio);
        if (bioError) {
          showModMessage(bioError);
          return;
        }
        const profileLeak = validateProfileContactLeaks(profile);
        if (profileLeak.blocked) {
          showModMessage(CONTACT_LEAK_BLOCK_MESSAGE);
          return;
        }
      }
      if (optionalStep >= OPTIONAL_STEPS.length - 1) {
        void saveAndFinish();
        return;
      }
      setOptionalStep((value) => value + 1);
      return;
    }
    setStep((s) => Math.min(s + 1, REQUIRED_STEPS.length - 1));
  };

  const skipOptional = () => {
    if (optionalStep >= OPTIONAL_STEPS.length - 1) {
      void saveAndFinish();
      return;
    }
    setOptionalStep((value) => value + 1);
  };

  const back = () => {
    if (phase === "optional") {
      if (optionalStep > 0) {
        setOptionalStep((value) => value - 1);
        return;
      }
      setPhase("ready");
      return;
    }
    if (phase === "ready") {
      setPhase("required");
      setStep(1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  if (phase === "ready") {
    return (
      <div className="page onboarding-page onboarding-ready-screen">
        <BuildProfileLaterCard
          onStartDiscovering={() => void saveAndFinish()}
          onContinueBuilding={() => {
            setPhase("optional");
            setOptionalStep(0);
          }}
        />
      </div>
    );
  }

  if (!gateReady) {
    return (
      <div className="page onboarding-page onboarding-page--gate">
        <Preloader exiting={false} variant="minimal" subtitle="Restoring your session…" />
      </div>
    );
  }

  return (
    <div className="page onboarding-page welcome-flow">
      {modMessage && (
        <p className="profile-mod-toast onboarding-mod-toast" role="status">
          {modMessage}
        </p>
      )}
      <header className="onboarding-header">
        {(phase === "required" && step > 0) || phase === "optional" ? (
          <button type="button" className="onboarding-back" onClick={back} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <div className="onboarding-progress">
          <div className="onboarding-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {phase === "required" && step === 0 && (
        <section className="onboarding-step onboarding-step--location">
          <OnboardingStepHead
            stepIndex={stepTitleIndex(phase, step, optionalStep)}
            totalSteps={REQUIRED_STEPS.length}
            subtitle="Meet people who match your vibe."
          />
          <div className="onboarding-location-fields">
            <label>
              Full name
              <input
                value={user.name}
                onChange={(e) => onUserChange({ ...user, name: e.target.value })}
                autoComplete="name"
              />
            </label>
            <div className="onboarding-age-gender-row">
              <label>
                Age
                <select
                  value={profile.age >= MIN_ONBOARDING_AGE ? profile.age : ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      age: Number(e.target.value),
                      dateOfBirth: undefined
                    }))
                  }
                >
                  <option value="">Select Age</option>
                  {ONBOARDING_AGES.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Gender
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile((p) =>
                      applyGenderInterestedInDefault(p, e.target.value as Gender)
                    )
                  }
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <StateCitySelect
              state={profile.state ?? ""}
              city={profile.city}
              onLocationChange={(state, city) => {
                const next = persistCitySelection({ ...profile, state, city }, state, city);
                setProfile(next);
                if (state) trackEvent("state_selected", { state });
                if (city) trackEvent("city_selected", { city });
              }}
            />
          </div>
        </section>
      )}

      {phase === "required" && step === 1 && (
        <section className="onboarding-step">
          <OnboardingStepHead
            stepIndex={stepTitleIndex(phase, step, optionalStep)}
            totalSteps={REQUIRED_STEPS.length}
            subtitle="Add a clear photo and share what you're open to."
          />
          <PhotoUploadGrid
            photos={profile.photos}
            mainPhotoUrl={profile.mainPhotoUrl}
            photoMeta={profile.photoMeta}
            signupMode
            onChange={(photos, nextPhotoMeta, nextMainPhotoUrl) => {
              const next = normalizeDatingProfile({
                ...profile,
                photos,
                photoMeta: nextPhotoMeta,
                mainPhotoUrl: nextMainPhotoUrl,
                coverPhoto: undefined,
                coverPhotoExplicit: false
              });
              if (!writeJson(STORAGE_KEYS.datingProfile, { ...next, onboardingComplete: false })) {
                showModMessage(PHOTO_UPLOAD_FAIL);
                return;
              }
              setProfile(next);
            }}
            onModerationMessage={showModMessage}
          />
          <WhatBringsYouHerePicker
            value={profile.intents}
            onChange={(intents) => setProfile({ ...profile, intents })}
            onLimitMessage={showModMessage}
          />
          {!isQuickiePassActive() ? (
            <fieldset className="intent-fieldset">
              <legend>Fast Connection · optional</legend>
              <div className="intent-tags selectable welcome-intent-grid">
                <button
                  type="button"
                  className={`intent-tag intent-tag--large intent-tag--quickie ${
                    isFastConnectionInterested(profile) ? "selected" : ""
                  }`}
                  onClick={() =>
                    setProfile((current) => ({
                      ...current,
                      fastConnectionInterested: !isFastConnectionInterested(current)
                    }))
                  }
                >
                  <span className="intent-tag__emoji">⚡</span>
                  Fast Connection
                </button>
              </div>
            </fieldset>
          ) : null}
        </section>
      )}

      {phase === "optional" && optionalStep === 0 && (
        <section className="onboarding-step">
          <OnboardingStepHead
            stepIndex={stepTitleIndex(phase, step, optionalStep)}
            totalSteps={OPTIONAL_STEPS.length}
            subtitle={`${MORE_ABOUT_ME_SUBTEXT} Optional.`}
          />
          <MoreAboutMePicker
            selected={profile.interests}
            onChange={(interests) => setProfile({ ...profile, interests, interestsTouched: true })}
          />
          <label className="onboarding-about-field">
            About me
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Weekend beach trips, suya runs, good conversations."
              rows={4}
            />
          </label>
        </section>
      )}

      {phase === "optional" && optionalStep === 1 && (
        <section className="onboarding-step">
          <OnboardingStepHead
            stepIndex={stepTitleIndex(phase, step, optionalStep)}
            totalSteps={OPTIONAL_STEPS.length}
            subtitle="Optional — more photos help people connect with you."
          />
          <PhotoUploadGrid
            photos={profile.photos}
            mainPhotoUrl={profile.mainPhotoUrl}
            photoMeta={profile.photoMeta}
            signupMode
            onChange={(photos, nextPhotoMeta, nextMainPhotoUrl) => {
              const next = normalizeDatingProfile({
                ...profile,
                photos,
                photoMeta: nextPhotoMeta,
                mainPhotoUrl: nextMainPhotoUrl,
                coverPhoto: undefined,
                coverPhotoExplicit: false
              });
              if (!writeJson(STORAGE_KEYS.datingProfile, { ...next, onboardingComplete: false })) {
                showModMessage(PHOTO_UPLOAD_FAIL);
                return;
              }
              setProfile(next);
            }}
            onModerationMessage={showModMessage}
          />
        </section>
      )}

      {phase === "optional" && optionalStep === 2 && (
        <section className="onboarding-step onboarding-step--prefs">
          <OnboardingStepHead
            stepIndex={stepTitleIndex(phase, step, optionalStep)}
            totalSteps={OPTIONAL_STEPS.length}
            subtitle="Optional — fine-tune who you see."
          />
          <MatchPreferenceFields
            className="onboarding-pref-block"
            lookingFor={profile.lookingFor}
            onLookingForChange={(lookingFor) =>
              setProfile((p) => applyInterestedInManualChange(p, lookingFor))
            }
            faith={profile.religion}
            onFaithChange={(religion) => setProfile({ ...profile, religion })}
            lifestyles={profile.lifestyles ?? (profile.lifestyle ? [profile.lifestyle] : [])}
            onLifestylesChange={(lifestyles) =>
              setProfile({
                ...profile,
                lifestyles,
                lifestyle: lifestyles[0]
              })
            }
            searchState={prefSearchState || undefined}
            onSearchStateChange={(searchState) => {
              const next = searchState || "";
              if (next !== prefSearchState) {
                setPrefCities([]);
              }
              setPrefSearchState(next);
            }}
            searchCities={prefCities}
            onSearchCitiesChange={(cities) =>
              setPrefCities(normalizeSearchCities(cities, prefSearchState || undefined))
            }
            ageMin={ageMin}
            ageMax={ageMax}
            ageLabel="Age"
            onAgeRangeChange={(min, max) => {
              setAgeMin(min);
              setAgeMax(max);
            }}
          />
        </section>
      )}

      <footer className={`onboarding-footer${phase === "optional" ? " onboarding-footer--split" : ""}`}>
        {phase === "optional" ? (
          <button type="button" className="btn-secondary btn-full btn-auth" onClick={skipOptional}>
            Skip for now
          </button>
        ) : null}
        <button type="button" className="btn-primary btn-full btn-auth" onClick={next} disabled={!canContinue()}>
          {phase === "optional" && optionalStep >= OPTIONAL_STEPS.length - 1
            ? "Start Discovering"
            : phase === "required" && step >= REQUIRED_STEPS.length - 1
              ? "Continue"
              : "Continue"}
          {phase === "required" && step < REQUIRED_STEPS.length - 1 && <ChevronRight size={18} />}
        </button>
      </footer>
    </div>
  );
}
