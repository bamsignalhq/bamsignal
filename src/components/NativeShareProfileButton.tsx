import { Share2 } from "lucide-react";
import { isNativeApp } from "../native/platform";
import { shareNativeProfile } from "../native/share";
import { hapticLight } from "../utils/memberHaptics";

type NativeShareProfileButtonProps = {
  profileName: string;
  profileId?: string;
  className?: string;
};

export function NativeShareProfileButton({
  profileName,
  profileId,
  className = "settings-row"
}: NativeShareProfileButtonProps) {
  if (!isNativeApp()) return null;

  const onShare = () => {
    hapticLight();
    void shareNativeProfile(profileName, profileId);
  };

  return (
    <button type="button" className={className} onClick={onShare}>
      <Share2 size={20} aria-hidden />
      <span>Share profile</span>
    </button>
  );
}
