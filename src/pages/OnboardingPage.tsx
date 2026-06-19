import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { StateCitySelect, resolveProfileLocation } from "../components/StateCitySelect";
import { INTENT_OPTIONS } from "../constants/intents";
import { durationLabel } from "../constants/plans";
import { MIN_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import { MIN_PROFILE_INTERESTS } from "../constants/interestCategories";
import { CONTACT_LEAK_BLOCK_MESSAGE, validateDisplayName, validateProfileContactLeaks, validateUserText } from "../utils/contactGuard";
import { STORAGE_KEYS } from "../constants/limits";
import { InterestPicker } from "../components/InterestPicker";
import { MatchPreferenceFields } from "../components/preferences/MatchPreferenceFields";
import type {
  DatingProfile,
  Gender,
  IntentTag,
  UserProfile
} from "../types";
import { USER_MESSAGES } from "../constants/userMessages";
import { SUCCESS_COPY } from "../constants/copy";
import { trackEvent } from "../utils/analytics";
import { defaultSafetySettings } from "../constants/safety";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt, persistCitySelection } from "../utils/launchSeed";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { syncMemberProfileRemote } from "../services/cityHome";
import { completeOnboardingRemote } from "../services/memberData";
import { defaultDatingProfile, normalizeDatingProfile, isOnboardingComplete } from "../utils/profile";
import { clearOnboardingDrafts, isProfileOnboardingMarkedComplete, looksLikeSavedOnboardingProgress, shouldRouteToOnboarding } from "../utils/onboardingStatus";
import { writeJson, readJson } from "../utils/storage";
import { quickiePassDays, quickiePriceLabel } from "../utils/quickie";
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

const STEPS = ["Basic info", "About you", "Photos", "Preferences"] as const;
const GENDERS: Gender[] = ["Man", "Woman", "Non-binary"];
const MAX_INTENTS = 2;
const MIN_ONBOARDING_AGE = 17;
const MAX_ONBOARDING_AGE = 75;
const ONBOARDING_AGES = Array.from(
  { length: MAX_ONBOARDING_AGE - MIN_ONBOARDING_AGE + 1 },
  (_, i) => MIN_ONBOARDING_AGE + i
);

type OnboardingPageProps = {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onComplete: () => void;
};

export function OnboardingPage({ user, onUserChange, onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(() => {
    const stored = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
    if (isOnboardingComplete(user) || isProfileOnboardingMarkedComplete(stored)) {
      return STEPS.length - 1;
    }
    const saved = readJson<number>(STORAGE_KEYS.onboardingStep, 0);
    return Number.isFinite(saved) ? Math.min(Math.max(0, saved), STEPS.length - 1) : 0;
  });
  const [modMessage, setModMessage] = useState("");
  const modMessageTimerRef = useRef<number | undefined>(undefined);
  const [showWelcome, setShowWelcome] = useState(false);

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
    if (isOnboardingComplete(user) || isProfileOnboardingMarkedComplete(stored)) {
      return normalizeDatingProfile(stored);
    }
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

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    const stored = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
    if (isOnboardingComplete(user) || isProfileOnboardingMarkedComplete(stored)) {
      clearOnboardingDrafts();
      onComplete();
    }
  }, [onComplete, user]);

  useEffect(() => {
    if (shouldRouteToOnboarding(user, profile)) return;
    clearOnboardingDrafts();
    onComplete();
  }, [onComplete, profile, user]);

  useEffect(() => {
    setProfile((prev) => {
      if (prev.interestsTouched || !prev.interests?.length) return prev;
      return { ...prev, interests: [], interestsTouched: false };
    });
  }, []);

  useEffect(() => {
    flowLog("onboarding_step", { step });
    if (!writeJson(STORAGE_KEYS.onboardingStep, step)) {
      showModMessage(USER_MESSAGES.progressSaveFailed);
    }
  }, [step]);

  useEffect(() => {
    if (profile.onboardingComplete || isOnboardingComplete(user)) return;
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
    const bioError = validateUserText(profile.bio);
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
    setShowWelcome(true);
  };

  const canContinue = () => {
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
      return (
        profile.bio.trim().length >= 8 &&
        profile.intents.length >= 1 &&
        (profile.interests?.length ?? 0) >= MIN_PROFILE_INTERESTS
      );
    }
    if (step === 2) return countSignupPhotos(profile) >= MIN_PROFILE_PHOTOS;
    if (step === STEPS.length - 1) return Boolean(profile.lookingFor);
    return true;
  };

  const next = () => {
    if (step === 0) {
      const nameError = validateDisplayName(user.name);
      if (nameError) {
        showModMessage(nameError);
        return;
      }
    }
    if (step === 1) {
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
    if (step === 2 && countSignupPhotos(profile) >= MIN_PROFILE_PHOTOS) {
      trackEvent("photo_uploaded");
    }
    if (step === STEPS.length - 1) {
      void saveAndFinish();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleIntent = (intent: IntentTag) => {
    setProfile((p) => {
      if (p.intents.includes(intent)) {
        return { ...p, intents: p.intents.filter((i) => i !== intent) };
      }
      if (p.intents.length >= MAX_INTENTS) return p;
      return { ...p, intents: [...p.intents, intent] };
    });
  };

  if (showWelcome) {
    return (
      <div className="page onboarding-page onboarding-welcome-screen">
        <div className="onboarding-welcome-card">
          <div className="onboarding-welcome-icon" aria-hidden>
            <Heart size={48} />
          </div>
          <h1>{SUCCESS_COPY.welcomeTitle(user.name)}</h1>
          <p>{SUCCESS_COPY.welcomeBody(user.name)}</p>
          <button type="button" className="btn-primary btn-full btn-auth" onClick={onComplete}>
            Go to my home
          </button>
        </div>
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
        {step > 0 && (
          <button type="button" className="onboarding-back" onClick={back} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="onboarding-progress">
          <div className="onboarding-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="onboarding-step-label">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </header>

      {step === 0 && (
        <section className="onboarding-step onboarding-step--location">
          <h2>Welcome to BamSignal</h2>
          <p className="onboarding-sub">Meet people who match your vibe.</p>
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

      {step === 1 && (
        <section className="onboarding-step">
          <h2>About you</h2>
          <p className="onboarding-sub">A clear bio helps the right people find you.</p>
          <label>
            Bio
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Weekend beach trips, suya runs, good conversations."
              rows={4}
            />
          </label>
          <fieldset className="intent-fieldset">
            <legend>Intent · select up to {MAX_INTENTS}</legend>
            <div className="intent-tags selectable welcome-intent-grid">
              {INTENT_OPTIONS.map((opt) => {
                const selected = profile.intents.includes(opt.id);
                const disabled = !selected && profile.intents.length >= MAX_INTENTS;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`intent-tag intent-tag--large ${selected ? "selected" : ""} ${opt.id === "Quickie" ? "intent-tag--quickie" : ""}`}
                    disabled={disabled}
                    onClick={() => toggleIntent(opt.id)}
                  >
                    <span className="intent-tag__emoji">{opt.emoji}</span>
                    {opt.label}
                    {opt.id === "Quickie" && (
                      <small className="intent-tag__price">
                        {quickiePriceLabel()} / {durationLabel(quickiePassDays())}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <InterestPicker
            variant="onboarding"
            selected={profile.interests}
            onChange={(interests) => setProfile({ ...profile, interests, interestsTouched: true })}
          />
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-step">
          <h2>{SUCCESS_COPY.photoHeader}</h2>
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

      {step === 3 && (
        <section className="onboarding-step onboarding-step--prefs">
          <h2>Your preferences</h2>
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

      <footer className="onboarding-footer">
        <button type="button" className="btn-primary btn-full btn-auth" onClick={next} disabled={!canContinue()}>
          {step === STEPS.length - 1 ? "Finish" : "Continue"}
          {step < STEPS.length - 1 && <ChevronRight size={18} />}
        </button>
      </footer>
    </div>
  );
}
