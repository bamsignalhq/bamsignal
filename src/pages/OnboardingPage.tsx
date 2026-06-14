import { Camera, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { StateCitySelect, resolveProfileLocation } from "../components/StateCitySelect";
import {
  RELIGIONS,
  SOCIAL_LIFESTYLES
} from "../constants/profileOptions";
import { INTENT_OPTIONS } from "../constants/intents";
import { STORAGE_KEYS } from "../constants/limits";
import { InterestPicker } from "../components/InterestPicker";
import type {
  DatingProfile,
  EthnicBackground,
  Gender,
  IntentTag,
  LookingFor,
  Religion,
  SocialLifestyle,
  UserProfile
} from "../types";
import { trackEvent } from "../utils/analytics";
import { defaultSafetySettings } from "../constants/safety";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt, persistCitySelection } from "../utils/launchSeed";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { syncMemberProfileRemote } from "../services/cityHome";
import { writeJson, readJson } from "../utils/storage";
import { moderatePhotoUpload } from "../utils/mediaModeration";

const STEPS = ["Basic info", "About you", "Photos", "Preferences"] as const;
const GENDERS: Gender[] = ["Man", "Woman", "Non-binary", "Prefer not to say"];
const LOOKING: LookingFor[] = ["Men", "Women", "Everyone"];
const MAX_INTENTS = 2;

type OnboardingPageProps = {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onComplete: () => void;
};

export function OnboardingPage({ user, onUserChange, onComplete }: OnboardingPageProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [modMessage, setModMessage] = useState("");
  const [profile, setProfile] = useState<DatingProfile>(() => ({
    photos: [],
    age: 25,
    gender: "Prefer not to say",
    city: "",
    state: "",
    bio: "",
    lookingFor: "Everyone",
    intents: ["Relationship"],
    interests: [],
    verified: false,
    premium: false,
    onboardingComplete: false,
    safetySettings: defaultSafetySettings()
  }));
  const [ageMin, setAgeMin] = useState<number | "">(22);
  const [ageMax, setAgeMax] = useState<number | "">(35);

  const progress = ((step + 1) / STEPS.length) * 100;

  const saveAndFinish = () => {
    const located = resolveProfileLocation(profile.city, profile.state);
    const withSafety = applyFemaleFirstDefaults({
      ...profile,
      ...located,
      safetySettings: profile.safetySettings ?? defaultSafetySettings(profile.gender)
    });
    const joinedAt = markJoinedAt();
    const final: DatingProfile = { ...withSafety, onboardingComplete: true, createdAt: joinedAt };
    writeJson(STORAGE_KEYS.datingProfile, final);
    writeJson(STORAGE_KEYS.matchPreferences, {
      ...readJson(STORAGE_KEYS.matchPreferences, {}),
      ageMin: ageMin === "" ? undefined : Number(ageMin),
      ageMax: ageMax === "" ? undefined : Number(ageMax)
    });
    localStorage.setItem(STORAGE_KEYS.firstSignalPromptAt, String(Date.now()));
    syncMemberProfileRemote(user, final);
    trackEvent("profile_completed", { city: final.city, state: final.state ?? "" });
    markFirstDayStep("profile_complete");
    onComplete();
  };

  const canContinue = () => {
    if (step === 0) {
      return (
        user.name.trim().length >= 2 &&
        profile.age >= 18 &&
        Boolean(profile.state && profile.city)
      );
    }
    if (step === 1) {
      return profile.bio.trim().length >= 8 && profile.intents.length >= 1;
    }
    if (step === 2) return profile.photos.length >= 1;
    return true;
  };

  const next = () => {
    if (step === 2 && profile.photos.length > 0) trackEvent("photo_uploaded");
    if (step === STEPS.length - 1) {
      saveAndFinish();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const verdict = await moderatePhotoUpload(file);
    if (!verdict.allowed) {
      setModMessage(verdict.message);
      window.setTimeout(() => setModMessage(""), 4000);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setProfile((p) => ({ ...p, photos: [...p.photos, url].slice(0, 6) }));
      trackEvent("photo_uploaded");
    };
    reader.readAsDataURL(file);
  };

  const toggleIntent = (intent: IntentTag) => {
    setProfile((p) => {
      if (p.intents.includes(intent)) {
        return { ...p, intents: p.intents.filter((i) => i !== intent) };
      }
      if (p.intents.length >= MAX_INTENTS) return p;
      return { ...p, intents: [...p.intents, intent] };
    });
  };

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
            <label>
              Age
              <input
                type="number"
                min={18}
                max={99}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              />
            </label>
            <label>
              Gender
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
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
                    className={`intent-tag intent-tag--large ${selected ? "selected" : ""}`}
                    disabled={disabled}
                    onClick={() => toggleIntent(opt.id)}
                  >
                    <span className="intent-tag__emoji">{opt.emoji}</span>
                    {opt.label}
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
          <h2>Add your photos</h2>
          <p className="onboarding-sub">Use a clear photo of just you — profiles with photos get more signals.</p>
          <div className="welcome-photo-upload welcome-photo-upload--hero">
            {profile.photos[0] ? (
              <img
                src={profile.photos[0]}
                alt="Your profile"
                className="welcome-photo-upload__preview welcome-photo-upload__preview--cover"
              />
            ) : (
              <button type="button" className="welcome-photo-upload__area" onClick={() => fileRef.current?.click()}>
                <Camera size={32} />
                <span>Tap to upload</span>
                <small>At least one photo required</small>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />
            {profile.photos[0] && (
              <button type="button" className="link-btn" onClick={() => fileRef.current?.click()}>
                Change photo
              </button>
            )}
          </div>
          <div className="onboarding-photos">
            {profile.photos.slice(1).map((photo, i) => (
              <img key={i} src={photo} alt="" className="onboarding-photo" />
            ))}
            {profile.photos.length > 0 && profile.photos.length < 6 && (
              <button type="button" className="onboarding-photo-add" onClick={() => fileRef.current?.click()}>
                <Upload size={20} />
              </button>
            )}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="onboarding-step">
          <h2>Your preferences</h2>
          <p className="onboarding-sub">You can refine these anytime in Settings.</p>
          <label>
            Looking for
            <select
              value={profile.lookingFor}
              onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value as LookingFor })}
            >
              {LOOKING.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Religion <span className="label-optional">(optional)</span>
            <select
              value={profile.religion ?? "Prefer not to say"}
              onChange={(e) => setProfile({ ...profile, religion: e.target.value as Religion })}
            >
              {RELIGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lifestyle <span className="label-optional">(optional)</span>
            <select
              value={profile.lifestyle ?? "Prefer not to say"}
              onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value as SocialLifestyle })}
            >
              {SOCIAL_LIFESTYLES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <div className="match-prefs-age">
            <label>
              Preferred age from
              <input
                type="number"
                min={18}
                max={99}
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : "")}
              />
            </label>
            <label>
              Preferred age to
              <input
                type="number"
                min={18}
                max={99}
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : "")}
              />
            </label>
          </div>
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
