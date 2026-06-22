import { CertificatesPage } from "../../components/bamSignalInstitute/relationshipCertificates/CertificatesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipCertificatesPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteRelationshipCertificatesPage(
  props: BamSignalInstituteRelationshipCertificatesPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <CertificatesPage />
    </BamSignalInstitutePageShell>
  );
}
