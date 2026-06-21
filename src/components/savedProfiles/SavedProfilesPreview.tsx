import { useEffect } from "react";
import { SAVED_PROFILES_TITLE } from "../../constants/savedProfiles";
import { navigateToPath } from "../../constants/routes";
import { useSavedProfiles } from "../../hooks/useSavedProfiles";
import { SavedProfileCard } from "./SavedProfileCard";

type SavedProfilesPreviewProps = {
  viewerCity?: string;
  className?: string;
  limit?: number;
};

export function SavedProfilesPreview({
  viewerCity,
  className = "",
  limit = 2
}: SavedProfilesPreviewProps) {
  const { profiles, refreshProfiles } = useSavedProfiles({ viewerCity });

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  const preview = profiles.slice(0, limit);

  return (
    <section className={`profile-page__saved-profiles card ${className}`.trim()}>
      <div className="profile-page__saved-profiles-head">
        <h2>{SAVED_PROFILES_TITLE}</h2>
        <button
          type="button"
          className="profile-page__saved-profiles-link"
          onClick={() => navigateToPath("/saved-profiles")}
        >
          {profiles.length ? "View all" : "Open"}
        </button>
      </div>

      {preview.length ? (
        <div className="profile-page__saved-profiles-preview">
          {preview.map((profile, index) => (
            <SavedProfileCard
              key={profile.id}
              profile={profile}
              staggerIndex={index}
              onOpen={() => navigateToPath("/saved-profiles")}
            />
          ))}
        </div>
      ) : (
        <p className="profile-page__saved-profiles-empty">
          Save profiles you want to revisit — only you can see them.
        </p>
      )}
    </section>
  );
}
