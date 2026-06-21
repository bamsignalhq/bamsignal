import { Loader2, Pause, Play } from "lucide-react";
import type { VoiceVibeFutureConfig, VoiceVibeWaveformCardVariant } from "../../constants/voiceVibeUi";
import {
  VOICE_VIBE_SUBTEXT,
  VOICE_VIBE_TITLE
} from "../../constants/voiceVibeUi";
import { useVoiceVibePlayer } from "../../hooks/useVoiceVibePlayer";
import { VoiceWaveform } from "./VoiceWaveform";

type VoiceVibeWaveformCardProps = {
  url: string;
  duration?: number;
  variant?: VoiceVibeWaveformCardVariant;
  title?: string;
  subtext?: string;
  className?: string;
  future?: VoiceVibeFutureConfig;
  onPlayStateChange?: (playing: boolean) => void;
};

export function VoiceVibeWaveformCard({
  url,
  duration,
  variant = "card",
  title = VOICE_VIBE_TITLE,
  subtext = VOICE_VIBE_SUBTEXT,
  className = "",
  future,
  onPlayStateChange
}: VoiceVibeWaveformCardProps) {
  void future;

  const { audioRef, state, playing, progress, timeLabel, toggle, seek } = useVoiceVibePlayer({
    url,
    duration,
    onStateChange: (next) => onPlayStateChange?.(next === "playing")
  });

  const isMini = variant === "mini";
  const isChip = variant === "chip";
  const isHero = variant === "hero";
  const bars = isMini ? 10 : isHero ? 14 : 18;

  const playLabel =
    state === "loading"
      ? "Loading Voice Vibe"
      : state === "playing"
        ? "Pause Voice Vibe"
        : state === "completed"
          ? "Replay Voice Vibe"
          : "Play Voice Vibe";

  if (isChip) {
    return (
      <span className={`voice-vibe-waveform-card voice-vibe-waveform-card--chip ${className}`.trim()}>
        🎙 Voice Vibe
      </span>
    );
  }

  return (
    <div
      className={`voice-vibe-waveform-card voice-vibe-waveform-card--${variant} ${className}`.trim()}
      onClick={isMini ? (event) => event.stopPropagation() : undefined}
      onKeyDown={isMini ? (event) => event.stopPropagation() : undefined}
    >
      {variant === "card" ? (
        <header className="voice-vibe-waveform-card__head">
          <h3>{title}</h3>
          <p>{subtext}</p>
        </header>
      ) : null}

      <div
        className="voice-vibe-waveform-card__controls"
        onClick={isMini ? () => toggle() : undefined}
        onKeyDown={
          isMini
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
        role={isMini ? "button" : undefined}
        tabIndex={isMini ? 0 : undefined}
        aria-label={isMini ? playLabel : undefined}
      >
        <button
          type="button"
          className={`voice-vibe-waveform-card__play${
            state === "playing" ? " voice-vibe-waveform-card__play--active" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          aria-label={playLabel}
          disabled={state === "loading"}
        >
          {state === "loading" ? (
            <Loader2 size={isMini || isHero ? 14 : 18} className="voice-vibe-waveform-card__spinner" />
          ) : state === "playing" ? (
            <Pause size={isMini || isHero ? 14 : 18} />
          ) : (
            <Play size={isMini || isHero ? 14 : 18} fill="currentColor" />
          )}
        </button>

        <VoiceWaveform
          active={playing}
          bars={bars}
          progress={progress}
          interactive={!isMini}
          onSeek={seek}
          className="voice-vibe-waveform-card__wave"
        />

        <span className="voice-vibe-waveform-card__time">{timeLabel}</span>
      </div>

      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  );
}
