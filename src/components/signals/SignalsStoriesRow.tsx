import { Heart } from "lucide-react";
import type { LikeEntry } from "../../types";

type SignalsStoriesRowProps = {
  signals: LikeEntry[];
  activeId: string | "all";
  onSelect: (id: string | "all") => void;
};

export function SignalsStoriesRow({ signals, activeId, onSelect }: SignalsStoriesRowProps) {
  const people = signals.slice(0, 8);

  return (
    <div className="signals-premium-stories" aria-label="Signal stories">
      <div className="signals-premium-stories__scroll">
        <button
          type="button"
          className={`signals-premium-stories__item${activeId === "all" ? " signals-premium-stories__item--active" : ""}`}
          onClick={() => onSelect("all")}
        >
          <span className="signals-premium-stories__ring signals-premium-stories__ring--all">
            <span className="signals-premium-stories__all-icon" aria-hidden>
              <Heart size={22} fill="currentColor" />
            </span>
            {signals.length > 0 ? (
              <span className="signals-premium-stories__count">{signals.length > 12 ? "12+" : signals.length}</span>
            ) : null}
          </span>
          <span className="signals-premium-stories__label">All likes</span>
        </button>

        {people.map((entry) => (
          <button
            key={entry.id || entry.profileId}
            type="button"
            className={`signals-premium-stories__item${
              activeId === entry.profileId ? " signals-premium-stories__item--active" : ""
            }`}
            onClick={() => onSelect(entry.profileId)}
          >
            <span className="signals-premium-stories__ring">
              <img src={entry.photo} alt="" loading="lazy" decoding="async" />
              <span className="signals-premium-stories__dot" aria-hidden />
            </span>
            <span className="signals-premium-stories__label">{entry.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
