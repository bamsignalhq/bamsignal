import { Zap } from "lucide-react";
import type { DiscoverProfile, RadarNode } from "../types";

type SignalRadarProps = {
  nodes: RadarNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function SignalRadar({ nodes, selectedId, onSelect }: SignalRadarProps) {
  return (
    <section className="signal-radar" aria-label="Nearby Signals">
      <div className="signal-radar__ring signal-radar__ring--outer" />
      <div className="signal-radar__ring signal-radar__ring--mid" />
      <div className="signal-radar__ring signal-radar__ring--inner" />
      <div className="signal-radar__sweep" aria-hidden />
      <div className="signal-radar__center">
        <Zap size={18} fill="currentColor" />
      </div>
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`signal-radar__node ${selectedId === node.id ? "signal-radar__node--active" : ""}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onClick={() => onSelect(node.id)}
          aria-label={`${node.name}, ${node.distanceKm}km away`}
        >
          <img src={node.photo} alt="" />
          <span className="signal-radar__node-label">
            {node.name}
            <small>{node.distanceKm}km</small>
          </span>
        </button>
      ))}
    </section>
  );
}

export function profilesToRadarNodes(profiles: DiscoverProfile[]): RadarNode[] {
  const positions = [
    { x: 28, y: 32 },
    { x: 68, y: 28 },
    { x: 52, y: 62 },
    { x: 22, y: 58 },
    { x: 74, y: 55 },
    { x: 42, y: 38 }
  ];
  return profiles.slice(0, 6).map((p, i) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    distanceKm: p.distanceKm ?? 3 + i * 2,
    photo: p.photo,
    x: positions[i]?.x ?? 50,
    y: positions[i]?.y ?? 50
  }));
}
