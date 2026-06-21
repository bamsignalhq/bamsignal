import { MoreAboutMeChips } from "../moreAboutMe/MoreAboutMeChips";

type ProfileInterestsPreviewProps = {
  interests: string[];
  onMoreClick?: () => void;
  variant?: "default" | "premium";
};

export function ProfileInterestsPreview({
  interests,
  onMoreClick,
  variant = "default"
}: ProfileInterestsPreviewProps) {
  return (
    <MoreAboutMeChips
      items={interests}
      variant={variant === "premium" ? "profile" : "profile"}
      onMoreClick={onMoreClick}
    />
  );
}
