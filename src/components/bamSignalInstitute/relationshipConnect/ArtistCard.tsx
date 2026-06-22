import { ARTIST_LABEL } from "../../../constants/relationshipConnect";
import type { ArtistViewModel } from "../../../utils/relationshipConnectLogic";

type ArtistCardProps = {
  artist: ArtistViewModel;
};

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <article className="rconn-artist-card institute-glass">
      <header className="rconn-artist-card__head">
        <h3>{artist.title}</h3>
        <span className="rconn-artist-card__badge">{ARTIST_LABEL}</span>
      </header>
      <p className="rconn-artist-card__description">{artist.description}</p>
      <p className="rconn-artist-card__status">{artist.statusLabel}</p>
    </article>
  );
}
