import { SignalEventsLayout } from "../../components/signalEvents/SignalEventsLayout";
import type { Theme } from "../../types";

export type SignalEventsPageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function SignalEventsPageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: SignalEventsPageShellProps) {
  return (
    <SignalEventsLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
    >
      {children}
    </SignalEventsLayout>
  );
}
