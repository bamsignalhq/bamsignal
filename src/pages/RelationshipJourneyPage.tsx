import { useMemo, useRef, useState } from "react";
import { Heart, Lock, Sparkles } from "lucide-react";
import { StateCitySelect } from "../components/StateCitySelect";
import {
  JourneyCelebration,
  JourneyChoiceCard,
  JourneyChip,
  JourneyInput,
  JourneyPrimaryButton,
  JourneyQuestion,
  JourneySecondaryButton,
  JourneyShell
} from "../components/journey";
import {
  JOURNEY_GUIDE,
  JOURNEY_MIN_AGE,
  JOURNEY_SCREEN_CHAPTER,
  JOURNEY_STRENGTH,
  JOURNEY_TRUST,
  prevJourneyScreen
} from "../constants/journey";
import { navigateToPath } from "../constants/routes";
import type { ExperienceIntent, JourneyDraft, JourneyScreenId } from "../types/journey";
import type { Gender, LookingFor } from "../types";
import {
  ageFromDateOfBirth,
  maxDateOfBirthForMinAge,
  readJourneyDraft,
  writeJourneyDraft
} from "../utils/journeyDraft";
import { validateDisplayName } from "../utils/contactGuard";

type RelationshipJourneyPageProps = {
  onYouChapterComplete: (draft: JourneyDraft) => void;
  onLogin: () => void;
};

const GENDERS: Gender[] = ["Man", "Woman", "Non-binary"];
const LOOKING: LookingFor[] = ["Men", "Women"];

export function RelationshipJourneyPage({ onYouChapterComplete, onLogin }: RelationshipJourneyPageProps) {
  const initial = readJourneyDraft();
  const [screen, setScreen] = useState<JourneyScreenId>(initial?.screen ?? "j1-welcome");
  const [intent, setIntent] = useState<ExperienceIntent | undefined>(initial?.experienceIntent);
  const [name, setName] = useState(initial?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? "");
  const [gender, setGender] = useState<Gender | undefined>(initial?.gender);
  const [lookingFor, setLookingFor] = useState<LookingFor | undefined>(initial?.lookingFor);
  const [state, setState] = useState(initial?.state ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [delight, setDelight] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const transitionTimer = useRef<number | null>(null);

  const chapter = JOURNEY_SCREEN_CHAPTER[screen];
  const strength = JOURNEY_STRENGTH[screen];
  const maxDob = useMemo(() => maxDateOfBirthForMinAge(JOURNEY_MIN_AGE), []);

  const persist = (patch: Partial<JourneyDraft> & { screen?: JourneyScreenId }) => {
    writeJourneyDraft({
      experienceIntent: intent,
      name: name.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      lookingFor,
      state: state || undefined,
      city: city || undefined,
      ...patch
    });
  };

  const goNext = (next: JourneyScreenId, options?: { celebrate?: string }) => {
    if (transitioning) return;
    setError("");
    setDirection("forward");

    if (options?.celebrate) {
      setDelight(options.celebrate);
      setTransitioning(true);
      transitionTimer.current = window.setTimeout(() => {
        transitionTimer.current = null;
        setTransitioning(false);
        setDelight(null);
        setScreen(next);
        persist({ screen: next });
      }, 380);
      return;
    }

    setDelight(null);
    setScreen(next);
    persist({ screen: next });
  };

  const goBack = () => {
    if (transitioning) return;
    const prev = prevJourneyScreen(screen);
    if (!prev) return;
    setError("");
    setDelight(null);
    setDirection("back");
    setScreen(prev);
    persist({ screen: prev });
  };

  const finishYouChapter = () => {
    const draft = writeJourneyDraft({
      screen: "j6-location",
      experienceIntent: intent,
      name: name.trim(),
      dateOfBirth,
      gender,
      lookingFor,
      state,
      city
    });
    onYouChapterComplete(draft);
  };

  const shellProps = {
    chapter,
    strengthFill: strength.fill,
    strengthLabel: strength.label,
    strengthHint: strength.hint,
    guide: JOURNEY_GUIDE[screen],
    trust: JOURNEY_TRUST[screen],
    showBack: screen !== "j1-welcome",
    onBack: screen !== "j1-welcome" ? goBack : undefined,
    transitionKey: screen,
    transitionDirection: direction
  };

  if (screen === "j1-welcome") {
    return (
      <JourneyShell
        {...shellProps}
        footer={
          <>
            <JourneyPrimaryButton onClick={() => goNext("j2-intent")}>Begin</JourneyPrimaryButton>
            <JourneySecondaryButton onClick={onLogin}>Already have an account?</JourneySecondaryButton>
          </>
        }
      >
        <JourneyQuestion title="Welcome to BamSignal">
          <p className="journey-question__lede">Meaningful relationships begin with one step.</p>
          <p className="journey-question__helper">We&apos;ll guide you. A few minutes.</p>
        </JourneyQuestion>
      </JourneyShell>
    );
  }

  if (screen === "j2-intent") {
    return (
      <JourneyShell
        {...shellProps}
        footer={
          <JourneyPrimaryButton
            disabled={!intent || transitioning}
            onClick={() => {
              if (intent === "concierge") {
                persist({ experienceIntent: intent, screen: "j2-intent" });
                navigateToPath("/concierge/signup");
                return;
              }
              goNext("j3-name", { celebrate: "Great choice." });
            }}
          >
            Continue
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion title="How would you like to meet?">
          {delight ? <JourneyCelebration message={delight} /> : null}
          <JourneyChoiceCard
            tone="discover"
            title="Discover"
            detail="Explore and connect."
            selected={intent === "discover"}
            icon={<Heart size={18} aria-hidden />}
            onSelect={() => setIntent("discover")}
          />
          <JourneyChoiceCard
            tone="discreet"
            title="Discreet Membership"
            detail="Private · you stay in control."
            selected={intent === "discreet"}
            icon={<Lock size={18} aria-hidden />}
            onSelect={() => setIntent("discreet")}
          />
          <JourneyChoiceCard
            tone="concierge"
            title="Signal Concierge™"
            detail="Dedicated matchmaker."
            selected={intent === "concierge"}
            icon={<Sparkles size={18} aria-hidden />}
            onSelect={() => setIntent("concierge")}
          />
        </JourneyQuestion>
      </JourneyShell>
    );
  }

  if (screen === "j3-name") {
    return (
      <JourneyShell
        {...shellProps}
        footer={
          <JourneyPrimaryButton
            onClick={() => {
              const trimmed = name.trim();
              const nameError = validateDisplayName(trimmed);
              if (nameError) {
                setError(nameError);
                return;
              }
              goNext("j4-dob");
            }}
          >
            Continue
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion title="What should people call you?">
          <JourneyInput
            id="journey-name"
            label="First name"
            value={name}
            autoComplete="given-name"
            onChange={(value) => {
              setName(value);
              setError("");
            }}
          />
          {error ? <p className="journey-error">{error}</p> : null}
        </JourneyQuestion>
      </JourneyShell>
    );
  }

  if (screen === "j4-dob") {
    return (
      <JourneyShell
        {...shellProps}
        footer={
          <JourneyPrimaryButton
            disabled={!dateOfBirth}
            onClick={() => {
              const age = ageFromDateOfBirth(dateOfBirth);
              if (age == null || age < JOURNEY_MIN_AGE) {
                setError(`You must be at least ${JOURNEY_MIN_AGE} to join BamSignal.`);
                return;
              }
              goNext("j5-meet");
            }}
          >
            Continue
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion title="What's your birthday?">
          <JourneyInput
            id="journey-dob"
            label="Date of birth"
            type="date"
            value={dateOfBirth}
            max={maxDob}
            onChange={(value) => {
              setDateOfBirth(value);
              setError("");
            }}
          />
          {error ? <p className="journey-error">{error}</p> : null}
        </JourneyQuestion>
      </JourneyShell>
    );
  }

  if (screen === "j5-meet") {
    return (
      <JourneyShell
        {...shellProps}
        footer={
          <JourneyPrimaryButton
            disabled={!gender || !lookingFor}
            onClick={() => goNext("j6-location")}
          >
            Continue
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion title="Who would you like to meet?">
          <p className="journey-input__label">I am a</p>
          <div className="journey-chip-row">
            {GENDERS.map((value) => (
              <JourneyChip key={value} label={value} selected={gender === value} onSelect={() => setGender(value)} />
            ))}
          </div>
          <p className="journey-input__label journey-input__label--spaced">Interested in</p>
          <div className="journey-chip-row">
            {LOOKING.map((value) => (
              <JourneyChip
                key={value}
                label={value}
                selected={lookingFor === value}
                onSelect={() => setLookingFor(value)}
              />
            ))}
          </div>
        </JourneyQuestion>
      </JourneyShell>
    );
  }

  return (
    <JourneyShell
      {...shellProps}
      footer={
        <JourneyPrimaryButton
          disabled={!city.trim()}
          onClick={() => {
            if (!city.trim()) {
              setError("Choose your city so we can recommend people near you.");
              return;
            }
            finishYouChapter();
          }}
        >
          Continue
        </JourneyPrimaryButton>
      }
    >
      <JourneyQuestion title="Where are you based?">
        <div className="journey-location">
          <StateCitySelect
            state={state}
            city={city}
            stateLabel="State"
            cityLabel="City"
            onLocationChange={(nextState, nextCity) => {
              setState(nextState);
              setCity(nextCity);
              setError("");
            }}
          />
        </div>
        {error ? <p className="journey-error">{error}</p> : null}
      </JourneyQuestion>
    </JourneyShell>
  );
}
