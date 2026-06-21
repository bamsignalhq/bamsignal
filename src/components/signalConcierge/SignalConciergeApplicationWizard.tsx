import { useEffect, useRef, useState } from "react";
import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_MAX_VIDEO_SECONDS,
  SIGNAL_CONCIERGE_MAX_VOICE_SECONDS,
  SIGNAL_CONCIERGE_MEDIA_PRIVACY_NOTE,
  SIGNAL_CONCIERGE_RESUME_LATER_LABEL,
  SIGNAL_CONCIERGE_SAVE_PROGRESS_CONFIRMATION,
  SIGNAL_CONCIERGE_SAVE_PROGRESS_LABEL,
  SIGNAL_CONCIERGE_VIDEO_PRIVACY_PROMISE,
  SIGNAL_CONCIERGE_WIZARD_STEPS
} from "../../constants/signalConcierge";
import type { SignalConciergeApplicationDraft } from "../../types/signalConcierge";
import {
  getSupportedVoiceMimeType,
  isVoiceRecordingSupported,
  micPermissionMessage
} from "../../utils/voiceRecording";
import { submitSignalConciergeApplication } from "../../utils/signalConciergeStorage";
import { ApplicationProgressBar } from "./ApplicationProgressBar";
import {
  defaultAboutYou,
  defaultConsultationPreferences,
  defaultIdentity,
  defaultRelationshipGoals,
  defaultStory,
  defaultValuesLifestyle,
  loadApplicationProgress,
  normalizeApplicationDraft,
  saveApplicationProgress,
  validateApplicationForSubmit,
  validateWizardStep
} from "./ApplicationSaveProgress";
import { ApplicationReviewPage, ApplicationSuccessPage } from "./ApplicationReviewPage";
import { ApplicationStepCard } from "./ApplicationStepCard";

type WizardView = "wizard" | "review" | "success";

type SignalConciergeApplicationWizardProps = {
  onSubmitted: () => void;
  onScheduleConsultation?: () => void;
  onResumeLater?: () => void;
};

export function SignalConciergeApplicationWizard({
  onSubmitted,
  onScheduleConsultation,
  onResumeLater
}: SignalConciergeApplicationWizardProps) {
  const initial = loadApplicationProgress();
  const [view, setView] = useState<WizardView>("wizard");
  const [step, setStep] = useState(() => initial.wizardStep ?? 0);
  const [draft, setDraft] = useState<SignalConciergeApplicationDraft>(() => initial);
  const [message, setMessage] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    saveApplicationProgress(draft, step);
  }, [draft, step]);

  useEffect(() => {
    return () => {
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const patchDraft = (patch: SignalConciergeApplicationDraft) => {
    const next = normalizeApplicationDraft({ ...draft, ...patch });
    setDraft(next);
    setSaveNotice("");
  };

  const about = draft.aboutYou ?? defaultAboutYou();
  const goals = draft.relationshipGoals ?? defaultRelationshipGoals();
  const values = draft.valuesLifestyle ?? defaultValuesLifestyle();
  const story = draft.story ?? defaultStory();
  const identity = draft.identity ?? defaultIdentity();
  const consultation = draft.consultationPreferences ?? defaultConsultationPreferences();

  const goNext = () => {
    const error = validateWizardStep(step, draft);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    if (step >= SIGNAL_CONCIERGE_WIZARD_STEPS.length - 1) {
      setView("review");
      return;
    }
    setStep((current) => current + 1);
  };

  const goBack = () => {
    setMessage("");
    if (view === "review") {
      setView("wizard");
      setStep(SIGNAL_CONCIERGE_WIZARD_STEPS.length - 1);
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSaveProgress = () => {
    saveApplicationProgress(draft, step);
    setSaveNotice(SIGNAL_CONCIERGE_SAVE_PROGRESS_CONFIRMATION);
    setMessage("");
  };

  const handleResumeLater = () => {
    handleSaveProgress();
    onResumeLater?.();
  };

  const handleSubmit = () => {
    const error = validateApplicationForSubmit(draft);
    if (error) {
      setMessage(error);
      return;
    }
    const normalized = normalizeApplicationDraft(draft);
    submitSignalConciergeApplication({
      ...normalized,
      status: "applied",
      consultationPreference: normalized.consultationPreferences?.preferredChannel,
      wizardStep: 0
    });
    setView("success");
    setMessage("");
  };

  const startVoiceRecording = async () => {
    if (!isVoiceRecordingSupported()) {
      setMessage("Voice recording is not supported on this device.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedVoiceMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) voiceChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(voiceChunksRef.current, { type: mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        patchDraft({
          voiceVibe: {
            url,
            duration: draft.voiceVibe?.duration,
            completed: true
          }
        });
        setRecordingVoice(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingVoice(true);
      setMessage("");
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, SIGNAL_CONCIERGE_MAX_VOICE_SECONDS * 1000);
    } catch (error) {
      setMessage(micPermissionMessage(error) ?? "Microphone access is required.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      videoChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        patchDraft({
          videoIntro: {
            url,
            duration: SIGNAL_CONCIERGE_MAX_VIDEO_SECONDS,
            completed: true
          }
        });
        setRecordingVideo(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingVideo(true);
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, SIGNAL_CONCIERGE_MAX_VIDEO_SECONDS * 1000);
    } catch {
      setMessage("Camera access is required for your video introduction.");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  if (view === "success") {
    return (
      <div className="sc-application-wizard">
        <ApplicationSuccessPage onViewStatus={onSubmitted} />
      </div>
    );
  }

  if (view === "review") {
    return (
      <div className="sc-application-wizard">
        <ApplicationReviewPage
          draft={draft}
          message={message}
          onEditSection={(editStep) => {
            setView("wizard");
            setStep(editStep);
            setMessage("");
          }}
          onSubmit={handleSubmit}
        />
        <div className="sc-application-wizard__nav">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={goBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const stepMeta = SIGNAL_CONCIERGE_WIZARD_STEPS[step];

  return (
    <div className="sc-application-wizard">
      <ApplicationProgressBar currentStep={step + 1} stepTitle={stepMeta.title} />

      {saveNotice ? (
        <p className="sc-application-wizard__notice" role="status">
          {saveNotice}
        </p>
      ) : null}

      {message ? (
        <p className="sc-application-wizard__message" role="alert">
          {message}
        </p>
      ) : null}

      <ApplicationStepCard
        title={stepMeta.title}
        subtitle={stepMeta.subtitle}
        privacyNote={
          step === 4 || step === 5 ? SIGNAL_CONCIERGE_MEDIA_PRIVACY_NOTE : undefined
        }
      >
        {step === 0 ? (
          <div className="sc-app-form">
            <label>
              Name
              <input value={about.name} onChange={(e) => patchDraft({ aboutYou: { ...about, name: e.target.value } })} />
            </label>
            <label>
              Age
              <input value={about.age} onChange={(e) => patchDraft({ aboutYou: { ...about, age: e.target.value } })} />
            </label>
            <label>
              Gender
              <input value={about.gender} onChange={(e) => patchDraft({ aboutYou: { ...about, gender: e.target.value } })} />
            </label>
            <label>
              City
              <input value={about.city} onChange={(e) => patchDraft({ aboutYou: { ...about, city: e.target.value } })} />
            </label>
            <label>
              Occupation
              <input value={about.occupation} onChange={(e) => patchDraft({ aboutYou: { ...about, occupation: e.target.value } })} />
            </label>
            <label>
              Education
              <input value={about.education} onChange={(e) => patchDraft({ aboutYou: { ...about, education: e.target.value } })} />
            </label>
            <label>
              Religion
              <input value={about.religion} onChange={(e) => patchDraft({ aboutYou: { ...about, religion: e.target.value } })} />
            </label>
            <label>
              Marital status
              <input value={about.maritalStatus} onChange={(e) => patchDraft({ aboutYou: { ...about, maritalStatus: e.target.value } })} />
            </label>
            <label>
              Children
              <input value={about.children} onChange={(e) => patchDraft({ aboutYou: { ...about, children: e.target.value } })} />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="sc-app-form">
            <label>
              What are you hoping to find?
              <textarea value={goals.whatHopingToFind} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, whatHopingToFind: e.target.value } })} />
            </label>
            <label>
              Timeline for marriage
              <textarea value={goals.marriageTimeline} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, marriageTimeline: e.target.value } })} />
            </label>
            <label>
              Children preference
              <textarea value={goals.childrenPreference} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, childrenPreference: e.target.value } })} />
            </label>
            <label>
              Partner age range
              <input value={goals.partnerAgeRange} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, partnerAgeRange: e.target.value } })} />
            </label>
            <label>
              Partner location
              <input value={goals.partnerLocation} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, partnerLocation: e.target.value } })} />
            </label>
            <label>
              Deal breakers
              <textarea value={goals.dealBreakers} onChange={(e) => patchDraft({ relationshipGoals: { ...goals, dealBreakers: e.target.value } })} />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="sc-app-form">
            {(
              [
                ["faithImportance", "Faith importance"],
                ["smoking", "Smoking"],
                ["drinking", "Drinking"],
                ["fitness", "Fitness"],
                ["travel", "Travel"],
                ["loveLanguage", "Love language"],
                ["threeWords", "Three words friends use to describe you"]
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={values[key]}
                  onChange={(e) => patchDraft({ valuesLifestyle: { ...values, [key]: e.target.value } })}
                />
              </label>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="sc-app-form">
            <label>
              What makes you unique?
              <textarea value={story.whatMakesYouUnique} onChange={(e) => patchDraft({ story: { ...story, whatMakesYouUnique: e.target.value } })} />
            </label>
            <label>
              What are you hoping to build?
              <textarea value={story.whatYouHopeToBuild} onChange={(e) => patchDraft({ story: { ...story, whatYouHopeToBuild: e.target.value } })} />
            </label>
            <label>
              Describe your ideal relationship.
              <textarea value={story.idealRelationship} onChange={(e) => patchDraft({ story: { ...story, idealRelationship: e.target.value } })} />
            </label>
            <label>
              What do you value most?
              <textarea value={story.whatYouValueMost} onChange={(e) => patchDraft({ story: { ...story, whatYouValueMost: e.target.value } })} />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="sc-app-media">
            <p className="sc-app-media__hint">
              Required. Maximum {SIGNAL_CONCIERGE_MAX_VOICE_SECONDS} seconds. Share a warm introduction in your own voice.
            </p>
            {draft.voiceVibe?.url ? <audio controls src={draft.voiceVibe.url} className="sc-app-media__player" /> : null}
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--primary"
              onClick={() => (recordingVoice ? stopVoiceRecording() : void startVoiceRecording())}
            >
              {recordingVoice ? "Stop recording" : draft.voiceVibe?.completed ? "Re-record Voice Vibe" : "Record Voice Vibe"}
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="sc-app-media">
            <p className="sc-app-media__hint">
              Required. Maximum {SIGNAL_CONCIERGE_MAX_VIDEO_SECONDS} seconds. {SIGNAL_CONCIERGE_VIDEO_PRIVACY_PROMISE}
            </p>
            <video ref={videoPreviewRef} muted playsInline className="sc-app-media__preview" />
            {draft.videoIntro?.url ? <video controls src={draft.videoIntro.url} className="sc-app-media__player" /> : null}
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--primary"
              onClick={() => (recordingVideo ? stopVideoRecording() : void startVideoRecording())}
            >
              {recordingVideo ? "Stop recording" : draft.videoIntro?.completed ? "Re-record video" : "Record video introduction"}
            </button>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="sc-app-form">
            <label>
              Government ID
              <input value={identity.governmentIdNote} onChange={(e) => patchDraft({ identity: { ...identity, governmentIdNote: e.target.value } })} />
            </label>
            <label className="sc-app-form__checkbox">
              <input
                type="checkbox"
                checked={identity.selfieVerified}
                onChange={(e) => patchDraft({ identity: { ...identity, selfieVerified: e.target.checked } })}
              />
              <span>Selfie verification completed</span>
            </label>
            <label>
              LinkedIn (optional)
              <input value={identity.linkedIn ?? ""} onChange={(e) => patchDraft({ identity: { ...identity, linkedIn: e.target.value } })} />
            </label>
            <label>
              Instagram (optional)
              <input value={identity.instagram ?? ""} onChange={(e) => patchDraft({ identity: { ...identity, instagram: e.target.value } })} />
            </label>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="sc-app-form">
            <p className="sc-app-form__group-label">Preferred communication</p>
            <div className="signal-concierge-channel-grid">
              {SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.map((channel) => {
                const selected = consultation.preferredChannel === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={`signal-concierge-channel${selected ? " signal-concierge-channel--selected" : ""}`}
                    onClick={() =>
                      patchDraft({
                        consultationPreferences: { ...consultation, preferredChannel: channel.id },
                        consultationPreference: channel.id
                      })
                    }
                  >
                    <span>{channel.label}</span>
                    {selected ? <span aria-hidden>✓</span> : null}
                  </button>
                );
              })}
            </div>
            <label>
              Preferred days
              <input value={consultation.preferredDays} onChange={(e) => patchDraft({ consultationPreferences: { ...consultation, preferredDays: e.target.value } })} />
            </label>
            <label>
              Preferred time range
              <input value={consultation.preferredTimeRange} onChange={(e) => patchDraft({ consultationPreferences: { ...consultation, preferredTimeRange: e.target.value } })} />
            </label>
            <label>
              Additional notes
              <textarea value={consultation.additionalNotes} onChange={(e) => patchDraft({ consultationPreferences: { ...consultation, additionalNotes: e.target.value } })} />
            </label>
          </div>
        ) : null}
      </ApplicationStepCard>

      <div className="sc-application-wizard__nav">
        <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={goBack} disabled={step === 0}>
          Back
        </button>
        <div className="sc-application-wizard__nav-main">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={handleSaveProgress}>
            {SIGNAL_CONCIERGE_SAVE_PROGRESS_LABEL}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={handleResumeLater}>
            {SIGNAL_CONCIERGE_RESUME_LATER_LABEL}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={goNext}>
            {step === SIGNAL_CONCIERGE_WIZARD_STEPS.length - 1 ? "Review application" : "Next"}
          </button>
        </div>
      </div>

      {onScheduleConsultation ? (
        <section className="sc-application-wizard__footer">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onScheduleConsultation}>
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
        </section>
      ) : null}
    </div>
  );
}
