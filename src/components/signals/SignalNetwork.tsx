import { useEffect, useState } from "react";
import { AppLogo } from "../AppLogo";
import { SignalRipple } from "../signals/SignalRipple";
import { SignalWave } from "../signals/SignalWave";
import { HERO_ACTIVITIES } from "../../data/signalWorld";

type SignalNetworkProps = {
  onGetStarted: () => void;
  onExplore: () => void;
};

/** Abstract Nigeria-inspired network — nodes + connection lines + radar */
const NETWORK_NODES = [
  { id: "lagos", x: 22, y: 78 },
  { id: "abuja", x: 48, y: 42 },
  { id: "ph", x: 62, y: 68 },
  { id: "enugu", x: 58, y: 55 },
  { id: "kano", x: 44, y: 18 },
  { id: "benin", x: 36, y: 62 }
] as const;

const NETWORK_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [0, 3],
  [4, 1],
  [5, 0],
  [2, 3]
];

export function SignalNetwork({ onGetStarted, onExplore }: SignalNetworkProps) {
  const [activityIndex, setActivityIndex] = useState(0);
  const [activityVisible, setActivityVisible] = useState(true);
  const [emit, setEmit] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActivityVisible(false);
      window.setTimeout(() => {
        setActivityIndex((i) => (i + 1) % HERO_ACTIVITIES.length);
        setActivityVisible(true);
      }, 380);
    }, 3000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setEmit((n) => n + 1), 3200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="signal-network">
      <svg className="signal-network__canvas" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="sn-radar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#673ab7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sn-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0" />
            <stop offset="50%" stopColor="#e91e8c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9c27b0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle className="signal-network__radar-fill" cx="50" cy="50" r="42" fill="url(#sn-radar)" />
        <circle className="signal-network__radar" cx="50" cy="50" r="38" />
        {NETWORK_LINKS.map(([a, b], i) => {
          const n1 = NETWORK_NODES[a];
          const n2 = NETWORK_NODES[b];
          return (
            <line
              key={i}
              className="signal-network__link"
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              style={{ animationDelay: `${i * 0.45}s` }}
            />
          );
        })}
        {NETWORK_NODES.map((node, i) => (
          <g key={node.id} className="signal-network__node" style={{ animationDelay: `${i * 0.3}s` }}>
            <circle className="signal-network__node-glow" cx={node.x} cy={node.y} r="2.2" />
            <circle className="signal-network__node-core" cx={node.x} cy={node.y} r="1.1" />
          </g>
        ))}
      </svg>

      <div className="signal-network__content">
        <div className="signal-network__emitter">
          {emit > 0 && <SignalRipple key={emit} active className="signal-network__ripple" />}
          <SignalWave active className="signal-network__waves" />
          <AppLogo size="lg" showText={false} className="signal-network__logo" />
        </div>

        <p className={`signal-network__activity ${activityVisible ? "signal-network__activity--in" : ""}`}>
          {HERO_ACTIVITIES[activityIndex]}
        </p>

        <h1 className="signal-network__headline">The right connection starts with a signal.</h1>

        <div className="signal-network__cta">
          <button type="button" className="world-btn-primary" onClick={onGetStarted}>
            Get Started
          </button>
          <button type="button" className="world-btn-ghost" onClick={onExplore}>
            Explore Signals
          </button>
        </div>
      </div>
    </section>
  );
}
