import type { ReactNode } from "react";
import { ConciergeShell } from "../../components/concierge/ConciergeShell";
import { ConciergeLandingPage } from "../../components/concierge/ConciergeLandingPage";
import { ConciergeAuthPage, type ConciergeAuthView } from "../../components/concierge/ConciergeAuthPage";
import { SignalConciergeApplicationPage } from "../signal-concierge/SignalConciergeApplicationPage";
import { SignalConciergeDashboardPage } from "../signal-concierge/SignalConciergeDashboardPage";
import { SignalConciergeStatusPage } from "../signal-concierge/SignalConciergeStatusPage";
import { SignalConciergePrivacyPage } from "../signal-concierge/SignalConciergePrivacyPage";
import { SignalConciergeFaqPage } from "../signal-concierge/SignalConciergeFaqPage";
import {
  SIGNAL_CONCIERGE_BENEFITS,
  SIGNAL_CONCIERGE_LANDING_SUBTEXT,
  SIGNAL_CONCIERGE_PRICING_BODY,
  SIGNAL_CONCIERGE_PRICING_NOTE
} from "../../constants/signalConcierge";
import { CONCIERGE_ROUTES } from "../../constants/conciergeRoutes";
import { navigateToPath } from "../../constants/routes";
import { resolveSwitchPath, selectWorkspace } from "../../workspaces";
import type { AuthMeta, Theme, UserProfile } from "../../types";
import "../../styles/entry-signal-concierge.css";
import "../../styles/concierge-experience.css";

type ShellBase = {
  theme: Theme;
  onToggleTheme: () => void;
  isAuthed?: boolean;
  breadcrumb?: string;
};

function withShell(
  props: ShellBase,
  children: ReactNode,
  extras?: { showDashboardLink?: boolean; showStatusLink?: boolean }
) {
  return (
    <ConciergeShell
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      isAuthed={props.isAuthed}
      breadcrumb={props.breadcrumb}
      showDashboardLink={extras?.showDashboardLink ?? Boolean(props.isAuthed)}
      showStatusLink={extras?.showStatusLink ?? Boolean(props.isAuthed)}
    >
      {children}
    </ConciergeShell>
  );
}

export function ConciergeHomePage(props: ShellBase) {
  return withShell(props, <ConciergeLandingPage />);
}

export function ConciergeAuthRoutePage(
  props: ShellBase & {
    view: ConciergeAuthView;
    onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void | Promise<void>;
    message?: string;
    onMessage: (msg: string) => void;
  }
) {
  return (
    <ConciergeAuthPage
      view={props.view}
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onAuthenticated={props.onAuthenticated}
      message={props.message}
      onMessage={props.onMessage}
    />
  );
}

export function ConciergeOnboardingPage(props: ShellBase) {
  return withShell(
    { ...props, breadcrumb: "Onboarding" },
    <SignalConciergeApplicationPage
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
      onLogin={props.isAuthed ? undefined : () => navigateToPath(CONCIERGE_ROUTES.login)}
      showDashboardLink
    />
  );
}

export function ConciergeDashboardRoutePage(props: ShellBase) {
  return withShell(
    { ...props, breadcrumb: "Dashboard" },
    <SignalConciergeDashboardPage
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
    />
  );
}

export function ConciergeStatusRoutePage(props: ShellBase) {
  return withShell(
    { ...props, breadcrumb: "Application status" },
    <SignalConciergeStatusPage
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
    />
  );
}

export function ConciergePrivacyRoutePage(props: ShellBase) {
  return (
    <SignalConciergePrivacyPage
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
      onLogin={() => navigateToPath(CONCIERGE_ROUTES.login)}
    />
  );
}

export function ConciergeFaqRoutePage(props: ShellBase) {
  return (
    <SignalConciergeFaqPage
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
      onLogin={() => navigateToPath(CONCIERGE_ROUTES.login)}
    />
  );
}

function ConciergeContentPage({
  props,
  title,
  lede,
  children
}: {
  props: ShellBase;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return withShell(
    props,
    <section className="sc-section concierge-content" aria-labelledby="concierge-content-title">
      <p className="sc-section__eyebrow">Signal Concierge™</p>
      <h1 id="concierge-content-title" className="sc-section__title">
        {title}
      </h1>
      <p className="sc-section__lead">{lede}</p>
      {children}
      <div className="sc-advisory-hero__actions" style={{ marginTop: 24 }}>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={() => navigateToPath(CONCIERGE_ROUTES.signup)}
        >
          Become a Concierge
        </button>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--ghost"
          onClick={() => navigateToPath(CONCIERGE_ROUTES.login)}
        >
          Sign In
        </button>
      </div>
    </section>
  );
}

export function ConciergeAboutPage(props: ShellBase) {
  return (
    <ConciergeContentPage
      props={props}
      title="About Concierge"
      lede={SIGNAL_CONCIERGE_LANDING_SUBTEXT}
    >
      <p className="sc-section__lead">
        Signal Concierge™ is BamSignal&apos;s private relationship advisory — consultant-led,
        application-based, and never a public Discover feed.
      </p>
    </ConciergeContentPage>
  );
}

export function ConciergeBenefitsPage(props: ShellBase) {
  return (
    <ConciergeContentPage props={props} title="Benefits" lede="What Concierge clients receive.">
      <ul className="sc-benefit-grid">
        {SIGNAL_CONCIERGE_BENEFITS.map((item) => (
          <li key={item} className="sc-benefit-card signal-concierge-glass">
            <p className="sc-benefit-card__body">{item}</p>
          </li>
        ))}
      </ul>
    </ConciergeContentPage>
  );
}

export function ConciergePricingPage(props: ShellBase) {
  return (
    <ConciergeContentPage props={props} title="Pricing" lede={SIGNAL_CONCIERGE_PRICING_BODY}>
      <p className="sc-section__note">{SIGNAL_CONCIERGE_PRICING_NOTE}</p>
    </ConciergeContentPage>
  );
}

/** Member shell helper: switch into Concierge without logout. */
export function switchToConciergeExperience(): void {
  selectWorkspace("concierge", { setPreferred: true });
  navigateToPath(resolveSwitchPath("concierge"));
}
