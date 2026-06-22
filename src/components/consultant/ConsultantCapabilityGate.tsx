import type { ConsultantCapability } from "../../constants/consultantPermissions";
import { hasConsultantCapability } from "../../utils/consultantSession";

type ConsultantCapabilityGateProps = {
  capability: ConsultantCapability | ConsultantCapability[];
  title: string;
  children: React.ReactNode;
};

function isAllowed(capability: ConsultantCapability | ConsultantCapability[]): boolean {
  if (Array.isArray(capability)) {
    return capability.some((item) => hasConsultantCapability(item));
  }
  return hasConsultantCapability(capability);
}

export function ConsultantCapabilityGate({ capability, title, children }: ConsultantCapabilityGateProps) {
  if (!isAllowed(capability)) {
    return (
      <div className="consultant-capability-gate">
        <h2>{title}</h2>
        <p>Your consultant role does not include access to this workspace section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
