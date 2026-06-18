import { useEffect, useState } from "react";
import { BUTTON_COPY, MONETIZATION_COPY } from "../../constants/copy";
import { STORAGE_KEYS } from "../../constants/limits";
import type { DatingProfile, UserProfile } from "../../types";
import {
  changeUsernameRemote,
  checkUsernameRemote,
  fetchAccountStateRemote,
  pauseProfileRemote,
  restoreAccountRemote,
  softDeleteAccountRemote,
  submitSuccessStoryRemote,
  unpauseProfileRemote
} from "../../services/memberTrust";
import { syncMemberProfileRemote } from "../../services/cityHome";
import {
  USERNAME_CHANGE_COOLDOWN_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
  canChangeUsername,
  formatUsernameInput,
  isValidSignupUsername
} from "../../utils/authIdentity";
import { readJson, writeJson } from "../../utils/storage";
import { validateUserText } from "../../utils/contactGuard";
import { DeleteAccountModal } from "../DeleteAccountModal";

type ProfileAccountPanelProps = {
  user: UserProfile;
  profile: DatingProfile;
  isPremium: boolean;
  onProfileChange: (profile: DatingProfile) => void;
  onUsernameChange: (username: string) => void;
  onLogout: () => void;
  onMessage: (message: string, success?: boolean) => void;
};

export function ProfileAccountPanel({
  user,
  profile,
  isPremium,
  onProfileChange,
  onUsernameChange,
  onLogout,
  onMessage
}: ProfileAccountPanelProps) {
  const [usernameDraft, setUsernameDraft] = useState(user.username || "");
  const [usernameLastChangedAt, setUsernameLastChangedAt] = useState<string | null>(null);
  const [pausedAt, setPausedAt] = useState<string | null>(profile.profilePausedAt ?? null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successStory, setSuccessStory] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchAccountStateRemote(user).then((state: {
      usernameLastChangedAt?: string | null;
      profilePausedAt?: string | null;
      accountStatus?: string;
    } | null) => {
      if (!state) return;
      setUsernameLastChangedAt(state.usernameLastChangedAt ?? null);
      setPausedAt(state.profilePausedAt ?? profile.profilePausedAt ?? null);
      setDeletePending(state.accountStatus === "deleted_pending");
    });
  }, [user.email, user.phone, profile.profilePausedAt]);

  const saveUsername = async () => {
    const next = formatUsernameInput(usernameDraft);
    if (!isValidSignupUsername(next)) {
      onMessage("Username must be 4–20 characters (letters, numbers, underscore).");
      return;
    }
    const usernameLeak = validateUserText(next);
    if (usernameLeak) {
      onMessage(usernameLeak);
      return;
    }
    if (!canChangeUsername(usernameLastChangedAt, user.username, next)) {
      onMessage(USERNAME_CHANGE_COOLDOWN_MESSAGE);
      return;
    }
    setBusy(true);
    const check = await checkUsernameRemote(user, next);
    if (!check?.available) {
      setBusy(false);
      onMessage(check?.error || USERNAME_TAKEN_MESSAGE);
      return;
    }
    const ok = await changeUsernameRemote(user, next);
    setBusy(false);
    if (!ok) {
      onMessage("We couldn't update your username right now.");
      return;
    }
    onUsernameChange(next);
    setUsernameLastChangedAt(new Date().toISOString());
    onMessage("Username saved.", true);
  };

  const togglePause = async () => {
    setBusy(true);
    const ok = pausedAt ? await unpauseProfileRemote(user) : await pauseProfileRemote(user);
    setBusy(false);
    if (!ok) {
      onMessage("We couldn't update your profile right now.");
      return;
    }
    const nextPaused = pausedAt ? undefined : new Date().toISOString();
    setPausedAt(nextPaused ?? null);
    const nextProfile = { ...profile, profilePausedAt: nextPaused };
    onProfileChange(nextProfile);
    writeJson(STORAGE_KEYS.datingProfile, { ...nextProfile, premium: isPremium });
    void syncMemberProfileRemote({ ...user, username: user.username }, nextProfile);
    onMessage(
      pausedAt ? "Welcome back — you're visible again." : "Taking a break — hidden from Home and Discover.",
      true
    );
  };

  const scheduleDeletion = async () => {
    setBusy(true);
    const result = await softDeleteAccountRemote(user);
    setBusy(false);
    setDeleteModalOpen(false);
    if (!result?.ok) {
      onMessage("We couldn't start account deletion right now.");
      return;
    }
    onMessage("Your account has been scheduled for deletion.", true);
    onLogout();
  };

  const restoreAccount = async () => {
    setBusy(true);
    const ok = await restoreAccountRemote(user);
    setBusy(false);
    if (!ok) {
      onMessage("We couldn't restore your account right now.");
      return;
    }
    setDeletePending(false);
    onMessage("Welcome back — your account is restored.", true);
  };

  const submitStory = async () => {
    const storyLeak = validateUserText(successStory);
    if (storyLeak) {
      onMessage(storyLeak);
      return;
    }
    setBusy(true);
    const ok = await submitSuccessStoryRemote(user, successStory, true);
    setBusy(false);
    if (!ok) {
      onMessage("We couldn't save your story right now.");
      return;
    }
    setSuccessStory("");
    onMessage("Thank you — we'll review your story.", true);
  };

  if (deletePending) {
    return (
      <section className="account-settings-block">
        <p className="account-settings-hint">Your account is scheduled for deletion.</p>
        <button type="button" className="btn-primary btn-full" disabled={busy} onClick={() => void restoreAccount()}>
          Restore account
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="account-settings-block" aria-label="Username">
        <label className="profile-form-row profile-form-row--stack">
          <span className="profile-form-row__label">Username</span>
          <input
            className="profile-form-row__input"
            value={usernameDraft}
            onChange={(e) => setUsernameDraft(formatUsernameInput(e.target.value))}
            autoComplete="username"
            maxLength={20}
            placeholder="yourname"
          />
        </label>
        <button
          type="button"
          className="btn-primary btn-full account-settings-block__btn"
          disabled={busy}
          onClick={() => void saveUsername()}
        >
          {BUTTON_COPY.save}
        </button>
      </section>

      <section className="account-settings-block" aria-label="Profile visibility">
        <button
          type="button"
          className="account-settings-action"
          disabled={busy}
          onClick={() => void togglePause()}
        >
          {pausedAt ? "Unpause profile" : "Pause profile"}
        </button>
        {pausedAt ? (
          <p className="account-settings-hint">Hidden from Home and Discover. Your connections can still reach you.</p>
        ) : null}
      </section>

      <section className="account-settings-block" aria-label="Success story">
        <label className="profile-form-row profile-form-row--stack">
          <span className="profile-form-row__label">Share a success story</span>
          <textarea
            className="profile-form-row__textarea account-settings-textarea"
            value={successStory}
            onChange={(e) => setSuccessStory(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Optional — not public yet."
          />
        </label>
        <button
          type="button"
          className="btn-primary btn-full account-settings-block__btn"
          disabled={busy || successStory.trim().length < 20}
          onClick={() => void submitStory()}
        >
          Submit story
        </button>
      </section>

      <section className="account-settings-block account-settings-block--danger" aria-label="Danger zone">
        <h3 className="account-settings-block__heading">Danger Zone</h3>
        <button
          type="button"
          className="account-settings-action account-settings-action--danger"
          disabled={busy}
          onClick={() => setDeleteModalOpen(true)}
        >
          Permanently Delete Account
        </button>
        <p className="account-settings-hint">
          Your profile hides immediately. Permanent deletion happens within 30 days.
        </p>
      </section>

      {!isPremium ? <p className="account-settings-hint">{MONETIZATION_COPY.signalsExhaustedHint}</p> : null}

      <DeleteAccountModal
        open={deleteModalOpen}
        busy={busy}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => void scheduleDeletion()}
      />
    </>
  );
}
