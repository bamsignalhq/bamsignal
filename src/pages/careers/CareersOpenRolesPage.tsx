import { CareersOpenRolesPage as CareersOpenRoles } from "../../components/careers/CareersOpenRolesPage";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersOpenRolesPageProps = Omit<CareersPageShellProps, "children">;

export function CareersOpenRolesPage(props: CareersOpenRolesPageProps) {
  return (
    <CareersPageShell {...props}>
      <CareersOpenRoles />
    </CareersPageShell>
  );
}
