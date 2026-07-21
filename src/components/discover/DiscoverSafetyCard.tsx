import { MemberSafetyRow } from "../member";

type DiscoverSafetyCardProps = {
  onClick?: () => void;
};

export function DiscoverSafetyCard({ onClick }: DiscoverSafetyCardProps) {
  return <MemberSafetyRow variant="discover" onClick={onClick} />;
}
