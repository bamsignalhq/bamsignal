import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { moderateVoiceIntroTranscript } from "../utils/mediaModeration";

type VoiceIntroProps = {
  url?: string;
  label?: string;
};

export function VoiceIntro({ url, label = "Voice Intro" }: VoiceIntroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

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
      <button type="button" className="voice-intro__btn" onClick={toggle} aria-label={label}>
        {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        <span>{label}</span>
      </button>
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onEnded={() => setPlaying(false)}
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
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");

  const start = async () => {
    try {
      transcriptRef.current = "";
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
      timerRef.current = window.setTimeout(() => stop(), 15000);
    } catch {
      onRejected?.("Microphone access is required to record a voice intro.");
    }
  };

  const stop = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="voice-intro-recorder">
      <p className="voice-intro-recorder__hint">
        Record a 15-second intro — no phone numbers, WhatsApp, Telegram, or Facebook handles.
      </p>
      {url ? (
        <div className="voice-intro-recorder__row">
          <VoiceIntro url={url} />
          <button type="button" className="link-btn" onClick={onClear}>
            Re-record
          </button>
        </div>
      ) : (
        <button type="button" className="btn-secondary" onClick={recording ? stop : start}>
          {recording ? "Stop recording" : "Record voice intro"}
        </button>
      )}
    </div>
  );
}
