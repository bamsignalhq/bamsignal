import { useEffect, useMemo, useRef, useState } from "react";
import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_CTA_PRIMARY
} from "../../constants/signalConcierge";
import type { SignalConciergeApplicationDraft } from "../../types/signalConcierge";
import {
  getSupportedVoiceMimeType,
  isVoiceRecordingSupported,
  MAX_VOICE_SECONDS,
  micPermissionMessage,
  MIN_VOICE_SECONDS
} from "../../utils/voiceRecording";
import {
  mergeSignalConciergeDraft,
  readSignalConciergeDraft,
  submitSignalConciergeApplication
} from "../../utils/signalConciergeStorage";

const WIZARD_STEPS = [
  "About You",
  "Relationship Goals",
  "Values & Lifestyle",
  "More About You",
  "Voice Vibe",
  "Video Introduction",
  "Identity Verification",
  "Consultation Preference"
] as const;

const MAX_VIDEO_SECONDS = 60;

type SignalConciergeApplicationWizardProps = {
  onSubmitted: () => void;
  onScheduleConsultation: () => void;
};

export function SignalConciergeApplicationWizard({
  onSubmitted,
  onScheduleConsultation
}: SignalConciergeApplicationWizardProps) {
  const [step, setStep] = useState(() => readSignalConciergeDraft().wizardStep ?? 0);
  const [draft, setDraft] = useState<SignalConciergeApplicationDraft>(() => readSignalConciergeDraft());
  const [message, setMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    mergeSignalConciergeDraft({ wizardStep: step });
  }, [step]);

  useEffect(() => {
    return () => {
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const progress = useMemo(() => ((step + 1) / WIZARD_STEPS.length) * 100, [step]);

  const patchDraft = (patch: SignalConciergeApplicationDraft) => {
    const next = mergeSignalConciergeDraft({ ...patch, wizardStep: step });
    setDraft(next);
  };

  const nextStep = () => setStep((current) => Math.min(current + 1, WIZARD_STEPS.length - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

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
      }, MAX_VOICE_SECONDS * 1000);
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
            duration: MAX_VIDEO_SECONDS,
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
      }, MAX_VIDEO_SECONDS * 1000);
    } catch {
      setMessage("Camera access is required for your video introduction.");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = () => {
    if (!draft.voiceVibe?.completed) {
      setMessage("Voice Vibe is required.");
      setStep(4);
      return;
    }
    if (!draft.videoIntro?.completed) {
      setMessage("Video introduction is required.");
      setStep(5);
      return;
    }
    submitSignalConciergeApplication({
      ...draft,
      status: "applied",
      wizardStep: 0
    });
    onSubmitted();
  };

  const about = draft.aboutYou ?? {
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
  const goals = draft.relationshipGoals ?? {
    marriageTimeline: "",
    dealBreakers: "",
    partnerPreferences: "",
    familyGoals: ""
  };
  const values = draft.valuesLifestyle ?? {
    faithImportance: "",
    smoking: "",
    drinking: "",
    fitness: "",
    travel: "",
    loveLanguage: "",
    threeWords: ""
  };
  const story = draft.story ?? {
    longFormStory: "",
    whatMakesYouUnique: "",
    whatYouHopeToBuild: ""
  };
  const identity = draft.identity ?? { governmentIdNote: "", selfieVerified: false };

  return (
    <div className="signal-concierge-wizard">
      <div className="signal-concierge-wizard__progress">
        <p className="signal-concierge-wizard__step-label">
          Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}
        </p>
        <div className="signal-concierge-wizard__bar" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      {message ? (
        <p className="signal-concierge-section__sub" role="status">
          {message}
        </p>
      ) : null}

      <div className="signal-concierge-form signal-concierge-glass">
        {step === 0 ? (
          <>
            <label>
              Name
              <input
                value={about.name}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, name: event.target.value } })
                }
              />
            </label>
            <label>
              Age
              <input
                value={about.age}
                onChange={(event) => patchDraft({ aboutYou: { ...about, age: event.target.value } })}
              />
            </label>
            <label>
              Gender
              <input
                value={about.gender}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, gender: event.target.value } })
                }
              />
            </label>
            <label>
              City
              <input
                value={about.city}
                onChange={(event) => patchDraft({ aboutYou: { ...about, city: event.target.value } })}
              />
            </label>
            <label>
              Occupation
              <input
                value={about.occupation}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, occupation: event.target.value } })
                }
              />
            </label>
            <label>
              Education
              <input
                value={about.education}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, education: event.target.value } })
                }
              />
            </label>
            <label>
              Religion
              <input
                value={about.religion}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, religion: event.target.value } })
                }
              />
            </label>
            <label>
              Marital status
              <input
                value={about.maritalStatus}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, maritalStatus: event.target.value } })
                }
              />
            </label>
            <label>
              Children
              <input
                value={about.children}
                onChange={(event) =>
                  patchDraft({ aboutYou: { ...about, children: event.target.value } })
                }
              />
            </label>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <label>
              Timeline for marriage
              <textarea
                value={goals.marriageTimeline}
                onChange={(event) =>
                  patchDraft({ relationshipGoals: { ...goals, marriageTimeline: event.target.value } })
                }
              />
            </label>
            <label>
              Deal breakers
              <textarea
                value={goals.dealBreakers}
                onChange={(event) =>
                  patchDraft({ relationshipGoals: { ...goals, dealBreakers: event.target.value } })
                }
              />
            </label>
            <label>
              Partner preferences
              <textarea
                value={goals.partnerPreferences}
                onChange={(event) =>
                  patchDraft({
                    relationshipGoals: { ...goals, partnerPreferences: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Family goals
              <textarea
                value={goals.familyGoals}
                onChange={(event) =>
                  patchDraft({ relationshipGoals: { ...goals, familyGoals: event.target.value } })
                }
              />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
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
                  onChange={(event) =>
                    patchDraft({
                      valuesLifestyle: { ...values, [key]: event.target.value }
                    })
                  }
                />
              </label>
            ))}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label>
              Long-form story
              <textarea
                value={story.longFormStory}
                onChange={(event) =>
                  patchDraft({ story: { ...story, longFormStory: event.target.value } })
                }
              />
            </label>
            <label>
              What makes you unique?
              <textarea
                value={story.whatMakesYouUnique}
                onChange={(event) =>
                  patchDraft({ story: { ...story, whatMakesYouUnique: event.target.value } })
                }
              />
            </label>
            <label>
              What are you hoping to build?
              <textarea
                value={story.whatYouHopeToBuild}
                onChange={(event) =>
                  patchDraft({ story: { ...story, whatYouHopeToBuild: event.target.value } })
                }
              />
            </label>
          </>
        ) : null}

        {step === 4 ? (
          <div className="signal-concierge-media-card">
            <p className="signal-concierge-section__sub">
              Voice Vibe is required. Share a warm introduction in your own voice ({MIN_VOICE_SECONDS}–
              {MAX_VOICE_SECONDS} seconds).
            </p>
            {draft.voiceVibe?.url ? (
              <audio controls src={draft.voiceVibe.url} />
            ) : null}
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
          <div className="signal-concierge-media-card">
            <p className="signal-concierge-section__sub">
              Video introduction is required. Maximum {MAX_VIDEO_SECONDS} seconds.
            </p>
            <video ref={videoPreviewRef} muted playsInline />
            {draft.videoIntro?.url ? <video controls src={draft.videoIntro.url} /> : null}
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--primary"
              onClick={() => (recordingVideo ? stopVideoRecording() : void startVideoRecording())}
            >
              {recordingVideo
                ? "Stop recording"
                : draft.videoIntro?.completed
                  ? "Re-record video"
                  : "Record video introduction"}
            </button>
          </div>
        ) : null}

        {step === 6 ? (
          <>
            <label>
              Government ID (reference note)
              <input
                value={identity.governmentIdNote}
                onChange={(event) =>
                  patchDraft({
                    identity: { ...identity, governmentIdNote: event.target.value }
                  })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={identity.selfieVerified}
                onChange={(event) =>
                  patchDraft({
                    identity: { ...identity, selfieVerified: event.target.checked }
                  })
                }
              />{" "}
              Selfie verification completed
            </label>
            <label>
              LinkedIn (optional)
              <input
                value={identity.linkedIn ?? ""}
                onChange={(event) =>
                  patchDraft({ identity: { ...identity, linkedIn: event.target.value } })
                }
              />
            </label>
            <label>
              Instagram (optional)
              <input
                value={identity.instagram ?? ""}
                onChange={(event) =>
                  patchDraft({ identity: { ...identity, instagram: event.target.value } })
                }
              />
            </label>
          </>
        ) : null}

        {step === 7 ? (
          <div className="signal-concierge-channel-grid">
            {SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.map((channel) => {
              const selected = draft.consultationPreference === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  className={`signal-concierge-channel${selected ? " signal-concierge-channel--selected" : ""}`}
                  onClick={() => patchDraft({ consultationPreference: channel.id })}
                >
                  <span>{channel.label}</span>
                  {selected ? <span aria-hidden>✓</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="signal-concierge-wizard__nav">
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--ghost"
          onClick={prevStep}
          disabled={step === 0}
        >
          Back
        </button>
        {step < WIZARD_STEPS.length - 1 ? (
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={nextStep}>
            Continue
          </button>
        ) : (
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={handleSubmit}>
            Submit application
          </button>
        )}
      </div>

      <section className="signal-concierge-section" style={{ textAlign: "center" }}>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--ghost"
          onClick={onScheduleConsultation}
        >
          {SIGNAL_CONCIERGE_CTA_PRIMARY}
        </button>
      </section>
    </div>
  );
}
