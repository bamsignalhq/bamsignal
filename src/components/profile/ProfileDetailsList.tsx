import { getFilledProfileDetails } from "../../utils/profileDetails";
import type { DatingProfile, DiscoverProfile } from "../../types";

type ProfileDetailsListProps = {
  profile: Pick<
    DatingProfile | DiscoverProfile,
    "ethnicity" | "religion" | "occupation" | "stateOfOrigin" | "genotype" | "kidsPreference"
  >;
  className?: string;
  variant?: "list" | "chips";
};

export function ProfileDetailsList({
  profile,
  className = "",
  variant = "list"
}: ProfileDetailsListProps) {
  const rows = getFilledProfileDetails(profile);
  if (!rows.length) return null;

  if (variant === "chips") {
    return (
      <div className={`profile-details-chips ${className}`.trim()} aria-label="Profile highlights">
        {rows.map(({ label, value }) => (
          <div key={label} className="profile-details-chip">
            <span className="profile-details-chip__value">{value}</span>
            <span className="profile-details-chip__label">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className={`profile-details-list ${className}`.trim()}>
      {rows.map(({ label, value }) => (
        <div key={label} className="profile-details-list__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
