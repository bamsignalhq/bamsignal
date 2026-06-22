import type { CenturyTrustCardViewModel } from "../../../types/centuryTrust";

type CenturyTrustCardProps = {
  layer: CenturyTrustCardViewModel;
};

export function CenturyTrustCard({ layer }: CenturyTrustCardProps) {
  return (
    <article className="ctrust-layer-card institute-glass">
      <header className="ctrust-layer-card__head">
        <h3>{layer.title}</h3>
        <span className="ctrust-layer-card__badge">{layer.layerLabel}</span>
      </header>
      <p className="ctrust-layer-card__order">Layer {layer.layerOrder}</p>
      <p className="ctrust-layer-card__description">{layer.description}</p>
      <p className="ctrust-layer-card__status">{layer.statusLabel}</p>
    </article>
  );
}
