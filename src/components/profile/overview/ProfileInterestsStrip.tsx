import { memo, useMemo, useState } from "react";
import { formatMoreAboutMeChip } from "../../../constants/moreAboutMe";
import { normalizeMoreAboutMeInterests } from "../../../utils/moreAboutMe";
import { ProfileInterestsSheet } from "./ProfileInterestsSheet";

type ProfileInterestsStripProps = {
  interests: string[];
  previewCount?: number;
};

export const ProfileInterestsStrip = memo(function ProfileInterestsStrip({
  interests,
  previewCount = 8
}: ProfileInterestsStripProps) {
  const normalized = useMemo(() => normalizeMoreAboutMeInterests(interests), [interests]);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!normalized.length) return null;

  const visible = normalized.slice(0, previewCount);
  const hasMore = normalized.length > visible.length;

  return (
    <>
      <div className="profile-interests-strip" aria-label="Interests">
        <div className="profile-interests-strip__scroll">
          {visible.map((id) => (
            <span key={id} className="profile-interests-strip__chip">
              {formatMoreAboutMeChip(id)}
            </span>
          ))}
        </div>
        {hasMore ? (
          <button type="button" className="profile-interests-strip__more" onClick={() => setSheetOpen(true)}>
            View all →
          </button>
        ) : null}
      </div>
      <ProfileInterestsSheet
        open={sheetOpen}
        interests={normalized}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
});
