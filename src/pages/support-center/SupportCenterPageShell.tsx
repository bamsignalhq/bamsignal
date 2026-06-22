import { SupportCenterLayout } from "../../components/supportCenter/SupportCenterLayout";
import type { Theme } from "../../types";

export type SupportCenterPageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function SupportCenterPageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: SupportCenterPageShellProps) {
  return (
    <SupportCenterLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
    >
      {children}
    </SupportCenterLayout>
  );
}
