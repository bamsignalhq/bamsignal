import { ACADEMY_TRACK_LABELS } from "../../../constants/consultantAcademy";
import type { AcademyTrackId } from "../../../constants/consultantAcademy";

type AcademyTrackCardProps = {
  trackId: AcademyTrackId;
  hint: string;
  consultantCount: number;
  active?: boolean;
  onSelect?: () => void;
};

export function AcademyTrackCard({
  trackId,
  hint,
  consultantCount,
  active = false,
  onSelect
}: AcademyTrackCardProps) {
  return (
    <button
      type="button"
      className={`academy-track-card${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <p className="academy-track-card__eyebrow">Training track</p>
      <h3>{ACADEMY_TRACK_LABELS[trackId]}</h3>
      <p>{hint}</p>
      <span>{consultantCount} consultants</span>
    </button>
  );
}
