import { SIGNAL_CONCIERGE_WIZARD_STEP_COUNT } from "../../constants/signalConcierge";
import type {
  SignalConciergeAboutYou,
  SignalConciergeApplicationDraft,
  SignalConciergeConsultationPreferences,
  SignalConciergeIdentity,
  SignalConciergeRelationshipGoals,
  SignalConciergeStory,
  SignalConciergeValuesLifestyle
} from "../../types/signalConcierge";
import {
  mergeSignalConciergeDraft,
  readSignalConciergeDraft
} from "../../utils/signalConciergeStorage";

export const APPLICATION_WIZARD_STEP_COUNT = SIGNAL_CONCIERGE_WIZARD_STEP_COUNT;

export function defaultAboutYou(): SignalConciergeAboutYou {
  return {
    name: "",
    age: "",
    gender: "",
    city: "",
    occupation: "",
    education: "",
    religion: "",
    maritalStatus: "",
    children: ""
  };
}

export function defaultRelationshipGoals(): SignalConciergeRelationshipGoals {
  return {
    whatHopingToFind: "",
    marriageTimeline: "",
    childrenPreference: "",
    partnerAgeRange: "",
    partnerLocation: "",
    dealBreakers: ""
  };
}

export function defaultValuesLifestyle(): SignalConciergeValuesLifestyle {
  return {
    faithImportance: "",
    smoking: "",
    drinking: "",
    fitness: "",
    travel: "",
    loveLanguage: "",
    threeWords: ""
  };
}

export function defaultStory(): SignalConciergeStory {
  return {
    whatMakesYouUnique: "",
    whatYouHopeToBuild: "",
    idealRelationship: "",
    whatYouValueMost: ""
  };
}

export function defaultIdentity(): SignalConciergeIdentity {
  return {
    governmentIdNote: "",
    selfieVerified: false,
    linkedIn: "",
    instagram: ""
  };
}

export function defaultConsultationPreferences(): SignalConciergeConsultationPreferences {
  return {
    preferredDays: "",
    preferredTimeRange: "",
    additionalNotes: ""
  };
}

export function normalizeApplicationDraft(
  draft: SignalConciergeApplicationDraft = readSignalConciergeDraft()
): SignalConciergeApplicationDraft {
  const goals = draft.relationshipGoals ?? defaultRelationshipGoals();
  const legacyGoals = goals as SignalConciergeRelationshipGoals & {
    partnerPreferences?: string;
    familyGoals?: string;
  };

  return {
    ...draft,
    aboutYou: { ...defaultAboutYou(), ...draft.aboutYou },
    relationshipGoals: {
      ...defaultRelationshipGoals(),
      ...goals,
      whatHopingToFind: goals.whatHopingToFind || legacyGoals.partnerPreferences || "",
      childrenPreference: goals.childrenPreference || legacyGoals.familyGoals || ""
    },
    valuesLifestyle: { ...defaultValuesLifestyle(), ...draft.valuesLifestyle },
    story: {
      ...defaultStory(),
      ...draft.story,
      whatMakesYouUnique: draft.story?.whatMakesYouUnique || draft.story?.longFormStory || ""
    },
    identity: { ...defaultIdentity(), ...draft.identity },
    consultationPreferences: {
      ...defaultConsultationPreferences(),
      ...draft.consultationPreferences,
      preferredChannel:
        draft.consultationPreferences?.preferredChannel ?? draft.consultationPreference
    },
    wizardStep: draft.wizardStep ?? 0
  };
}

export function loadApplicationProgress(): SignalConciergeApplicationDraft {
  return normalizeApplicationDraft(readSignalConciergeDraft());
}

export function saveApplicationProgress(
  draft: SignalConciergeApplicationDraft,
  wizardStep?: number
): SignalConciergeApplicationDraft {
  const normalized = normalizeApplicationDraft(draft);
  return mergeSignalConciergeDraft({
    ...normalized,
    wizardStep: wizardStep ?? normalized.wizardStep ?? 0,
    savedAt: new Date().toISOString()
  });
}

export function hasResumableApplicationProgress(): boolean {
  const draft = loadApplicationProgress();
  if ((draft.wizardStep ?? 0) > 0) return true;
  const about = draft.aboutYou;
  return Boolean(
    about?.name ||
      about?.city ||
      draft.relationshipGoals?.whatHopingToFind ||
      draft.story?.whatMakesYouUnique ||
      draft.voiceVibe?.completed ||
      draft.videoIntro?.completed
  );
}

function hasText(value?: string): boolean {
  return Boolean(value?.trim());
}

export function validateWizardStep(step: number, draft: SignalConciergeApplicationDraft): string | null {
  const normalized = normalizeApplicationDraft(draft);

  switch (step) {
    case 0: {
      const about = normalized.aboutYou!;
      if (!hasText(about.name)) return "Please share your name.";
      if (!hasText(about.age)) return "Please share your age.";
      if (!hasText(about.gender)) return "Please share your gender.";
      if (!hasText(about.city)) return "Please share your city.";
      return null;
    }
    case 1: {
      const goals = normalized.relationshipGoals!;
      if (!hasText(goals.whatHopingToFind)) return "Please tell us what you are hoping to find.";
      if (!hasText(goals.marriageTimeline)) return "Please share your timeline for marriage.";
      return null;
    }
    case 2: {
      const values = normalized.valuesLifestyle!;
      if (!hasText(values.faithImportance)) return "Please share how important faith is to you.";
      if (!hasText(values.threeWords)) return "Please share three words friends use to describe you.";
      return null;
    }
    case 3: {
      const story = normalized.story!;
      const filled = [
        story.whatMakesYouUnique,
        story.whatYouHopeToBuild,
        story.idealRelationship,
        story.whatYouValueMost
      ].some(hasText);
      if (!filled) return "Please answer at least one prompt about yourself.";
      return null;
    }
    case 4:
      if (!normalized.voiceVibe?.completed) return "Voice Vibe is required before continuing.";
      return null;
    case 5:
      if (!normalized.videoIntro?.completed) return "Video introduction is required before continuing.";
      return null;
    case 6: {
      const identity = normalized.identity!;
      if (!hasText(identity.governmentIdNote)) return "Please add your government ID reference.";
      if (!identity.selfieVerified) return "Please confirm selfie verification.";
      return null;
    }
    case 7: {
      const prefs = normalized.consultationPreferences!;
      if (!prefs.preferredChannel) return "Please choose a preferred communication channel.";
      if (!hasText(prefs.preferredDays)) return "Please share your preferred days.";
      if (!hasText(prefs.preferredTimeRange)) return "Please share your preferred time range.";
      return null;
    }
    default:
      return null;
  }
}

export function validateApplicationForSubmit(draft: SignalConciergeApplicationDraft): string | null {
  for (let step = 0; step < APPLICATION_WIZARD_STEP_COUNT; step += 1) {
    const error = validateWizardStep(step, draft);
    if (error) return error;
  }
  return null;
}
