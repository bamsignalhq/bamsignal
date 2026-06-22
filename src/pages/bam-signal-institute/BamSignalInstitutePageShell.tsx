import { BamSignalInstituteLayout } from "../../components/bamSignalInstitute/BamSignalInstituteLayout";
import type { Theme } from "../../types";

export type BamSignalInstitutePageShellProps = {
  children: React.ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin?: () => void;
};

export function BamSignalInstitutePageShell({
  children,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin
}: BamSignalInstitutePageShellProps) {
  return (
    <BamSignalInstituteLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogoClick={onLogoClick}
      onLogin={onLogin}
    >
      {children}
    </BamSignalInstituteLayout>
  );
}
