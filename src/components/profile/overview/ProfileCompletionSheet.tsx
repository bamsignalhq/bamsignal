import { X } from "lucide-react";
import { ProfileCompletionProgress } from "../../member/ProfileCompletionProgress";
import type { ProfileStrengthImprovement } from "../../../utils/profileStrength";
import { formatUnlockLabels, resolveProfileMilestones } from "../../../utils/profileCompletionMilestones";

type ProfileCompletionSheetProps = {
  open: boolean;
  score: number;
  missing: ProfileStrengthImprovement[];
  onClose: () => void;
  onEdit?: () => void;
};

export function ProfileCompletionSheet({
  open,
  score,
  missing,
  onClose,
  onEdit
}: ProfileCompletionSheetProps) {
  if (!open) return null;

  return (
    <div className="profile-completion-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-completion-sheet-title">
      <button type="button" className="profile-completion-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="profile-completion-sheet__panel">
        <header className="profile-completion-sheet__head">
          <div>
            <ProfileCompletionProgress score={score} compact />
            <h2 id="profile-completion-sheet-title">Profile Complete</h2>
          </div>
          <button type="button" className="profile-completion-sheet__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {missing.length ? (
          <>
            <p className="profile-completion-sheet__eyebrow">Missing</p>
            <ul className="profile-completion-sheet__list">
              {missing.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="profile-completion-sheet__done">
            Your profile is in great shape —{" "}
            {formatUnlockLabels(
              (() => {
                const milestones = resolveProfileMilestones(score);
                return milestones[milestones.length - 1]?.unlocks ?? [];
              })()
            )}{" "}
            unlocked.
          </p>
        )}

        {onEdit ? (
          <button type="button" className="profile-completion-sheet__cta" onClick={onEdit}>
            Edit profile
          </button>
        ) : null}
      </div>
    </div>
  );
}
