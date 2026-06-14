import { LockKeyhole, Sparkles } from "lucide-react";
import type { NavTab } from "../types";

const MESSAGES: Record<Exclude<NavTab, "home">, { title: string; body: string }> = {
  discover: {
    title: "Explore nearby signals",
    body: "Join free to discover verified people and send signals around you."
  },
  likes: {
    title: "Incoming signals",
    body: "Create your account to see who signaled you."
  },
  chats: {
    title: "Start real conversations",
    body: "Join free to chat safely inside BamSignal after a signal is accepted."
  },
  me: {
    title: "Your BamSignal profile",
    body: "Sign up to build your profile, verify, and manage your account."
  }
};

type GuestGateProps = {
  tab: Exclude<NavTab, "home">;
  onJoin: () => void;
  onLogin: () => void;
};

export function GuestGate({ tab, onJoin, onLogin }: GuestGateProps) {
  const copy = MESSAGES[tab];
  return (
    <div className="page guest-gate-page">
      <div className="guest-gate-card">
        <span className="guest-gate-icon">
          <LockKeyhole size={28} />
        </span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <button type="button" className="btn-primary btn-full" onClick={onJoin}>
          <Sparkles size={18} /> Join Free
        </button>
        <button type="button" className="link-btn guest-gate-login" onClick={onLogin}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
