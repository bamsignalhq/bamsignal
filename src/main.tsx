import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { PlansProvider } from "./context/PlansContext";
import "./styles.css";
import "./styles/experience.css";
import "./styles/signals.css";
import "./styles/signals-premium.css";
import "./styles/visual-home.css";
import "./styles/home-landing.css";
import "./styles/auth.css";
import "./styles/v6.css";
import "./styles/safety.css";
import "./styles/launch.css";
import "./styles/admin-console.css";
import "./styles/concierge-consultant.css";
import "./styles/discover-v2.css";
import "./styles/discover-premium.css";
import "./styles/discover-relationship.css";
import "./styles/discover-grid.css";
import "./styles/footer.css";
import "./styles/dashboard.css";
import "./styles/blog.css";
import "./styles/legal-pages.css";
import "./styles/profile-premium.css";
import "./styles/member-pages.css";
import "./styles/moment-pages.css";
import "./styles/theme-contrast.css";
import "./styles/premium-visibility.css";
import "./styles/compliance.css";
import "./styles/fintech-ui-cleanup.css";
import "./styles/member-fintech.css";
import "./styles/voice-vibe.css";
import "./styles/icebreakers.css";
import "./styles/empty-chat.css";
import "./styles/profile-strength.css";
import "./styles/profile-photo-progress.css";
import "./styles/build-profile-later.css";
import "./styles/trusted-member.css";
import "./styles/relationship-intent.css";
import "./styles/more-about-me.css";
import "./styles/activity-highlights.css";
import "./styles/common-ground.css";
import "./styles/smart-conversation.css";
import "./styles/saved-profiles.css";
import "./styles/signal-concierge.css";
import "./styles/consultant-portal.css";
import "./styles/signal-events.css";
import "./styles/bam-signal-foundation.css";
import "./styles/bam-signal-institute.css";
import "./styles/careers.css";
import "./styles/support-center.css";
import "./styles/audit-center.css";
import "./styles/institutional-compliance.css";
import "./styles/system-health.css";
import "./styles/notification-reliability.css";
import "./styles/document-center.css";
import "./styles/safety-center.css";
import "./styles/consultant-academy.css";
import "./styles/consultant-quality.css";
import "./styles/finance-operations.css";
import "./styles/internal-messaging.css";
import "./styles/executive-dashboard.css";
import "./styles/workforce-management.css";
import "./styles/institutional-governance.css";
import "./styles/business-continuity.css";
import "./styles/configuration-platform.css";
import "./styles/monitoring-center.css";
import "./styles/route-audit.css";
import "./styles/database-audit.css";
import "./styles/permissions-audit.css";
import "./styles/journey-integrity-audit.css";
import "./styles/launch-readiness.css";
import "./styles/remediation-board.css";
import "./styles/institutional-readiness.css";
import "./styles/data-integrity.css";
import "./styles/recovery-center.css";
import "./styles/seo.css";

import { checkBuildVersion, registerServiceWorker } from "./utils/serviceWorker";
import { repairMemberCaches } from "./utils/repairMemberCaches";
import { rememberSuccessfulRoute } from "./utils/crashRecovery";
import { clearStaleBootFlags } from "./utils/bootFlags";

clearStaleBootFlags();
repairMemberCaches();
checkBuildVersion();
registerServiceWorker();

if (typeof window !== "undefined") {
  const bootUrl = new URL(window.location.href);
  if (bootUrl.searchParams.has("recover")) {
    bootUrl.searchParams.delete("recover");
    window.history.replaceState(null, "", bootUrl.toString());
  }
}

window.addEventListener("popstate", () => rememberSuccessfulRoute());
rememberSuccessfulRoute();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <PlansProvider>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </PlansProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
