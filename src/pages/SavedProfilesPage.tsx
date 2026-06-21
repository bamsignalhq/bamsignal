import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import {
  SAVED_PROFILE_FILTERS,
  SAVED_PROFILES_EMPTY_HEADLINE,
  SAVED_PROFILES_EMPTY_SUBTEXT,
  SAVED_PROFILES_TITLE
} from "../constants/savedProfiles";
import { navigateToPath } from "../constants/routes";
import { SavedProfileCard } from "../components/savedProfiles/SavedProfileCard";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { useSavedProfiles } from "../hooks/useSavedProfiles";
import type { SavedDiscoverProfile } from "../constants/savedProfiles";
import type { UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "../utils/storage";
import { getVerificationTier } from "../utils/verification";

type SavedProfilesPageProps = {
  onBack?: () => void;
};

export function SavedProfilesPage({ onBack }: SavedProfilesPageProps) {
  const { profile: viewer } = useMemberProfileListener();
  const { filteredProfiles, loading, filter, setFilter, refreshProfiles, toggleSave } =
    useSavedProfiles({ viewerCity: viewer.city });
  const [selected, setSelected] = useState<SavedDiscoverProfile | null>(null);
  const [toast, setToast] = useState("");
  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, {
    name: "",
    email: "",
    phone: ""
  });
  const verification = getVerificationTier(viewer, false, Boolean(memberUser.phoneVerified));

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleRemove = async (profileId: string) => {
    const result = await toggleSave(profileId);
    showToast(result.message);
    if (selected?.id === profileId) setSelected(null);
  };

  return (
    <div className="page member-page saved-profiles-page">
      <header className="member-page-head member-page-head--minimal">
        <button
          type="button"
          className="saved-profiles-page__back"
          onClick={() => (onBack ? onBack() : navigateToPath("/profile"))}
        >
          Back
        </button>
        <h1>{SAVED_PROFILES_TITLE}</h1>
        <p className="saved-profiles-page__sub">Private — only you can see this list.</p>
      </header>

      {toast ? (
        <p className="saved-profiles-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div className="saved-profiles-page__filters" role="tablist" aria-label="Filter saved profiles">
        {SAVED_PROFILE_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`saved-profiles-page__filter${
              filter === item.id ? " saved-profiles-page__filter--active" : ""
            }`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && !filteredProfiles.length ? (
        <p className="saved-profiles-page__loading">Loading saved profiles…</p>
      ) : null}

      {!loading && !filteredProfiles.length ? (
        <div className="saved-profiles-empty">
          <div className="saved-profiles-empty__illustration" aria-hidden>
            <Bookmark size={34} strokeWidth={1.4} />
          </div>
          <h2>{SAVED_PROFILES_EMPTY_HEADLINE}</h2>
          <p>{SAVED_PROFILES_EMPTY_SUBTEXT}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigateToPath("/discover")}
          >
            Discover People
          </button>
        </div>
      ) : (
        <div className="saved-profiles-page__list">
          {filteredProfiles.map((profile, index) => (
            <SavedProfileCard
              key={profile.id}
              profile={profile}
              staggerIndex={index}
              onOpen={setSelected}
              onRemove={(profileId) => void handleRemove(profileId)}
            />
          ))}
        </div>
      )}

      {selected ? (
        <ProfileDetailSheet
          profile={selected}
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          verification={verification}
          viewer={memberUser}
        />
      ) : null}
    </div>
  );
}
