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
import "./styles/discover-v2.css";
import "./styles/discover-premium.css";
import "./styles/discover-relationship.css";
import "./styles/discover-grid.css";
import "./styles/footer.css";
import "./styles/dashboard.css";
import "./styles/profile-premium.css";
import "./styles/member-pages.css";
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
import "./styles/member-nudges.css";
import "./styles/profile-fintech-overview.css";
import "./styles/member-design-system.css";
import "./styles/member-motion.css";
import "./styles/relationship-intent.css";
import "./styles/more-about-me.css";
import "./styles/activity-highlights.css";
import "./styles/common-ground.css";
import "./styles/smart-conversation.css";
import "./styles/saved-profiles.css";

import { checkBuildVersion, registerServiceWorker } from "./utils/serviceWorker";
import { repairMemberCaches } from "./utils/repairMemberCaches";
import { rememberSuccessfulRoute } from "./utils/crashRecovery";
import { clearStaleBootFlags } from "./utils/bootFlags";
import { isDebugRecursionEnabled, logStackOverflowCrash } from "./utils/debugRecursion";

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

if (typeof window !== "undefined" && isDebugRecursionEnabled()) {
  window.addEventListener("error", (event) => {
    if (event.error instanceof Error) {
      logStackOverflowCrash({ component: "window.onerror", error: event.error });
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason instanceof Error) {
      logStackOverflowCrash({ component: "unhandledrejection", error: event.reason });
    }
  });
  let lastPath = window.location.pathname;
  const logPathChange = () => {
    const next = window.location.pathname;
    if (next !== lastPath) {
      console.info("[debug-pathname]", { from: lastPath, to: next });
      lastPath = next;
    }
  };
  window.addEventListener("popstate", logPathChange);
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = (...args) => {
    originalPushState(...args);
    logPathChange();
  };
  window.history.replaceState = (...args) => {
    originalReplaceState(...args);
    logPathChange();
  };
}

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
