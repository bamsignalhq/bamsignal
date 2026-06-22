import { LEGACY_ROLE_LABEL, LIFETIME_STEWARD_LABEL } from "../../../constants/legacyProfessionals";
import type { LegacyRoleViewModel } from "../../../utils/legacyProfessionalsLogic";

type LegacyRoleCardProps = {
  role: LegacyRoleViewModel;
};

export function LegacyRoleCard({ role }: LegacyRoleCardProps) {
  return (
    <article className="lgpr-role-card institute-glass">
      <header className="lgpr-role-card__head">
        <h3>{role.title}</h3>
        <span className="lgpr-role-card__badge">{LEGACY_ROLE_LABEL}</span>
      </header>

      <p className="lgpr-role-card__labels">{LIFETIME_STEWARD_LABEL} — multi-decade expertise honoured.</p>
      <p className="lgpr-role-card__description">{role.description}</p>
      <p className="lgpr-role-card__status">{role.statusLabel}</p>
    </article>
  );
}
