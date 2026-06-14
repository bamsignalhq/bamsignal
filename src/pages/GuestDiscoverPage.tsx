import { SignalsAroundNigeria } from "../components/visual/SignalsAroundNigeria";

type GuestDiscoverPageProps = {
  onJoin: () => void;
};

export function GuestDiscoverPage({ onJoin }: GuestDiscoverPageProps) {
  return (
    <div className="page guest-discover-page visual-page">
      <SignalsAroundNigeria onGuestAction={onJoin} />
    </div>
  );
}
