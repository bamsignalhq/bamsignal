import { useEffect, useState } from "react";
import { fetchDiscoverProfiles } from "../services/discoverProfiles";
import type { DatingProfile, DiscoverProfile, UserProfile } from "../types";
import { getMemberCity } from "../utils/memberCity";
import { rankEmptyChatProfiles } from "../utils/rankEmptyChatProfiles";
import { isUserBlocked } from "../utils/safety";

export function useSuggestedChatProfiles(
  user: Pick<UserProfile, "email" | "phone">,
  viewer: DatingProfile,
  enabled = true
) {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const city = getMemberCity() || viewer.city?.trim() || "Lagos";

    void fetchDiscoverProfiles(user, city, []).then((raw) => {
      if (cancelled) return;
      const visible = raw.filter((profile) => !isUserBlocked(profile.id));
      const ranked = rankEmptyChatProfiles(visible, viewer, 10);
      setProfiles(ranked);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, user.email, user.phone, viewer.city]);

  return { profiles, loading };
}
