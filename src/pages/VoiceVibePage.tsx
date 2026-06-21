import { ArrowLeft, Mic, Pause, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { USER_MESSAGES } from "../constants/userMessages";
import { uploadVoiceIntroBlob } from "../services/voiceIntroUpload";
import { syncMemberProfileWithResult } from "../services/cityHome";
import { revalidateMemberProfileAfterUpdate } from "../services/memberProfileSync";
import type { DatingProfile, UserProfile } from "../types";
import { moderateVoiceIntroTranscript } from "../utils/mediaModeration";
import { normalizeDatingProfile } from "../utils/profile";
import {
  getSupportedVoiceMimeType,
  isVoiceRecordingSupported,
  MAX_VOICE_SECONDS,
  micPermissionMessage,
  MIN_VOICE_SECONDS,
  RECOMMENDED_VOICE_MAX_SECONDS,
  RECOMMENDED_VOICE_MIN_SECONDS
} from "../utils/voiceRecording";
import {
  buildVoiceVibePatch,
  clearVoiceVibePatch,
  formatVoiceVibeTime,
  getVoiceVibeDuration,
  getVoiceVibeUrl,
  type VoiceVibeRecordingState
} from "../utils/voiceVibe";
import { VoiceVibePlayer } from "../components/voice/VoiceVibePlayer";
import { VoiceVibeWaveform } from "../components/voice/VoiceVibeWaveform";
import { VoiceVibeIdeasSection } from "../components/voice/VoiceVibeIdeasSection";
import { stopVoiceVibeIdeaAloud } from "../utils/voiceVibeIdeas";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

type VoiceVibePageProps = {
  user: UserProfile;
  profile: DatingProfile;
  isPremium: boolean;
  onProfileChange: (profile: DatingProfile) => void;
  onBack: () => void;
  onMessage?: (message: string, success?: boolean) => void;
};

export function VoiceVibePage({
  user,
  profile: initialProfile,
  isPremium,
  onProfileChange,
  onBack,
  onMessage
}: VoiceVibePageProps) {
  const [profile, setProfile] = useState(initialProfile);
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const savedUrl = getVoiceVibeUrl(profile);
  const savedDuration = getVoiceVibeDuration(profile);
  const [supported] = useState(() => isVoiceRecordingSupported());
  const [recordingState, setRecordingState] = useState<VoiceVibeRecordingState>(savedUrl ? "saved" : "idle");
  const [elapsed, setElapsed] = useState(0);
  const [scriptDraft, setScriptDraft] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewMime, setPreviewMime] = useState("audio/webm");
  const [previewDuration, setPreviewDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [waveLevels, setWaveLevels] = useState<number[]>(Array.from({ length: 16 }, () => 0.2));

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");
  const previewUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const notify = (message: string, success = false) => onMessage?.(message, success);

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
    setPreviewDuration(0);
  };

  const stopWaveform = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setWaveLevels(Array.from({ length: 16 }, () => 0.2));
  };

  const startWaveform = (stream: MediaStream) => {
    stopWaveform();
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const next = Array.from({ length: 16 }, (_, index) => {
        const sample = data[index] ?? 0;
        return Math.max(0.12, sample / 255);
      });
      setWaveLevels(next);
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  };

  const cleanupRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    mediaRef.current = null;
    stopWaveform();
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
      clearPreview();
      stopVoiceVibeIdeaAloud();
    };
  }, []);

  const finalizeStop = () => {
    cleanupRecording();
    const secondsRecorded = elapsedRef.current;
    if (secondsRecorded < MIN_VOICE_SECONDS) {
      setRecordingState("idle");
      setElapsed(0);
      elapsedRef.current = 0;
      notify(`Voice Vibe needs at least ${MIN_VOICE_SECONDS} seconds.`);
      return;
    }

    const transcript = `${transcriptRef.current} ${scriptDraft}`.trim();
    if (transcript) {
      const verdict = moderateVoiceIntroTranscript(transcript);
      if (!verdict.allowed) {
        setRecordingState("idle");
        setElapsed(0);
        elapsedRef.current = 0;
        notify(verdict.message);
        return;
      }
    }

    const blob = new Blob(chunksRef.current, { type: previewMime });
    const nextPreviewUrl = URL.createObjectURL(blob);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewBlob(blob);
    setPreviewUrl(nextPreviewUrl);
    setPreviewDuration(secondsRecorded);
    setRecordingState("preview");
  };

  const startRecording = async () => {
    if (!supported) {
      notify(USER_MESSAGES.voiceVibeUnsupported);
      return;
    }
    clearPreview();
    transcriptRef.current = "";
    elapsedRef.current = 0;
    setElapsed(0);

    try {
      const mimeType = getSupportedVoiceMimeType();
      if (!mimeType) {
        notify(USER_MESSAGES.voiceVibeUnsupported);
        return;
      }
      setPreviewMime(mimeType);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startWaveform(stream);

      const SpeechRecognitionCtor = getSpeechRecognition();
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-NG";
        recognition.onresult = (event) => {
          let chunk = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            chunk += event.results[i][0]?.transcript ?? "";
          }
          transcriptRef.current = `${transcriptRef.current} ${chunk}`.trim();
        };
        recognition.onerror = () => undefined;
        recognition.start();
        recognitionRef.current = recognition;
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = finalizeStop;

      mediaRef.current = recorder;
      recorder.start(250);
      setRecordingState("recording");
      tickRef.current = window.setInterval(() => {
        elapsedRef.current = Math.min(MAX_VOICE_SECONDS, elapsedRef.current + 1);
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_VOICE_SECONDS) stopRecording();
      }, 1000);
      timerRef.current = window.setTimeout(() => stopRecording(), MAX_VOICE_SECONDS * 1000);
    } catch (error) {
      cleanupRecording();
      setRecordingState("idle");
      notify(micPermissionMessage(error) || USER_MESSAGES.voiceVibeMicDenied);
    }
  };

  const pauseRecording = () => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.pause();
      recognitionRef.current?.stop();
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
      stopWaveform();
      setRecordingState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRef.current?.state === "paused") {
      mediaRef.current.resume();
      const SpeechRecognitionCtor = getSpeechRecognition();
      if (SpeechRecognitionCtor && !recognitionRef.current) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-NG";
        recognition.onresult = (event) => {
          let chunk = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            chunk += event.results[i][0]?.transcript ?? "";
          }
          transcriptRef.current = `${transcriptRef.current} ${chunk}`.trim();
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
      if (streamRef.current) startWaveform(streamRef.current);
      setRecordingState("recording");
      tickRef.current = window.setInterval(() => {
        elapsedRef.current = Math.min(MAX_VOICE_SECONDS, elapsedRef.current + 1);
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_VOICE_SECONDS) stopRecording();
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    if (mediaRef.current && (mediaRef.current.state === "recording" || mediaRef.current.state === "paused")) {
      mediaRef.current.stop();
      return;
    }
    cleanupRecording();
    setRecordingState("idle");
  };

  const saveVoiceVibe = async () => {
    if (!previewBlob || uploading) return;
    setUploading(true);
    try {
      const uploaded = await uploadVoiceIntroBlob(previewBlob, previewMime);
      if (!uploaded.ok) {
        notify(uploaded.message);
        return;
      }
      const patch = buildVoiceVibePatch({
        url: uploaded.url,
        durationSeconds: previewDuration,
        transcript: transcriptRef.current || scriptDraft
      });
      const next = normalizeDatingProfile({ ...profile, ...patch, premium: isPremium });
      setProfile(next);
      onProfileChange(next);
      const synced = await syncMemberProfileWithResult(user, next, { patchScope: "voice" });
      if (!synced.ok) {
        notify(USER_MESSAGES.voiceVibeSaveFailed);
        return;
      }
      const canonical = await revalidateMemberProfileAfterUpdate(user, {
        profile: synced.profile ?? next
      });
      onProfileChange({ ...canonical.profile, premium: isPremium });
      setProfile({ ...canonical.profile, premium: isPremium });
      clearPreview();
      setRecordingState("saved");
      notify("Voice Vibe saved.", true);
    } finally {
      setUploading(false);
    }
  };

  const deleteVoiceVibe = async () => {
    const next = normalizeDatingProfile({ ...profile, ...clearVoiceVibePatch(), premium: isPremium });
    setProfile(next);
    onProfileChange(next);
    const synced = await syncMemberProfileWithResult(user, next, { patchScope: "voice" });
    if (!synced.ok) {
      notify(USER_MESSAGES.voiceVibeSaveFailed);
      return;
    }
    const canonical = await revalidateMemberProfileAfterUpdate(user, {
      profile: synced.profile ?? next
    });
    onProfileChange({ ...canonical.profile, premium: isPremium });
    clearPreview();
    setRecordingState("idle");
    setElapsed(0);
    elapsedRef.current = 0;
    notify("Voice Vibe removed.", true);
  };

  const activeUrl = previewUrl || savedUrl;
  const activeDuration = previewDuration || savedDuration || 0;
  const isRecording = recordingState === "recording" || recordingState === "paused";

  return (
    <div className="page voice-vibe-page member-content-pad">
      <header className="voice-vibe-page__head">
        <button type="button" className="voice-vibe-page__back icon-btn" onClick={onBack} aria-label="Back to profile">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="voice-vibe-page__eyebrow">Profile</p>
          <h1>Let people hear your vibe</h1>
        </div>
      </header>

      <section className="voice-vibe-page__card voice-vibe-page__explain">
        <p className="voice-vibe-page__subtext">
          A short voice message helps people understand your personality.
        </p>
      </section>

      {recordingState !== "preview" ? (
        <section className="voice-vibe-page__card voice-vibe-page__inspiration">
          <VoiceVibeIdeasSection
            profile={profile}
            memberName={user.name}
            scriptDraft={scriptDraft}
            onScriptDraftChange={setScriptDraft}
            selectedIdeaId={selectedIdeaId}
            onSelectedIdeaIdChange={setSelectedIdeaId}
          />
        </section>
      ) : null}

      <section className="voice-vibe-page__card voice-vibe-page__studio">
        {!supported ? (
          <p className="voice-vibe-page__status" role="status">
            {USER_MESSAGES.voiceVibeUnsupported}
          </p>
        ) : null}

        {activeUrl && recordingState !== "preview" ? (
          <div className="voice-vibe-page__preview-card">
            <VoiceVibePlayer url={activeUrl} duration={activeDuration} variant="card" title="Voice Vibe" />
            <div className="voice-vibe-page__preview-actions">
              <button type="button" className="btn-secondary" onClick={() => void deleteVoiceVibe()} disabled={uploading}>
                <Trash2 size={16} />
                Delete
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  clearPreview();
                  setRecordingState("idle");
                  void startRecording();
                }}
                disabled={uploading || isRecording}
              >
                <RotateCcw size={16} />
                Re-record
              </button>
            </div>
          </div>
        ) : null}

        {recordingState === "preview" && previewUrl ? (
          <div className="voice-vibe-page__preview-card">
            <VoiceVibePlayer url={previewUrl} duration={previewDuration} variant="card" title="Voice Vibe" />
            <div className="voice-vibe-page__preview-actions">
              <button type="button" className="btn-secondary" onClick={clearPreview} disabled={uploading}>
                Discard
              </button>
              <button type="button" className="btn-primary" onClick={() => void saveVoiceVibe()} disabled={uploading}>
                {uploading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : null}

        {!activeUrl && recordingState !== "preview" ? (
          <div className="voice-vibe-page__recorder">
            <p className="voice-vibe-page__duration-hint">
              Recommended {RECOMMENDED_VOICE_MIN_SECONDS}–{RECOMMENDED_VOICE_MAX_SECONDS} seconds · max{" "}
              {MAX_VOICE_SECONDS}s
            </p>
            <div className={`voice-vibe-page__mic-wrap${recordingState === "recording" ? " voice-vibe-page__mic-wrap--pulse" : ""}`}>
              <button
                type="button"
                className={`voice-vibe-page__mic${isRecording ? " voice-vibe-page__mic--active" : ""}`}
                onClick={() => {
                  if (recordingState === "idle") void startRecording();
                  else if (recordingState === "recording") pauseRecording();
                  else if (recordingState === "paused") resumeRecording();
                }}
                aria-label={
                  recordingState === "recording"
                    ? "Pause recording"
                    : recordingState === "paused"
                      ? "Resume recording"
                      : "Start recording"
                }
              >
                {recordingState === "recording" ? <Pause size={28} /> : <Mic size={28} />}
              </button>
            </div>

            <VoiceVibeWaveform
              active={recordingState === "recording"}
              levels={waveLevels}
              bars={16}
              className="voice-vibe-page__live-wave"
            />

            <p className="voice-vibe-page__timer" aria-live="polite">
              {isRecording || recordingState === "idle" ? formatVoiceVibeTime(elapsed) : "Ready"}
            </p>

            <p className="voice-vibe-page__state-label">
              {recordingState === "idle" && "Tap the microphone to start"}
              {recordingState === "recording" && "Recording… tap to pause"}
              {recordingState === "paused" && "Paused — tap to resume"}
              {recordingState === "saved" && "Voice Vibe saved"}
            </p>

            {isRecording ? (
              <button type="button" className="btn-primary voice-vibe-page__stop" onClick={stopRecording}>
                Finish recording
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
