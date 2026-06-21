import { TrustedMemberFlow } from "../components/trusted/TrustedMemberFlow";
import { navigateToPath } from "../constants/routes";
import type { DatingProfile, UserProfile } from "../types";
import { resolveProfileMainPhoto } from "../utils/mainPhoto";
import { isTrustedMember } from "../utils/trustedMember";
import { useState } from "react";

type TrustedMemberPageProps = {
  user: UserProfile;
  profile: DatingProfile;
  phoneVerified: boolean;
  onProfileChange: (profile: DatingProfile) => void;
  onUserChange: (user: UserProfile) => void;
  onBack?: () => void;
};

export function TrustedMemberPage({
  user,
  profile,
  phoneVerified,
  onProfileChange,
  onUserChange,
  onBack
}: TrustedMemberPageProps) {
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  return (
    <div className="page member-page trusted-member-page">
      <header className="member-page-head member-page-head--minimal">
        <button
          type="button"
          className="trusted-member-page__back"
          onClick={() => (onBack ? onBack() : navigateToPath("/profile"))}
        >
          Back
        </button>
        <h1>Trusted Member</h1>
      </header>

      {toast ? <p className="profile-mod-toast" role="status">{toast}</p> : null}

      <TrustedMemberFlow
        user={user}
        phoneVerified={phoneVerified}
        profilePhoto={resolveProfileMainPhoto(profile) || undefined}
        verificationStatus={
          isTrustedMember(profile)
            ? "approved"
            : profile.verificationStatus || "none"
        }
        verified={profile.verified}
        verificationSelfie={profile.verificationSelfie}
        onPhoneVerified={(phone) => {
          onUserChange({ ...user, phone, phoneVerified: true });
        }}
        onSelfieSubmitted={(verificationSelfie) => {
          onProfileChange({
            ...profile,
            verificationSelfie,
            verificationStatus: "pending"
          });
        }}
        onMessage={showToast}
        onComplete={() => navigateToPath("/profile")}
      />
    </div>
  );
}
