import { Camera, ChevronLeft, ChevronRight, Sparkles, Upload, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { StateCitySelect } from "../components/StateCitySelect";
import {
  ETHNIC_BACKGROUNDS,
  RELIGIONS,
  SOCIAL_LIFESTYLES
} from "../constants/profileOptions";
import { INTENT_OPTIONS } from "../constants/intents";
import { getCms } from "../constants/cms";
import { STORAGE_KEYS } from "../constants/limits";
import { ProfileStrengthMeter } from "../components/ProfileStrengthMeter";
import { InterestPicker } from "../components/InterestPicker";
import { FoundingMemberBadge } from "../components/FoundingMemberBadge";
import type {
  DatingProfile,
  EthnicBackground,
  IntentTag,
  Religion,
  SocialLifestyle,
  UserProfile
} from "../types";
import { ONBOARDING_CULTURAL_COPY } from "../data/landingProfiles";
import { trackEvent } from "../utils/analytics";
import { calculateProfileStrength } from "../utils/profileStrength";
import { defaultSafetySettings } from "../constants/safety";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt, persistCitySelection } from "../utils/launchSeed";
import { writeJson } from "../utils/storage";

const STEPS = [
  "City",
  "Welcome",
  "Photo",
  "About you",
  "Intent",
  "Preferences",
  "Strength",
  "Discover"
] as const;

type OnboardingPageProps = {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onComplete: () => void;
};

export function OnboardingPage({ user, onUserChange, onComplete }: OnboardingPageProps) {
  const cms = getCms();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<DatingProfile>(() => ({
    photos: [],
    age: 25,
    gender: "Prefer not to say",
    city: "Lagos",
    state: "Lagos",
    bio: "",
    lookingFor: "Everyone",
    intents: ["Relationship"],
    interests: [],
    verified: false,
    premium: false,
    onboardingComplete: false,
    safetySettings: defaultSafetySettings()
  }));

  const progress = ((step + 1) / STEPS.length) * 100;
  const strength = calculateProfileStrength(profile);

  const saveAndFinish = () => {
    const withSafety = applyFemaleFirstDefaults({
      ...profile,
      safetySettings: profile.safetySettings ?? defaultSafetySettings(profile.gender)
    });
    const joinedAt = markJoinedAt();
    const final: DatingProfile = { ...withSafety, onboardingComplete: true, createdAt: joinedAt };
    writeJson(STORAGE_KEYS.datingProfile, final);
    localStorage.setItem(STORAGE_KEYS.foundingMember, "1");
    localStorage.setItem(STORAGE_KEYS.earlyAccessMember, "1");
    localStorage.setItem(STORAGE_KEYS.firstSignalPromptAt, String(Date.now()));
    trackEvent("profile_completed", { city: profile.city, state: profile.state ?? "" });
    onComplete();
  };

  const canContinue = () => {
    if (step === 0) return Boolean(profile.state && profile.city);
    if (step === 2) return profile.photos.length >= 1;
    if (step === 3) return user.name.trim().length >= 2 && profile.bio.trim().length >= 8;
    if (step === 4) return profile.intents.length >= 1;
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

  const uploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setProfile((p) => ({ ...p, photos: [...p.photos, url].slice(0, 6) }));
      trackEvent("photo_uploaded");
    };
    reader.readAsDataURL(file);
  };

  const toggleIntent = (intent: IntentTag) => {
    setProfile((p) => ({
      ...p,
      intents: p.intents.includes(intent)
        ? p.intents.filter((i) => i !== intent)
        : [...p.intents, intent]
    }));
  };

  return (
    <div className="page onboarding-page welcome-flow">
      <header className="onboarding-header">
        {step > 0 && (
          <button type="button" className="onboarding-back" onClick={back} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        )}
        <FoundingMemberBadge className="welcome-flow__badge" />
        <div className="onboarding-progress">
          <div className="onboarding-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="onboarding-step-label">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </header>

      {step === 0 && (
        <section className="onboarding-step onboarding-step--location">
          <h2>Where are you based?</h2>
          <p className="onboarding-sub">Pick your state, then your city — we match you locally first.</p>
          <div className="onboarding-location-fields">
            <StateCitySelect
              state={profile.state ?? ""}
              city={profile.city}
              onStateChange={(state) => {
                setProfile((p) => ({ ...p, state }));
                trackEvent("state_selected", { state });
              }}
              onCityChange={(city) => {
                const next = persistCitySelection({ ...profile, state: profile.state }, city);
                setProfile(next);
                trackEvent("city_selected", { city });
              }}
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="onboarding-step welcome-flow__hero">
          <div className="welcome-flow__icon">
            <Zap size={36} fill="currentColor" />
          </div>
          <h1>{cms.welcomeTitle}</h1>
          <p className="welcome-flow__lead">{cms.welcomeBody}</p>
          <p className="onboarding-sub">
            Starting in <strong>{profile.city}</strong> — the right connection starts with a signal.
          </p>
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-step">
          <h2>Add your profile photo</h2>
          <p className="onboarding-sub">{cms.welcomePhotoHint}</p>
          <div className="welcome-photo-upload">
            {profile.photos[0] ? (
              <img src={profile.photos[0]} alt="Your profile" className="welcome-photo-upload__preview" />
            ) : (
              <button type="button" className="welcome-photo-upload__area" onClick={() => fileRef.current?.click()}>
                <Camera size={32} />
                <span>Tap to upload</span>
                <small>Required — at least 1 photo</small>
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
          <h2>Tell people about yourself</h2>
          <p className="onboarding-sub">Keep it real — personality beats perfection.</p>
          <p className="onboarding-city-badge">
            📍 {profile.city}
          </p>
          <label>
            Name
            <input
              value={user.name}
              onChange={(e) => onUserChange({ ...user, name: e.target.value })}
              placeholder="Your first name"
            />
          </label>
          <label>
            Bio
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Weekend beach trips, suya runs, good conversations."
              rows={3}
            />
          </label>
          <InterestPicker
            selected={profile.interests}
            onChange={(interests) => setProfile({ ...profile, interests })}
          />
        </section>
      )}

      {step === 4 && (
        <section className="onboarding-step">
          <h2>Choose your intent</h2>
          <p className="onboarding-sub">What brings you to BamSignal? Pick all that apply.</p>
          <div className="intent-tags selectable welcome-intent-grid">
            {INTENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`intent-tag intent-tag--large ${profile.intents.includes(opt.id) ? "selected" : ""} ${opt.id === "Quickie" ? "intent-tag--quickie" : ""}`}
                onClick={() => toggleIntent(opt.id)}
              >
                <span className="intent-tag__emoji">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          {profile.intents.includes("Quickie") && (
            <p className="onboarding-quickie-note">
              Quickie matches are private — you only see others who picked Quickie. Pay once to continue after your first message.
            </p>
          )}
        </section>
      )}

      {step === 5 && (
        <section className="onboarding-step">
          <h2>Optional compatibility</h2>
          <p className="onboarding-sub">{ONBOARDING_CULTURAL_COPY}</p>
          <label>
            Religion
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
            Ethnic background
            <select
              value={profile.ethnicity ?? "Prefer not to say"}
              onChange={(e) => setProfile({ ...profile, ethnicity: e.target.value as EthnicBackground })}
            >
              {ETHNIC_BACKGROUNDS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lifestyle circle
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
        </section>
      )}

      {step === 6 && (
        <section className="onboarding-step">
          <h2>Profile strength</h2>
          <p className="onboarding-sub">Stronger profiles get more signals. You can always improve later.</p>
          <ProfileStrengthMeter strength={strength} />
          <ul className="welcome-strength-tips">
            {strength < 100 && <li>Add more interests and verify your profile in Settings</li>}
            <li>Your photo and bio are the biggest boost</li>
          </ul>
        </section>
      )}

      {step === 7 && (
        <section className="onboarding-step onboarding-step--ready">
          <div className="onboarding-ready-icon">
            <Sparkles size={40} />
          </div>
          <h2>{cms.welcomeReadyTitle}</h2>
          <p className="onboarding-sub">{cms.welcomeReadyBody}</p>
          <div className="onboarding-preview card">
            {profile.photos[0] && <img src={profile.photos[0]} alt="" className="onboarding-preview-photo" />}
            <p className="onboarding-preview-name">{user.name}</p>
            <p className="onboarding-preview-meta">
              {profile.age} · {profile.city}
            </p>
            <p className="onboarding-preview-bio">{profile.bio}</p>
          </div>
        </section>
      )}

      <footer className="onboarding-footer">
        <p className="welcome-flow__next-hint">
          {step === 0 && "Pick your city — we personalize discovery immediately"}
          {step === 1 && "Welcome to BamSignal"}
          {step === 2 && "Photo required to continue"}
          {step === 3 && "Bio helps people connect with you"}
          {step === 7 && "Your first signal is one tap away"}
        </p>
        <button type="button" className="btn-primary btn-full btn-auth" onClick={next} disabled={!canContinue()}>
          {step === STEPS.length - 1 ? "Start Discovering" : step === 1 ? "Continue" : step === 0 ? "Continue" : "Continue"}
          {step < STEPS.length - 1 && <ChevronRight size={18} />}
        </button>
        {step === 5 && (
          <button type="button" className="link-btn onboarding-skip" onClick={next}>
            Skip for now
          </button>
        )}
      </footer>
    </div>
  );
}
