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

type ProfileAccountPanelProps = {
  user: UserProfile;
  profile: DatingProfile;
  isPremium: boolean;
  onProfileChange: (profile: DatingProfile) => void;
  onUsernameChange: (username: string) => void;
  onLogout: () => void;
  onMessage: (message: string) => void;
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
    onMessage("Username saved.");
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
    onMessage(pausedAt ? "Welcome back — you're visible again." : "Taking a break ❤️ Your connections can still reach you.");
  };

  const requestDelete = async () => {
    if (!window.confirm("Your profile will be hidden for 30 days. You can restore by logging in.")) return;
    setBusy(true);
    const result = await softDeleteAccountRemote(user);
    setBusy(false);
    if (!result?.ok) {
      onMessage("We couldn't start account deletion right now.");
      return;
    }
    setDeletePending(true);
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
    onMessage("Welcome back — your account is restored.");
  };

  const submitStory = async () => {
    setBusy(true);
    const ok = await submitSuccessStoryRemote(user, successStory, true);
    setBusy(false);
    if (!ok) {
      onMessage("We couldn't save your story right now.");
      return;
    }
    setSuccessStory("");
    onMessage("Thank you — we'll review your story.");
  };

  if (deletePending) {
    return (
      <section className="card settings-card settings-card--quiet">
        <p className="profile-overview-empty">Your account is scheduled for deletion.</p>
        <button type="button" className="btn-primary btn-full" disabled={busy} onClick={() => void restoreAccount()}>
          Restore Account
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="card settings-card">
        <label className="settings-field">
          <span>Username</span>
          <input
            value={usernameDraft}
            onChange={(e) => setUsernameDraft(formatUsernameInput(e.target.value))}
            autoComplete="username"
            maxLength={20}
          />
        </label>
        <button type="button" className="btn-secondary btn-full" disabled={busy} onClick={() => void saveUsername()}>
          {BUTTON_COPY.save}
        </button>
      </section>

      <section className="card settings-card">
        <button type="button" className="settings-row" disabled={busy} onClick={() => void togglePause()}>
          <span>{pausedAt ? "Unpause profile" : "Pause profile"}</span>
        </button>
        {pausedAt ? (
          <p className="profile-overview-empty">Taking a break ❤️ — hidden from Home and Discover.</p>
        ) : null}
      </section>

      <section className="card settings-card settings-card--quiet">
        <p className="settings-field-label">Share a success story</p>
        <textarea
          value={successStory}
          onChange={(e) => setSuccessStory(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Optional — not public yet."
        />
        <button type="button" className="btn-secondary btn-full" disabled={busy || successStory.trim().length < 20} onClick={() => void submitStory()}>
          Submit story
        </button>
      </section>

      <section className="card settings-card">
        <button type="button" className="settings-row settings-row--danger" disabled={busy} onClick={() => void requestDelete()}>
          Delete account
        </button>
        <p className="profile-overview-empty">
          Your profile hides immediately. Restore within 30 days by logging in.
        </p>
      </section>

      {!isPremium ? (
        <p className="profile-overview-empty">{MONETIZATION_COPY.signalsExhaustedHint}</p>
      ) : null}
    </>
  );
}
