import { useState } from "react";
import { Zap } from "lucide-react";
import { BamEffect } from "./BamEffect";
import { SignalNode } from "./SignalNode";
import { SignalWave } from "./SignalWave";
import { AppLogo } from "../AppLogo";
import { VerifiedBadge } from "../VerifiedBadge";
import { NEARBY_SIGNAL_NODES } from "../../data/signalWorld";

type NearbySignalNodesProps = {
  onGuestAction: () => void;
};

export function NearbySignalNodes({ onGuestAction }: NearbySignalNodesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "firing" | "sent">("idle");
  const [sentOnce, setSentOnce] = useState(false);

  const selected = NEARBY_SIGNAL_NODES.find((n) => n.id === selectedId) ?? null;

  const sendSignal = () => {
    if (!selected || phase !== "idle") return;
    setPhase("firing");
    window.setTimeout(() => {
      setPhase("sent");
      window.setTimeout(() => {
        setPhase("idle");
        setSelectedId(null);
        if (!sentOnce) {
          setSentOnce(true);
          onGuestAction();
        }
      }, 1600);
    }, 850);
  };

  return (
    <section className="nearby-signals" id="nearby-signals">
      <h2 className="world-section-title">Nearby Signals</h2>

      <div className="nearby-signals__field">
        {NEARBY_SIGNAL_NODES.map((node) => (
          <SignalNode
            key={node.id}
            label={node.name}
            sublabel={node.distance}
            photo={node.photo}
            selected={selectedId === node.id}
            active={selectedId !== node.id || phase === "idle"}
            onClick={() => phase === "idle" && setSelectedId(node.id)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          />
        ))}

        {selected && (
          <div className={`nearby-signals__panel ${phase === "sent" ? "nearby-signals__panel--sent" : ""}`}>
            <div className={`nearby-signals__panel-logo ${phase === "firing" ? "nearby-signals__panel-logo--pulse" : ""}`}>
              <AppLogo size="sm" showText={false} />
            </div>
            <div className="nearby-signals__panel-photo">
              <img src={selected.photo} alt="" />
              <div className="nearby-signals__panel-shade" />
              <div className="nearby-signals__panel-meta">
                <h3>
                  {selected.name}
                  <VerifiedBadge size="sm" />
                </h3>
                <span>{selected.age}</span>
                <span>{selected.distance}</span>
              </div>
            </div>
            {phase === "sent" ? (
              <div className="nearby-signals__success">
                <Zap size={18} fill="currentColor" /> Signal Sent
              </div>
            ) : (
              <div className="nearby-signals__actions">
                <button type="button" className="world-btn-ignore" onClick={() => setSelectedId(null)}>
                  Ignore
                </button>
                <button type="button" className="world-btn-signal" onClick={sendSignal} disabled={phase !== "idle"}>
                  <Zap size={18} fill="currentColor" /> Send Signal
                </button>
              </div>
            )}
            <BamEffect active={phase === "firing"} variant="send" />
            {phase === "firing" && <SignalWave active className="nearby-signals__waves" />}
          </div>
        )}
      </div>
    </section>
  );
}
