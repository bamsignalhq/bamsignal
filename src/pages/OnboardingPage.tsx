import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { DateOfBirthPicker } from "../components/DateOfBirthPicker";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { StateCitySelect, resolveProfileLocation } from "../components/StateCitySelect";
import { FILTER_RELIGIONS, SOCIAL_LIFESTYLES, NIGERIAN_STATES, citiesForState } from "../constants/profileOptions";
import { INTENT_OPTIONS } from "../constants/intents";
import { MIN_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import { STORAGE_KEYS } from "../constants/limits";
import { InterestPicker } from "../components/InterestPicker";
import type {
  DatingProfile,
  Gender,
  IntentTag,
  LookingFor,
  Religion,
  SocialLifestyle,
  UserProfile
} from "../types";
import { USER_MESSAGES } from "../constants/userMessages";
import { trackEvent } from "../utils/analytics";
import { isAdultDob } from "../utils/ageFromDob";
import { defaultSafetySettings } from "../constants/safety";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt, persistCitySelection } from "../utils/launchSeed";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { syncMemberProfileRemote } from "../services/cityHome";
import { completeOnboardingRemote } from "../services/memberData";
import { defaultDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { writeJson, readJson } from "../utils/storage";

const STEPS = ["Basic info", "About you", "Photos", "Preferences"] as const;
const GENDERS: Gender[] = ["Man", "Woman", "Non-binary"];
const LOOKING: LookingFor[] = ["Men", "Women"];
const MAX_INTENTS = 2;

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
    return normalizeDatingProfile(stored);
  });
  const [prefStates, setPrefStates] = useState<string[]>([]);
  const [prefCities, setPrefCities] = useState<string[]>([]);
  const [prefStatePick, setPrefStatePick] = useState("");
  const [ageMin, setAgeMin] = useState<number | "">(22);
  const [ageMax, setAgeMax] = useState<number | "">(35);

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
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
    writeJson(STORAGE_KEYS.datingProfile, final);
    localStorage.removeItem(STORAGE_KEYS.onboardingStep);
    writeJson(STORAGE_KEYS.matchPreferences, {
      ...readJson(STORAGE_KEYS.matchPreferences, {}),
      states: prefStates,
      cities: prefCities,
      ageMin: ageMin === "" ? undefined : Number(ageMin),
      ageMax: ageMax === "" ? undefined : Number(ageMax)
    });
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
        Boolean(profile.dateOfBirth && isAdultDob(profile.dateOfBirth)) &&
        Boolean(profile.gender) &&
        Boolean(profile.state && profile.city)
      );
    }
    if (step === 1) {
      return profile.bio.trim().length >= 8 && profile.intents.length >= 1;
    }
    if (step === 2) return profile.photos.length >= MIN_PROFILE_PHOTOS;
    return true;
  };

  const next = () => {
    if (step === 2 && profile.photos.length >= MIN_PROFILE_PHOTOS) trackEvent("photo_uploaded");
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

  const togglePrefState = (state: string) => {
    setPrefStates((list) => {
      const next = list.includes(state) ? list.filter((s) => s !== state) : [...list, state];
      if (!next.includes(prefStatePick) && prefStatePick) setPrefStatePick("");
      return next;
    });
  };

  const togglePrefCity = (city: string) => {
    setPrefCities((list) =>
      list.includes(city) ? list.filter((c) => c !== city) : [...list, city]
    );
  };

  if (showWelcome) {
    return (
      <div className="page onboarding-page onboarding-welcome-screen">
        <div className="onboarding-welcome-card">
          <div className="onboarding-welcome-icon" aria-hidden>
            <Heart size={48} />
          </div>
          <h1>Welcome home, {user.name.split(" ")[0] || "friend"} 🤗</h1>
          <p>
            Your profile is live. Take a breath — explore your city home, see who's around, and signal when
            someone feels right.
          </p>
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
                placeholder="Your first name"
                autoComplete="name"
              />
            </label>
            <DateOfBirthPicker
              value={profile.dateOfBirth ?? ""}
              onChange={(iso, age) =>
                setProfile((p) => ({
                  ...p,
                  dateOfBirth: iso,
                  age: age ?? p.age
                }))
              }
            />
            <fieldset className="intent-fieldset onboarding-gender-field">
              <legend>Gender</legend>
              <div className="intent-tags selectable">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`intent-tag ${profile.gender === g ? "selected" : ""}`}
                    onClick={() => setProfile({ ...profile, gender: g })}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>
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
            selected={profile.interests}
            onChange={(interests) => setProfile({ ...profile, interests })}
          />
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-step">
          <h2>Your photos</h2>
          <p className="onboarding-sub">Profile gallery photos only — you can add a cover photo later from Edit Profile.</p>
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
          <p className="onboarding-sub">Tap to select — refine anytime in Settings.</p>

          <fieldset className="intent-fieldset onboarding-pref-block">
            <legend>Interested in</legend>
            <div className="intent-tags selectable">
              {LOOKING.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`intent-tag intent-tag--large ${profile.lookingFor === l ? "selected" : ""}`}
                  onClick={() => setProfile({ ...profile, lookingFor: l })}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset onboarding-pref-block">
            <legend>Faith <span className="label-optional">(optional)</span></legend>
            <div className="intent-tags selectable">
              {FILTER_RELIGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`intent-tag ${profile.religion === r ? "selected" : ""}`}
                  onClick={() => setProfile({ ...profile, religion: r as Religion })}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset onboarding-pref-block">
            <legend>Lifestyle <span className="label-optional">(optional)</span></legend>
            <div className="intent-tags selectable match-prefs-scroll">
              {SOCIAL_LIFESTYLES.filter((l) => l !== "Prefer not to say").map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`intent-tag ${profile.lifestyle === l ? "selected" : ""}`}
                  onClick={() => setProfile({ ...profile, lifestyle: l as SocialLifestyle })}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset onboarding-pref-block">
            <legend>Preferred state</legend>
            <div className="intent-tags selectable match-prefs-scroll">
              {NIGERIAN_STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`intent-tag ${prefStates.includes(s) ? "selected" : ""}`}
                  onClick={() => {
                    togglePrefState(s);
                    setPrefStatePick(s);
                  }}
                >
                  {s === "FCT" ? "Abuja" : s}
                </button>
              ))}
            </div>
          </fieldset>

          {prefStatePick && (
            <fieldset className="intent-fieldset onboarding-pref-block">
              <legend>Preferred cities in {prefStatePick === "FCT" ? "Abuja" : prefStatePick}</legend>
              <div className="intent-tags selectable match-prefs-scroll">
                {citiesForState(prefStatePick).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`intent-tag ${prefCities.includes(c) ? "selected" : ""}`}
                    onClick={() => togglePrefCity(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="intent-fieldset onboarding-pref-block">
            <legend>Preferred age range</legend>
            <div className="match-prefs-age">
              <label>
                From
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : "")}
                />
              </label>
              <label>
                To
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : "")}
                />
              </label>
            </div>
          </fieldset>
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
