import type { MouseEvent } from "react";

type VoiceWaveformProps = {
  active?: boolean;
  bars?: number;
  levels?: number[];
  progress?: number;
  interactive?: boolean;
  onSeek?: (ratio: number) => void;
  className?: string;
};

export function VoiceWaveform({
  active = false,
  bars = 16,
  levels,
  progress = 0,
  interactive = false,
  onSeek,
  className = ""
}: VoiceWaveformProps) {
  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSeek) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(ratio);
  };

  return (
    <div
      className={`voice-waveform ${active ? "voice-waveform--active" : ""} ${
        interactive ? "voice-waveform--interactive" : ""
      } ${className}`.trim()}
      onClick={interactive ? handleSeek : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (!onSeek) return;
              if (event.key === "ArrowRight") onSeek(Math.min(1, progress / 100 + 0.05));
              if (event.key === "ArrowLeft") onSeek(Math.max(0, progress / 100 - 0.05));
            }
          : undefined
      }
      role={interactive ? "slider" : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? Math.round(progress) : undefined}
      aria-label={interactive ? "Voice Vibe progress" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {Array.from({ length: bars }).map((_, index) => {
        const level = levels?.[index];
        const height =
          level != null ? `${Math.max(18, Math.min(100, level * 100))}%` : `${28 + ((index * 11) % 58)}%`;
        const barProgress = ((index + 1) / bars) * 100;
        const played = barProgress <= progress;
        return (
          <span
            key={index}
            className={`voice-waveform__bar${played ? " voice-waveform__bar--played" : ""}`}
            style={{
              height,
              animationDelay: `${index * 0.05}s`
            }}
          />
        );
      })}
      <span className="voice-waveform__progress-line" style={{ width: `${progress}%` }} aria-hidden />
    </div>
  );
}

/** @deprecated use VoiceWaveform */
export const VoiceVibeWaveform = VoiceWaveform;
