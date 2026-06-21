import { CheckCircle2, Shield } from "lucide-react";
import type { UserProfile } from "../../types";
import { PhoneVerificationPanel } from "../PhoneVerificationPanel";
import {
  isTrustedMember,
  isTrustedMemberPending,
  markTrustedMemberCelebrationSeen,
  TRUSTED_MEMBER_BENEFITS,
  TRUSTED_MEMBER_PHOTO_TIPS,
  trustedMemberInitialStep,
  type TrustedMemberStep
} from "../../utils/trustedMember";
import { TrustedMemberConfetti } from "./TrustedMemberConfetti";
import { useState } from "react";

type TrustedMemberFlowProps = {
  user: UserProfile;
  phoneVerified: boolean;
  profilePhoto?: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  verificationSelfie?: string;
  verified: boolean;
  onPhoneVerified: (phone: string) => void;
  onSelfieSubmitted: (selfie: string) => void;
  onMessage?: (message: string) => void;
  onComplete?: () => void;
};

function TrustedMemberIllustration() {
  return (
    <div className="trusted-member-flow__illustration" aria-hidden>
      <span className="trusted-member-flow__shield-ring">
        <Shield size={42} />
      </span>
    </div>
  );
}

export function TrustedMemberFlow({
  user,
  phoneVerified,
  profilePhoto,
  verificationStatus = "none",
  verificationSelfie,
  verified,
  onPhoneVerified,
  onSelfieSubmitted,
  onMessage,
  onComplete
}: TrustedMemberFlowProps) {
  const trusted = isTrustedMember({ verified, verificationStatus });
  const pending = isTrustedMemberPending({ verified, verificationStatus, verificationSelfie });

  const [step, setStep] = useState<TrustedMemberStep>(() =>
    trustedMemberInitialStep({ verified, verificationStatus }, phoneVerified)
  );

  if (step === "celebration" && trusted) {
    return (
      <section className="trusted-member-flow trusted-member-flow--celebration">
        <TrustedMemberConfetti />
        <TrustedMemberIllustration />
        <h2 className="trusted-member-flow__title">You&apos;re now a Trusted Member 🎉</h2>
        <p className="trusted-member-flow__copy">
          People are more likely to connect with members they trust. Your verification photo remains private.
        </p>
        <ul className="trusted-member-flow__benefits">
          {TRUSTED_MEMBER_BENEFITS.map((item) => (
            <li key={item}>
              <CheckCircle2 size={16} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-primary btn-full"
          onClick={() => {
            markTrustedMemberCelebrationSeen();
            onComplete?.();
          }}
        >
          Continue
        </button>
      </section>
    );
  }

  if (step === "pending" || (pending && step !== "verify" && step !== "tips" && step !== "intro")) {
    return (
      <section className="trusted-member-flow trusted-member-flow--pending">
        <TrustedMemberIllustration />
        <h2 className="trusted-member-flow__title">Review in progress</h2>
        <p className="trusted-member-flow__copy">
          We&apos;re reviewing your photo privately. This usually takes a short while. We&apos;ll update your profile
          when you&apos;re approved.
        </p>
        <p className="trusted-member-flow__hint">Your verification photo remains private and is never shown publicly.</p>
      </section>
    );
  }

  if (step === "intro") {
    return (
      <section className="trusted-member-flow">
        <TrustedMemberIllustration />
        <h2 className="trusted-member-flow__title">Become a Trusted Member</h2>
        <p className="trusted-member-flow__copy">
          Members are more likely to respond to people they trust.
        </p>
        <p className="trusted-member-flow__hint">
          Your verification photo stays private and is only used for identity review.
        </p>
        <button type="button" className="btn-primary btn-full" onClick={() => setStep("tips")}>
          Continue
        </button>
      </section>
    );
  }

  if (step === "tips") {
    return (
      <section className="trusted-member-flow">
        <h2 className="trusted-member-flow__title">Photo tips</h2>
        <ul className="trusted-member-flow__tips">
          {TRUSTED_MEMBER_PHOTO_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="trusted-member-flow__hint">
          Your verification photo remains private and is never shown publicly.
        </p>
        <button type="button" className="btn-primary btn-full" onClick={() => setStep("verify")}>
          Take selfie
        </button>
      </section>
    );
  }

  return (
    <section className="trusted-member-flow trusted-member-flow--verify">
      <PhoneVerificationPanel
        user={user}
        phoneVerified={phoneVerified}
        profilePhoto={profilePhoto}
        verificationStatus={verificationStatus}
        onPhoneVerified={onPhoneVerified}
        onSelfieSubmitted={(selfie) => {
          onSelfieSubmitted(selfie);
          setStep("pending");
        }}
        onMessage={onMessage}
      />
    </section>
  );
}
