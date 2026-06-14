import { Flame, Sparkles, ShieldCheck, Zap } from "lucide-react";
import type { DiscoverProfile } from "../../types";
import { ShowcaseImage } from "../ShowcaseImage";
import { isOnlineNow } from "../../utils/activity";

type DiscoverTrendingProps = {
  active: DiscoverProfile[];
  verified: DiscoverProfile[];
  newMembers: DiscoverProfile[];
  onSelect: (profile: DiscoverProfile) => void;
};

function TrendingRow({
  title,
  icon: Icon,
  profiles,
  onSelect
}: {
  title: string;
  icon: typeof Flame;
  profiles: DiscoverProfile[];
  onSelect: (p: DiscoverProfile) => void;
}) {
  if (!profiles.length) return null;

  return (
    <section className="discover-trending-row">
      <h3>
        <Icon size={18} /> {title}
      </h3>
      <div className="discover-trending-scroll">
        {profiles.map((p) => (
          <button key={p.id} type="button" className="discover-trending-card" onClick={() => onSelect(p)}>
            <ShowcaseImage src={p.photo} alt={p.name} />
            <div className="discover-trending-card__meta">
              <strong>{p.name}</strong>
              <span>
                {p.city}
                {isOnlineNow(p.lastActiveAt) && " · 🟢"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function DiscoverTrending({ active, verified, newMembers, onSelect }: DiscoverTrendingProps) {
  return (
    <div className="discover-trending">
      <TrendingRow title="Most active" icon={Flame} profiles={active} onSelect={onSelect} />
      <TrendingRow title="New members" icon={Sparkles} profiles={newMembers} onSelect={onSelect} />
      <TrendingRow title="Verified" icon={ShieldCheck} profiles={verified} onSelect={onSelect} />
      {!active.length && !verified.length && !newMembers.length && (
        <p className="discover-trending-empty">Trending signals will appear as more people join your city.</p>
      )}
    </div>
  );
}
