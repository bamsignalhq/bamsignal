import { CareersLayout } from "../../components/careers/CareersLayout";
import "../../styles/entry-careers.css";
import type { Theme } from "../../types";

export type CareersPageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function CareersPageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: CareersPageShellProps) {
  return (
    <CareersLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
    >
      {children}
    </CareersLayout>
  );
}
