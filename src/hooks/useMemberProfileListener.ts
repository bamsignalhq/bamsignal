import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { STORAGE_KEYS } from "../constants/limits";
import {
  MEMBER_PROFILE_UPDATED_EVENT,
  type MemberProfileSnapshot
} from "../services/memberProfileSync";
import { getDatingProfile, normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { readJson } from "../utils/storage";
import type { DatingProfile, MatchPreferences } from "../types";

export function useMemberProfileListener(): MemberProfileSnapshot & {
  setProfile: Dispatch<SetStateAction<DatingProfile>>;
  setPrefs: Dispatch<SetStateAction<MatchPreferences>>;
} {
  const [profile, setProfile] = useState<DatingProfile>(() => getDatingProfile());
  const [prefs, setPrefs] = useState<MatchPreferences>(() =>
    normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  );

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<Partial<MemberProfileSnapshot>>).detail;
      setProfile(normalizeDatingProfile(detail?.profile ?? getDatingProfile()));
      setPrefs(
        normalizeMatchPreferences(
          detail?.prefs ?? readJson(STORAGE_KEYS.matchPreferences, {})
        )
      );
    };
    window.addEventListener(MEMBER_PROFILE_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(MEMBER_PROFILE_UPDATED_EVENT, onUpdate);
  }, []);

  return { profile, prefs, setProfile, setPrefs };
}
