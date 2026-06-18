export type SignalsSegment = "all" | "new" | "nearby" | "recent";

type SignalsSegmentTabsProps = {
  active: SignalsSegment;
  counts: Record<SignalsSegment, number>;
  onChange: (segment: SignalsSegment) => void;
};

const TABS: { id: SignalsSegment; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "nearby", label: "Nearby" },
  { id: "recent", label: "Recent" }
];

export function SignalsSegmentTabs({ active, counts, onChange }: SignalsSegmentTabsProps) {
  return (
    <div className="signals-premium-tabs" role="tablist" aria-label="Filter signals">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`signals-premium-tabs__tab${isActive ? " signals-premium-tabs__tab--active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            <span className="signals-premium-tabs__badge">{counts[tab.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
