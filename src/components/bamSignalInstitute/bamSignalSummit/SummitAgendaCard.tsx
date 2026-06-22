import { BAMSIGNAL_SUMMIT_FORBIDDEN_COPY, SUMMIT_AGENDA_LABEL } from "../../../constants/bamSignalSummit";
import type { SummitAgendaViewModel } from "../../../utils/bamSignalSummitLogic";

type SummitAgendaCardProps = {
  agenda: SummitAgendaViewModel;
};

export function SummitAgendaCard({ agenda }: SummitAgendaCardProps) {
  return (
    <article className="bsmt-agenda-card institute-glass">
      <header className="bsmt-agenda-card__head">
        <h3>{agenda.title}</h3>
        <span className="bsmt-agenda-card__badge">{SUMMIT_AGENDA_LABEL}</span>
      </header>
      <p className="bsmt-agenda-card__theme">{agenda.themeTitle}</p>
      <p className="bsmt-agenda-card__experience">{agenda.experienceTitle}</p>
      <p className="bsmt-agenda-card__summary">{agenda.summary}</p>
      <p className="bsmt-agenda-card__forbidden">
        Not {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsmt-agenda-card__status">{agenda.statusLabel}</p>
    </article>
  );
}
