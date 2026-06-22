import { CareersRolePage as CareersRole } from "../../components/careers/CareersRolePage";
import { getCareerRoleBySlug } from "../../utils/careersLogic";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersRolePageProps = Omit<CareersPageShellProps, "children"> & {
  roleSlug: string;
};

export function CareersRolePage({ roleSlug, ...props }: CareersRolePageProps) {
  const role = getCareerRoleBySlug(roleSlug);
  if (!role) return null;

  return (
    <CareersPageShell {...props}>
      <CareersRole role={role} />
    </CareersPageShell>
  );
}
