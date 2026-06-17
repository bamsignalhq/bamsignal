import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { StateCitySelect, resolveProfileLocation } from "../components/StateCitySelect";
import { citiesForState } from "../constants/profileOptions";
import { INTENT_OPTIONS } from "../constants/intents";
import { MIN_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
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
import { defaultDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { writeJson, readJson } from "../utils/storage";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { flowLog } from "../utils/flowLog";

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
    const saved = readJson<number>(STORAGE_KEYS.onboardingStep, 0);
    return Number.isFinite(saved) ? Math.min(Math.max(0, saved), STEPS.length - 1) : 0;
  });
  const [modMessage, setModMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [profile, setProfile] = useState<DatingProfile>(() => {
    const stored = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
    if (stored.onboardingComplete) return { ...defaultDatingProfile(), onboardingComplete: false };
    const normalized = normalizeDatingProfile(stored);
    const resuming = Boolean(
      stored.state ||
        stored.city ||
        stored.bio?.trim() ||
        stored.photos?.length ||
        (stored.age !== undefined && stored.age >= MIN_ONBOARDING_AGE && !stored.dateOfBirth)
    );
    if (!resuming) {
      return {
        ...normalized,
        age: 0,
        gender: "" as Gender,
        dateOfBirth: undefined,
        state: "",
        city: ""
      };
    }
    if (stored.dateOfBirth && !stored.age) {
      return { ...normalized, dateOfBirth: undefined };
    }
    return normalized;
  });
  const [prefStates, setPrefStates] = useState<string[]>([]);
  const [prefCities, setPrefCities] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(22);
  const [ageMax, setAgeMax] = useState(35);

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    flowLog("onboarding_step", { step });
    if (!writeJson(STORAGE_KEYS.onboardingStep, step)) {
      setModMessage(USER_MESSAGES.progressSaveFailed);
    }
  }, [step]);

  useEffect(() => {
    if (profile.onboardingComplete) return;
    if (!writeJson(STORAGE_KEYS.datingProfile, { ...profile, onboardingComplete: false })) {
      setModMessage(USER_MESSAGES.progressSaveFailed);
    }
  }, [profile]);

  const saveAndFinish = () => {
    const located = resolveProfileLocation(profile.city, profile.state);
    const withSafety = applyFemaleFirstDefaults({
      ...profile,
      ...located,
      safetySettings: profile.safetySettings ?? defaultSafetySettings(profile.gender)
    });
    const joinedAt = markJoinedAt();
    const final: DatingProfile = {
      ...withSafety,
      onboardingComplete: true,
      createdAt: joinedAt,
      coverPhoto: undefined,
      coverPhotoExplicit: false
    };
    if (!writeJson(STORAGE_KEYS.datingProfile, final)) {
      setModMessage(USER_MESSAGES.progressSaveFailed);
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.onboardingStep);
    if (
      !writeJson(STORAGE_KEYS.matchPreferences, {
        ...readJson(STORAGE_KEYS.matchPreferences, {}),
        states: prefStates,
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
      setModMessage(USER_MESSAGES.progressSaveFailed);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.firstSignalPromptAt, String(Date.now()));
    syncMemberProfileRemote(user, final);
    void completeOnboardingRemote(user);
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
      return profile.bio.trim().length >= 8 && profile.intents.length >= 1;
    }
    if (step === 2) return profile.photos.filter(isStoragePhotoUrl).length >= MIN_PROFILE_PHOTOS;
    return true;
  };

  const next = () => {
    if (step === 2 && profile.photos.filter(isStoragePhotoUrl).length >= MIN_PROFILE_PHOTOS) {
      trackEvent("photo_uploaded");
    }
    if (step === STEPS.length - 1) {
      saveAndFinish();
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
          <h1>{SUCCESS_COPY.welcomeTitle}</h1>
          <p>{SUCCESS_COPY.welcomeBody}</p>
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
                    setProfile((p) => ({
                      ...p,
                      gender: e.target.value as Gender
                    }))
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
                    {opt.id === "Quickie" && <small className="intent-tag__price">₦999/day</small>}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <InterestPicker
            variant="onboarding"
            selected={profile.interests}
            onChange={(interests) => setProfile({ ...profile, interests })}
          />
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-step">
          <h2>{SUCCESS_COPY.photoHeader}</h2>
          <p className="onboarding-sub">{SUCCESS_COPY.photoSubtitle}</p>
          <PhotoUploadGrid
            photos={profile.photos}
            signupMode
            onChange={(photos) => {
              const next = normalizeDatingProfile({
                ...profile,
                photos,
                coverPhoto: undefined,
                coverPhotoExplicit: false
              });
              if (!writeJson(STORAGE_KEYS.datingProfile, { ...next, onboardingComplete: false })) {
                setModMessage(PHOTO_UPLOAD_FAIL);
                window.setTimeout(() => setModMessage(""), 4000);
                return;
              }
              setProfile(next);
            }}
            onModerationMessage={(msg) => {
              setModMessage(msg);
              window.setTimeout(() => setModMessage(""), 4000);
            }}
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
              lookingFor && setProfile({ ...profile, lookingFor })
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
            states={prefStates}
            onStatesChange={(states) => {
              setPrefStates(states);
              setPrefCities((current) =>
                current.filter((city) =>
                  states.some((state) => citiesForState(state).includes(city))
                )
              );
            }}
            cities={prefCities}
            onCitiesChange={setPrefCities}
            ageMin={ageMin}
            ageMax={ageMax}
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
