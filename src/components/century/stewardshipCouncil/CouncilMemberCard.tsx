import type { CouncilMemberCardViewModel } from "../../../types/stewardshipCouncil";

type CouncilMemberCardProps = {
  member: CouncilMemberCardViewModel;
};

export function CouncilMemberCard({ member }: CouncilMemberCardProps) {
  return (
    <article className="stc-member-card institute-glass">
      <header className="stc-member-card__head">
        <h3>{member.roleTitle}</h3>
        <span className="stc-member-card__badge">{member.seatLabel}</span>
      </header>
      <p className="stc-member-card__note">{member.stewardshipNote}</p>
      <p className="stc-member-card__status">{member.statusLabel}</p>
    </article>
  );
}
