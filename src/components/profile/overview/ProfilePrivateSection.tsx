import { ChevronRight } from "lucide-react";
import { memo, useEffect } from "react";
import { navigateToPath } from "../../../constants/routes";
import { useSavedProfiles } from "../../../hooks/useSavedProfiles";

type ProfilePrivateSectionProps = {
  viewerCity?: string;
};

export const ProfilePrivateSection = memo(function ProfilePrivateSection({
  viewerCity
}: ProfilePrivateSectionProps) {
  const { profiles, refreshProfiles } = useSavedProfiles({ viewerCity });

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  return (
    <section className="profile-private-block" aria-label="Private">
      <p className="profile-private-block__divider">Private</p>
      <button type="button" className="profile-private-block__row" onClick={() => navigateToPath("/saved-profiles")}>
        <span className="profile-private-block__label">Saved Profiles</span>
        <span className="profile-private-block__meta">
          {profiles.length > 0 ? `${profiles.length}` : ""}
          <ChevronRight size={15} aria-hidden />
        </span>
      </button>
    </section>
  );
});
