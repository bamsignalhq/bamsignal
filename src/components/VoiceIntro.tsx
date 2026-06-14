import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

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

type VoiceIntroRecorderProps = {
  url?: string;
  onRecorded: (dataUrl: string) => void;
  onClear: () => void;
};

export function VoiceIntroRecorder({ url, onRecorded, onClear }: VoiceIntroRecorderProps) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
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
      /* mic denied */
    }
  };

  const stop = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="voice-intro-recorder">
      <p className="voice-intro-recorder__hint">Record a 15-second intro — tap to play only when ready.</p>
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
