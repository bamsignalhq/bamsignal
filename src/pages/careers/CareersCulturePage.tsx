import { CareersCulturePage as CareersCulture } from "../../components/careers/CareersCulturePage";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersCulturePageProps = Omit<CareersPageShellProps, "children">;

export function CareersCulturePage(props: CareersCulturePageProps) {
  return (
    <CareersPageShell {...props}>
      <CareersCulture />
    </CareersPageShell>
  );
}
