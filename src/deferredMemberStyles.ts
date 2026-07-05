/** Member-only styles — loaded after public landing paint or member app entry. */
import "./styles/signals.css";
import "./styles/signals-premium.css";
import "./styles/discover-v2.css";
import "./styles/discover-premium.css";
import "./styles/discover-relationship.css";
import "./styles/discover-grid.css";
import "./styles/dashboard.css";
import "./styles/profile-premium.css";
import "./styles/member-pages.css";
import "./styles/fintech-ui-cleanup.css";
import "./styles/member-fintech.css";
import "./styles/voice-vibe.css";
import "./styles/icebreakers.css";
import "./styles/empty-chat.css";
import "./styles/profile-strength.css";
import "./styles/profile-photo-progress.css";
import "./styles/build-profile-later.css";
import "./styles/trusted-member.css";
import "./styles/member-nudges.css";
import "./styles/profile-fintech-overview.css";
import "./styles/member-design-system.css";
import "./styles/member-motion.css";
import "./styles/member-ux-kit.css";
import "./styles/relationship-intent.css";
import "./styles/more-about-me.css";
import "./styles/activity-highlights.css";
import "./styles/common-ground.css";
import "./styles/smart-conversation.css";
import "./styles/saved-profiles.css";

let loadPromise: Promise<void> | null = null;

export function loadDeferredMemberStyles(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.resolve();
  }
  return loadPromise;
}
