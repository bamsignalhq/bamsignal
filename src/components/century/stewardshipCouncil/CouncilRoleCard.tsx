import type { CouncilRoleCardViewModel } from "../../../types/stewardshipCouncil";

type CouncilRoleCardProps = {
  role: CouncilRoleCardViewModel;
};

export function CouncilRoleCard({ role }: CouncilRoleCardProps) {
  return (
    <article className="stc-role-card institute-glass">
      <header className="stc-role-card__head">
        <h3>{role.title}</h3>
        <span className="stc-role-card__badge">{role.roleLabel}</span>
      </header>
      <p className="stc-role-card__order">Role {role.roleOrder}</p>
      <p className="stc-role-card__description">{role.description}</p>
      <p className="stc-role-card__status">{role.statusLabel}</p>
    </article>
  );
}
