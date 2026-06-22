import { BamSignalFoundationLayout } from "../../components/bamSignalFoundation/BamSignalFoundationLayout";
import type { Theme } from "../../types";

export type BamSignalFoundationPageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function BamSignalFoundationPageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: BamSignalFoundationPageShellProps) {
  return (
    <BamSignalFoundationLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
    >
      {children}
    </BamSignalFoundationLayout>
  );
}
