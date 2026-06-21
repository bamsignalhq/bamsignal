import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_VOICE_SECONDS } from "../utils/voiceRecording";
import { formatVoiceVibeTime } from "../utils/voiceVibe";

export type VoiceVibePlayerState = "idle" | "loading" | "playing" | "paused" | "completed";

type UseVoiceVibePlayerOptions = {
  url: string;
  duration?: number;
  onStateChange?: (state: VoiceVibePlayerState) => void;
};

export function useVoiceVibePlayer({ url, duration: knownDuration, onStateChange }: UseVoiceVibePlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(knownDuration ?? 0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setCompleted(false);
    setLoading(true);
    if (knownDuration) setDuration(knownDuration);
  }, [url, knownDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => {
      const nextDuration = Math.min(audio.duration || knownDuration || 0, MAX_VOICE_SECONDS);
      if (nextDuration > 0) setDuration(nextDuration);
      setLoading(false);
    };
    const onTime = () => {
      const total = audio.duration || duration || knownDuration || MAX_VOICE_SECONDS;
      setCurrentTime(audio.currentTime);
      setProgress(total > 0 ? (audio.currentTime / total) * 100 : 0);
      if (audio.currentTime > 0) setCompleted(false);
    };
    const onLoadStart = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onEnded = () => {
      setPlaying(false);
      setCompleted(true);
      setProgress(100);
    };
    const onPause = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
    };
  }, [url, duration, knownDuration]);

  const state: VoiceVibePlayerState = useMemo(() => {
    if (loading) return "loading";
    if (completed) return "completed";
    if (playing) return "playing";
    if (currentTime > 0) return "paused";
    return "idle";
  }, [loading, completed, playing, currentTime]);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const displayDuration = duration || knownDuration || 0;

  const timeLabel = formatVoiceVibeTime(
    state === "playing" || state === "paused" ? currentTime : displayDuration
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || loading) return;

    if (completed) {
      audio.currentTime = 0;
      setCompleted(false);
      setProgress(0);
      setCurrentTime(0);
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [completed, loading, playing]);

  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || !displayDuration) return;
      const clamped = Math.min(1, Math.max(0, ratio));
      audio.currentTime = clamped * displayDuration;
      setCurrentTime(audio.currentTime);
      setProgress(clamped * 100);
      setCompleted(false);
    },
    [displayDuration]
  );

  return {
    audioRef,
    state,
    loading,
    playing,
    progress,
    currentTime,
    displayDuration,
    timeLabel,
    toggle,
    seek
  };
}
