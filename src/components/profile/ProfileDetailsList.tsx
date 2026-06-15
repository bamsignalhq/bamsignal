import { getFilledProfileDetails } from "../../utils/profileDetails";
import type { DatingProfile, DiscoverProfile } from "../../types";

type ProfileDetailsListProps = {
  profile: Pick<
    DatingProfile | DiscoverProfile,
    "ethnicity" | "religion" | "occupation" | "stateOfOrigin" | "genotype" | "kidsPreference"
  >;
  className?: string;
};

export function ProfileDetailsList({ profile, className = "" }: ProfileDetailsListProps) {
  const rows = getFilledProfileDetails(profile);
  if (!rows.length) return null;

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
