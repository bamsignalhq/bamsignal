import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  HOUSE_PRIVILEGES_LABEL
} from "../../../constants/houseMembership";
import type { HousePrivilegesCardViewModel } from "../../../utils/houseMembershipLogic";

type HousePrivilegesCardProps = {
  privileges: HousePrivilegesCardViewModel;
};

export function HousePrivilegesCard({ privileges }: HousePrivilegesCardProps) {
  return (
    <article className="hmem-privileges-card institute-glass">
      <header className="hmem-privileges-card__head">
        <h3>{privileges.title}</h3>
        <span className="hmem-privileges-card__badge">{HOUSE_PRIVILEGES_LABEL}</span>
      </header>
      <p className="hmem-privileges-card__level">{privileges.levelTitle}</p>
      <p className="hmem-privileges-card__description">{privileges.description}</p>
      <p className="hmem-privileges-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hmem-privileges-card__status">{privileges.statusLabel}</p>
    </article>
  );
}
