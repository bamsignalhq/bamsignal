import type { CSSProperties } from "react";
import { SignalPulse } from "./SignalPulse";

type SignalNodeProps = {
  label: string;
  sublabel?: string;
  photo?: string;
  active?: boolean;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
};

export function SignalNode({
  label,
  sublabel,
  photo,
  active = true,
  selected = false,
  onClick,
  style
}: SignalNodeProps) {
  return (
    <button
      type="button"
      className={`signal-node ${selected ? "signal-node--selected" : ""} ${active ? "signal-node--live" : ""}`}
      onClick={onClick}
      style={style}
    >
      {active && <SignalPulse size={56} className="signal-node__pulse" />}
      <span className="signal-node__body">
        {photo ? <img src={photo} alt="" className="signal-node__avatar" /> : <span className="signal-node__dot" />}
        <span className="signal-node__label">{label}</span>
        {sublabel && <span className="signal-node__sub">{sublabel}</span>}
      </span>
    </button>
  );
}
