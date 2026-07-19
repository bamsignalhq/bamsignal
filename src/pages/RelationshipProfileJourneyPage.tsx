import { useEffect, useRef, useState } from "react";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { Preloader } from "../components/Preloader";
import {
  JourneyCelebration,
  JourneyChip,
  JourneyPrimaryButton,
  JourneyQuestion,
  JourneySecondaryButton
} from "../components/journey";
import { JourneyProfileShell } from "../components/journey/JourneyProfileShell";
import {
  JOURNEY_BIO_PROMPTS,
  JOURNEY_INTEREST_PICKS,
  prevProfileScreen,
  type JourneyProfileScreenId
} from "../constants/journeyProfile";
import { WHAT_BRINGS_YOU_HERE_OPTIONS } from "../constants/relationshipIntent";
import { formatMoreAboutMeChip, MAX_PROFILE_INTERESTS } from "../constants/moreAboutMe";
import { STORAGE_KEYS } from "../constants/limits";
import { USER_MESSAGES } from "../constants/userMessages";
import { defaultSafetySettings } from "../constants/safety";
import { ONBOARDING_REQUIRED_PHOTOS } from "../utils/buildProfileLater";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  validateDisplayName,
  validateProfileContactLeaks,
  validateUserText
} from "../utils/contactGuard";
import { resolveMemberIdentity } from "../utils/authIdentity";
import { applyFemaleFirstDefaults } from "../utils/safety";
import { markJoinedAt } from "../utils/launchSeed";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { syncMemberProfileRemote } from "../services/cityHome";
import { completeOnboardingRemote } from "../services/memberData";
import {
  applyOnboardingRepairLocal,
  fetchOnboardingStatus
} from "../services/onboardingRepair";
import { normalizeDatingProfile } from "../utils/profile";
import { clearOnboardingDrafts } from "../utils/onboardingStatus";
import { mergeJourneyDraftIntoDatingProfile, readJourneyDraft, clearJourneyDraft } from "../utils/journeyDraft";
import { writeJson, readJson } from "../utils/storage";
import { logAuthRoute } from "../utils/authRouteLog";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { isSignupPhotoCountable } from "../utils/photoMeta";
import { flowLog } from "../utils/flowLog";
import { trackEvent } from "../utils/analytics";
import { navigateToPath } from "../constants/routes";
import { resolveProfileLocation } from "../components/StateCitySelect";
import {
  hasMinimumRelationshipIntents,
  toggleRelationshipIntentSelection
} from "../utils/relationshipIntent";
import type { DatingProfile, RelationshipIntentId, UserProfile } from "../types";

type RelationshipProfileJourneyPageProps = {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onComplete: () => void;
  /** When basics are missing, parent should fall back to legacy onboarding. */
  onNeedBasics: () => void;
};

function countSignupPhotos(profile: Pick<DatingProfile, "photos" | "photoMeta">): number {
  return profile.photos.filter(
    (url) => isStoragePhotoUrl(url) && isSignupPhotoCountable(url, profile.photoMeta)
  ).length;
}

function hasProfileBasics(profile: DatingProfile, user: UserProfile): boolean {
  return (
    user.name.trim().length >= 2 &&
    profile.age >= 18 &&
    Boolean(profile.gender) &&
    Boolean(profile.state?.trim() && profile.city?.trim())
  );
}

export function RelationshipProfileJourneyPage({
  user,
  onComplete,
  onNeedBasics
}: RelationshipProfileJourneyPageProps) {
  const [gateReady, setGateReady] = useState(false);
  const [screen, setScreen] = useState<JourneyProfileScreenId>("j10-photo");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoDelight, setPhotoDelight] = useState(false);
  const [bioPrompt] = useState(
    () => JOURNEY_BIO_PROMPTS[Math.floor(Math.random() * JOURNEY_BIO_PROMPTS.length)] ?? JOURNEY_BIO_PROMPTS[0]
  );
  const messageTimer = useRef<number | null>(null);

  const [profile, setProfile] = useState<DatingProfile>(() =>
    normalizeDatingProfile({
      interests: [],
      interestsTouched: false,
      age: 0,
      gender: "" as DatingProfile["gender"],
      lookingFor: undefined,
      interestedInManuallyChanged: false,
      dateOfBirth: undefined,
      state: "",
      city: "",
      bio: "",
      intents: [],
      onboardingComplete: false,
      setupCompleted: false
    })
  );

  const showMessage = (msg: string) => {
    if (messageTimer.current != null) window.clearTimeout(messageTimer.current);
    setMessage(msg);
    messageTimer.current = window.setTimeout(() => {
      setMessage("");
      messageTimer.current = null;
    }, 4000);
  };

  useEffect(() => {
    let cancelled = false;
    const identity = resolveMemberIdentity(user);
    void (async () => {
      const status = await fetchOnboardingStatus(identity);
      if (cancelled) return;
      logAuthRoute("PROFILE_FETCHED", {
        source: "profile_journey_gate",
        completed: Boolean(status?.completed),
        reason: status?.reason ?? null
      });
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
        clearJourneyDraft();
        onComplete();
        navigateToPath("/home", true);
        return;
      }

      let next = normalizeDatingProfile({
        interests: [],
        interestsTouched: false,
        age: 0,
        gender: "" as DatingProfile["gender"],
        onboardingComplete: false,
        setupCompleted: false
      });
      if (status?.datingProfile) {
        next = normalizeDatingProfile({
          ...next,
          ...status.datingProfile,
          onboardingComplete: false,
          setupCompleted: false
        });
      }
      next = normalizeDatingProfile(mergeJourneyDraftIntoDatingProfile(next, readJourneyDraft()));

      if (!hasProfileBasics(next, user)) {
        onNeedBasics();
        return;
      }

      setProfile(next);
      setGateReady(true);
      flowLog("onboarding_step", { step: "j10-photo", source: "profile_journey" });
    })();
    return () => {
      cancelled = true;
      if (messageTimer.current != null) window.clearTimeout(messageTimer.current);
    };
  }, [onComplete, onNeedBasics, user]);

  useEffect(() => {
    if (!gateReady || profile.onboardingComplete) return;
    const timer = window.setTimeout(() => {
      if (!writeJson(STORAGE_KEYS.datingProfile, { ...profile, onboardingComplete: false })) {
        showMessage(USER_MESSAGES.progressSaveFailed);
      }
    }, 320);
    return () => window.clearTimeout(timer);
  }, [gateReady, profile]);

  const goNext = (next: JourneyProfileScreenId) => {
    setDirection("forward");
    setScreen(next);
    flowLog("onboarding_step", { step: next, source: "profile_journey" });
  };

  const goBack = () => {
    const prev = prevProfileScreen(screen);
    if (!prev) return;
    setDirection("back");
    setPhotoDelight(false);
    setScreen(prev);
  };

  const saveAndFinish = async () => {
    const nameError = validateDisplayName(user.name);
    if (nameError) {
      showMessage(nameError);
      return;
    }
    const bioError = profile.bio.trim() ? validateUserText(profile.bio) : null;
    if (bioError) {
      showMessage(bioError);
      return;
    }
    const profileLeak = validateProfileContactLeaks(profile, user);
    if (profileLeak.blocked) {
      showMessage(CONTACT_LEAK_BLOCK_MESSAGE);
      return;
    }
    if (countSignupPhotos(profile) < ONBOARDING_REQUIRED_PHOTOS) {
      showMessage("Add a welcoming photo so people can meet you.");
      setDirection("back");
      setScreen("j10-photo");
      return;
    }
    if (!hasMinimumRelationshipIntents(profile.intents)) {
      showMessage("Pick what you're hoping for — it helps introductions.");
      setDirection("back");
      setScreen("j11-about");
      return;
    }

    setBusy(true);
    try {
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
        showMessage("We couldn't finish setup. Please try again.");
        return;
      }
      const completed = await completeOnboardingRemote(user);
      if (!completed) {
        showMessage("We couldn't finish setup. Please try again.");
        return;
      }
      if (!writeJson(STORAGE_KEYS.datingProfile, final)) {
        showMessage(USER_MESSAGES.progressSaveFailed);
        return;
      }
      clearOnboardingDrafts();
      clearJourneyDraft();
      writeJson(STORAGE_KEYS.matchPreferences, {
        ...readJson(STORAGE_KEYS.matchPreferences, {}),
        states: final.state ? [final.state] : [],
        cities: final.city ? [final.city] : [],
        religions: final.religion ? [final.religion] : [],
        lifestyles: final.lifestyles?.length
          ? final.lifestyles
          : final.lifestyle
            ? [final.lifestyle]
            : []
      });
      localStorage.setItem(STORAGE_KEYS.firstSignalPromptAt, String(Date.now()));
      trackEvent("profile_completed", { city: final.city, state: final.state ?? "" });
      markFirstDayStep("profile_complete");
      onComplete();
    } finally {
      setBusy(false);
    }
  };

  if (!gateReady) {
    return (
      <div className="page journey-page journey-page--profile">
        <Preloader exiting={false} variant="minimal" subtitle="Preparing your journey…" />
      </div>
    );
  }

  if (screen === "j10-photo") {
    const photoCount = countSignupPhotos(profile);
    const canContinue = photoCount >= ONBOARDING_REQUIRED_PHOTOS;
    return (
      <JourneyProfileShell
        screen="j10-photo"
        transitionDirection={direction}
        guide={photoDelight ? "Looking good." : undefined}
        footer={
          <JourneyPrimaryButton
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) {
                showMessage("Add a clear photo of you — face and good light help.");
                return;
              }
              trackEvent("photo_uploaded");
              setPhotoDelight(true);
              window.setTimeout(() => goNext("j11-about"), 420);
            }}
          >
            Use this photo
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion
          title="Your first impression"
          lede="A clear, welcoming photo of you — face visible, natural light. That's enough to start."
        >
          {photoDelight ? <JourneyCelebration message="Looking good." /> : null}
          <div className="journey-photo">
            <PhotoUploadGrid
              photos={profile.photos}
              mainPhotoUrl={profile.mainPhotoUrl}
              photoMeta={profile.photoMeta}
              signupMode
              className="journey-photo__grid"
              onModerationMessage={showMessage}
              onChange={(photos, photoMeta, mainPhotoUrl) => {
                setPhotoDelight(false);
                setProfile((prev) => ({
                  ...prev,
                  photos,
                  photoMeta,
                  mainPhotoUrl
                }));
              }}
            />
          </div>
          <ul className="journey-photo-tips">
            <li>Show your face clearly</li>
            <li>Soft daylight works best</li>
            <li>You can add more photos later</li>
          </ul>
          {message ? <p className="journey-error">{message}</p> : null}
        </JourneyQuestion>
      </JourneyProfileShell>
    );
  }

  if (screen === "j11-about") {
    const intentReady = hasMinimumRelationshipIntents(profile.intents);
    return (
      <JourneyProfileShell
        screen="j11-about"
        showBack
        onBack={goBack}
        transitionDirection={direction}
        footer={
          <JourneyPrimaryButton
            disabled={!intentReady}
            onClick={() => {
              if (profile.bio.trim()) {
                const bioError = validateUserText(profile.bio);
                if (bioError) {
                  showMessage(bioError);
                  return;
                }
                const leak = validateProfileContactLeaks(profile, user);
                if (leak.blocked) {
                  showMessage(CONTACT_LEAK_BLOCK_MESSAGE);
                  return;
                }
              }
              if (!intentReady) {
                showMessage("Pick what you're hoping for.");
                return;
              }
              goNext("j12-interests");
            }}
          >
            Continue
          </JourneyPrimaryButton>
        }
      >
        <JourneyQuestion
          title="Make it easy to say hello"
          lede={`Share something real. Try: "${bioPrompt}"`}
        >
          <label className="journey-input" htmlFor="journey-bio">
            <span className="journey-input__label">A line people can reply to</span>
            <textarea
              id="journey-bio"
              className="journey-input__field journey-input__textarea"
              rows={4}
              maxLength={280}
              value={profile.bio}
              placeholder="A weekend ritual, what you're curious about, or what you hope to find…"
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
            />
          </label>
          <p className="journey-input__label journey-input__label--spaced">What are you hoping for?</p>
          <div className="journey-chip-row">
            {WHAT_BRINGS_YOU_HERE_OPTIONS.map((option) => {
              const selected = profile.intents.includes(option.id);
              return (
                <JourneyChip
                  key={option.id}
                  label={option.label}
                  selected={selected}
                  onSelect={() => {
                    const result = toggleRelationshipIntentSelection(
                      profile.intents,
                      option.id as RelationshipIntentId
                    );
                    if (result.blocked) {
                      showMessage(result.blockedReason || "You can choose up to two.");
                      return;
                    }
                    setProfile((prev) => ({ ...prev, intents: result.next }));
                  }}
                />
              );
            })}
          </div>
          {message ? <p className="journey-error">{message}</p> : null}
        </JourneyQuestion>
      </JourneyProfileShell>
    );
  }

  if (screen === "j12-interests") {
    const selected = new Set(profile.interests ?? []);
    return (
      <JourneyProfileShell
        screen="j12-interests"
        showBack
        onBack={goBack}
        transitionDirection={direction}
        guide={selected.size > 0 ? "Nice picks." : ""}
        footer={
          <>
            <JourneyPrimaryButton
              onClick={() => {
                setProfile((prev) => ({ ...prev, interestsTouched: true }));
                goNext("j13-ready");
              }}
            >
              Continue
            </JourneyPrimaryButton>
            <JourneySecondaryButton
              onClick={() => {
                setProfile((prev) => ({ ...prev, interestsTouched: true }));
                goNext("j13-ready");
              }}
            >
              Skip for now
            </JourneySecondaryButton>
          </>
        }
      >
        <JourneyQuestion
          title="What do you love?"
          lede="Pick a few things that make you easy to know. Skip if you'd rather keep it light."
        >
          <div className="journey-chip-row">
            {JOURNEY_INTEREST_PICKS.map((id) => {
              const isOn = selected.has(id);
              return (
                <JourneyChip
                  key={id}
                  label={formatMoreAboutMeChip(id)}
                  selected={isOn}
                  onSelect={() => {
                    setProfile((prev) => {
                      const current = prev.interests ?? [];
                      if (current.includes(id)) {
                        return {
                          ...prev,
                          interests: current.filter((item) => item !== id),
                          interestsTouched: true
                        };
                      }
                      if (current.length >= MAX_PROFILE_INTERESTS) {
                        showMessage(`You can choose up to ${MAX_PROFILE_INTERESTS}.`);
                        return prev;
                      }
                      return {
                        ...prev,
                        interests: [...current, id],
                        interestsTouched: true
                      };
                    });
                  }}
                />
              );
            })}
          </div>
          {message ? <p className="journey-error">{message}</p> : null}
        </JourneyQuestion>
      </JourneyProfileShell>
    );
  }

  return (
    <JourneyProfileShell
      screen="j13-ready"
      showBack
      onBack={goBack}
      transitionDirection={direction}
      footer={
        <JourneyPrimaryButton disabled={busy} onClick={() => void saveAndFinish()}>
          {busy ? "Preparing your journey…" : "Start Discovering"}
        </JourneyPrimaryButton>
      }
    >
      <JourneyQuestion title="You're all set.">
        <JourneyCelebration message="Welcome to BamSignal." />
        <p className="journey-question__lede">
          Your first impression is ready. Take your time — every Signal starts a story.
        </p>
        {message ? <p className="journey-error">{message}</p> : null}
      </JourneyQuestion>
    </JourneyProfileShell>
  );
}
