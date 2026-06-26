import { X } from "lucide-react";
import { formatMoreAboutMeChip } from "../../../constants/moreAboutMe";

type ProfileInterestsSheetProps = {
  open: boolean;
  interests: string[];
  onClose: () => void;
};

export function ProfileInterestsSheet({ open, interests, onClose }: ProfileInterestsSheetProps) {
  if (!open) return null;

  return (
    <div className="profile-interests-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-interests-title">
      <button type="button" className="profile-interests-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="profile-interests-sheet__panel">
        <header className="profile-interests-sheet__head">
          <h2 id="profile-interests-title">Interests</h2>
          <button type="button" className="profile-interests-sheet__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="profile-interests-sheet__grid">
          {interests.map((id) => (
            <span key={id} className="profile-interests-sheet__chip">
              {formatMoreAboutMeChip(id)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
