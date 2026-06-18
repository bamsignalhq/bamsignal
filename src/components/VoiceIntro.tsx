import { Pause, Play, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { moderateVoiceIntroTranscript } from "../utils/mediaModeration";

const MIN_VOICE_SECONDS = 3;
const MAX_VOICE_SECONDS = 20;

type VoiceIntroProps = {
  url?: string;
  label?: string;
  showBadge?: boolean;
};

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.min(MAX_VOICE_SECONDS, Math.floor(seconds)));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return mins > 0 ? `${mins}:${rem.toString().padStart(2, "0")}` : `0:${rem.toString().padStart(2, "0")}`;
}

export function VoiceIntro({ url, label = "Voice Intro", showBadge = false }: VoiceIntroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => setDuration(Math.min(audio.duration || 0, MAX_VOICE_SECONDS));
    const onTime = () => {
      const d = audio.duration || MAX_VOICE_SECONDS;
      setProgress((audio.currentTime / d) * 100);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [url]);

  if (!url) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  return (
    <div className="voice-intro">
      {showBadge && <span className="voice-intro__badge">Voice intro</span>}
      <button type="button" className="voice-intro__btn" onClick={toggle} aria-label={label}>
        {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        <span className="voice-intro__wave" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`voice-intro__bar ${playing ? "voice-intro__bar--active" : ""}`}
              style={{ height: `${30 + ((i * 7) % 50)}%`, animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </span>
        <span>{label}</span>
        <span className="voice-intro__time">{formatDuration(duration || MAX_VOICE_SECONDS)}</span>
      </button>
      <div className="voice-intro__progress" aria-hidden>
        <div style={{ width: `${progress}%` }} />
      </div>
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

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

type VoiceIntroRecorderProps = {
  url?: string;
  onRecorded: (dataUrl: string) => void;
  onClear: () => void;
  onRejected?: (message: string) => void;
};

export function VoiceIntroRecorder({ url, onRecorded, onClear, onRejected }: VoiceIntroRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");

  const start = async () => {
    try {
      transcriptRef.current = "";
      elapsedRef.current = 0;
      setElapsed(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        recognitionRef.current?.stop();
        recognitionRef.current = null;
        stream.getTracks().forEach((t) => t.stop());
        if (tickRef.current) window.clearInterval(tickRef.current);

        const secondsRecorded = elapsedRef.current;
        if (secondsRecorded < MIN_VOICE_SECONDS) {
          onRejected?.("Voice intro is too short.");
          return;
        }
        if (secondsRecorded > MAX_VOICE_SECONDS) {
          onRejected?.("Voice intro can be up to 20 seconds.");
          return;
        }

        const transcript = transcriptRef.current.trim();
        if (transcript) {
          const verdict = moderateVoiceIntroTranscript(transcript);
          if (!verdict.allowed) {
            onRejected?.(verdict.message);
            return;
          }
        }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => onRecorded(String(reader.result || ""));
        reader.readAsDataURL(blob);
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      tickRef.current = window.setInterval(() => {
        elapsedRef.current = Math.min(MAX_VOICE_SECONDS, elapsedRef.current + 1);
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_VOICE_SECONDS) stop();
      }, 1000);
      timerRef.current = window.setTimeout(() => stop(), MAX_VOICE_SECONDS * 1000);
    } catch {
      onRejected?.("Microphone access is required to record a voice intro.");
    }
  };

  const stop = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="voice-intro-recorder">
      <p className="voice-intro-recorder__hint">Record your voice introduction</p>
      {url ? (
        <div className="voice-intro-recorder__row">
          <VoiceIntro url={url} />
          <button type="button" className="link-btn" onClick={onClear} aria-label="Delete voice intro">
            <Trash2 size={16} />
            Delete
          </button>
          <button type="button" className="link-btn" onClick={onClear}>
            Re-record
          </button>
        </div>
      ) : (
        <div className="voice-intro-recorder__controls">
          <button type="button" className="btn-secondary" onClick={recording ? stop : start}>
            {recording ? `Stop · ${formatDuration(elapsed)}` : "Record voice intro"}
          </button>
          {recording && (
            <span className="voice-intro-recorder__live" aria-live="polite">
              Recording… max {MAX_VOICE_SECONDS}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}
