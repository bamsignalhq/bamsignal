type DiscoverPremiumNudgeProps = {
  onUpgrade: () => void;
};

export function DiscoverPremiumNudge({ onUpgrade }: DiscoverPremiumNudgeProps) {
  return (
    <aside className="discover-premium-nudge card">
      <button type="button" className="btn-secondary btn-full" onClick={onUpgrade}>
        Upgrade
      </button>
    </aside>
  );
}
