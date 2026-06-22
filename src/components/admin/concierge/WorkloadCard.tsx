import type { WorkloadProfile } from "../../../types/consultantAssignment";
import { ConsultantWorkloadCard } from "./ConsultantWorkloadCard";

type WorkloadCardProps = {
  workload: WorkloadProfile;
  title?: string;
};

/** @deprecated prefer ConsultantWorkloadCard */
export function WorkloadCard({ workload, title = "Workload status" }: WorkloadCardProps) {
  return <ConsultantWorkloadCard workload={workload} title={title} />;
}
