import { useState } from "react";
import { ShowcaseImage } from "../ShowcaseImage";
import type { SignalMoment } from "../../constants/signalMoments";

type SignalMomentsProps = {
  moments: SignalMoment[];
};

export function SignalMoments({ moments }: SignalMomentsProps) {
  const [preview, setPreview] = useState<SignalMoment | null>(null);

  if (!moments.length) return null;

  return (
    <div className="signal-moments">
      <p className="signal-moments__label">Signal Moments</p>
      <div className="signal-moments__chips">
        {moments.map((moment) => (
          <button
            key={moment.id}
            type="button"
            className={`signal-moments__chip ${preview?.id === moment.id ? "active" : ""}`}
            onClick={() => setPreview(preview?.id === moment.id ? null : moment)}
          >
            <ShowcaseImage src={moment.image} alt="" className="signal-moments__chip-img" />
            <span>{moment.label}</span>
          </button>
        ))}
      </div>
      {preview && (
        <figure className="signal-moments__preview">
          <ShowcaseImage src={preview.image} alt={preview.label} />
          <figcaption>{preview.label}</figcaption>
        </figure>
      )}
    </div>
  );
}
