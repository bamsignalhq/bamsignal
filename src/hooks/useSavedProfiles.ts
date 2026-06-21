import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../constants/limits";
import {
  dispatchSavedProfilesChanged,
  REMOVED_PROFILE_TOAST,
  SAVED_PROFILE_TOAST,
  SAVED_PROFILES_CHANGED_EVENT,
  type SavedDiscoverProfile,
  type SavedProfileFilter,
  type SavedProfilesFutureConfig
} from "../constants/savedProfiles";
import {
  fetchSavedProfilesRemote,
  saveProfileRemote,
  unsaveProfileRemote
} from "../services/memberData";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import { readJson } from "../utils/storage";
import { hasVoiceVibe } from "../utils/voiceVibe";
import { isTrustedMember } from "../utils/trustedMember";
import {
  readSavedProfileEntries,
  readSavedProfileIds,
  writeSavedProfileEntries
} from "../utils/savedProfilesStorage";
import type { UserProfile } from "../types";

const RELATIONSHIP_FOCUSED_INTENTS = new Set([
  "SeriousRelationship",
  "Marriage",
  "Companionship"
]);

function normalizeCity(value = ""): string {
  return String(value).trim().toLowerCase();
}

export function filterSavedProfiles(
  profiles: SavedDiscoverProfile[],
  filter: SavedProfileFilter,
  viewerCity?: string
): SavedDiscoverProfile[] {
  if (filter === "all") return profiles;

  return profiles.filter((profile) => {
    switch (filter) {
      case "trusted":
        return isTrustedMember(profile);
      case "same-city":
        return Boolean(
          viewerCity &&
            profile.city &&
            normalizeCity(profile.city) === normalizeCity(viewerCity)
        );
      case "voice-vibe":
        return hasVoiceVibe(profile);
      case "relationship":
        return relationshipIntentsFrom(profile.intents).some((intent) =>
          RELATIONSHIP_FOCUSED_INTENTS.has(intent)
        );
      default:
        return true;
    }
  });
}

export function useSavedProfiles(options?: {
  viewerCity?: string;
  future?: SavedProfilesFutureConfig;
}) {
  void options?.future;
  const [savedIds, setSavedIds] = useState<string[]>(() => readSavedProfileIds());
  const [profiles, setProfiles] = useState<SavedDiscoverProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<SavedProfileFilter>("all");

  const syncIdsFromStorage = useCallback(() => {
    setSavedIds(readSavedProfileIds());
  }, []);

  useEffect(() => {
    const onChange = () => syncIdsFromStorage();
    window.addEventListener(SAVED_PROFILES_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(SAVED_PROFILES_CHANGED_EVENT, onChange);
  }, [syncIdsFromStorage]);

  const refreshProfiles = useCallback(async () => {
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, {
      name: "",
      email: "",
      phone: ""
    });
    if (!user.email && !user.phone) {
      setProfiles([]);
      return;
    }

    setLoading(true);
    try {
      const remote = await fetchSavedProfilesRemote(user);
      setProfiles(remote);
    } finally {
      setLoading(false);
    }
  }, []);

  const isSaved = useCallback(
    (profileId: string) => savedIds.includes(profileId),
    [savedIds]
  );

  const toggleSave = useCallback(
    async (profileId: string): Promise<{ saved: boolean; message: string }> => {
      const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, {
        name: "",
        email: "",
        phone: ""
      });
      const currentlySaved = readSavedProfileIds().includes(profileId);
      const entries = readSavedProfileEntries();
      const now = new Date().toISOString();

      if (currentlySaved) {
        const next = entries.filter((entry) => entry.profileId !== profileId);
        writeSavedProfileEntries(next);
        dispatchSavedProfilesChanged();
        void unsaveProfileRemote(user, profileId);
        setProfiles((current) => current.filter((profile) => profile.id !== profileId));
        return { saved: false, message: REMOVED_PROFILE_TOAST };
      }

      const next = [{ profileId, savedAt: now }, ...entries.filter((e) => e.profileId !== profileId)];
      writeSavedProfileEntries(next);
      dispatchSavedProfilesChanged();
      void saveProfileRemote(user, profileId);
      return { saved: true, message: SAVED_PROFILE_TOAST };
    },
    []
  );

  const filteredProfiles = useMemo(
    () => filterSavedProfiles(profiles, filter, options?.viewerCity),
    [profiles, filter, options?.viewerCity]
  );

  return {
    savedIds,
    profiles,
    filteredProfiles,
    loading,
    filter,
    setFilter,
    isSaved,
    toggleSave,
    refreshProfiles
  };
}
