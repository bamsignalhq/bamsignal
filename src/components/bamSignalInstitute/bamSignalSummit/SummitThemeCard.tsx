import { BAMSIGNAL_SUMMIT_FORBIDDEN_COPY, SUMMIT_THEME_LABEL } from "../../../constants/bamSignalSummit";
import type { SummitThemeViewModel } from "../../../utils/bamSignalSummitLogic";

type SummitThemeCardProps = {
  theme: SummitThemeViewModel;
};

export function SummitThemeCard({ theme }: SummitThemeCardProps) {
  return (
    <article className="bsmt-theme-card institute-glass">
      <header className="bsmt-theme-card__head">
        <h3>{theme.title}</h3>
        <span className="bsmt-theme-card__badge">{SUMMIT_THEME_LABEL}</span>
      </header>
      <p className="bsmt-theme-card__description">{theme.description}</p>
      <p className="bsmt-theme-card__forbidden">
        Not {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsmt-theme-card__status">{theme.statusLabel}</p>
    </article>
  );
}
