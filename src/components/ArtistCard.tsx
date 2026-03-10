import React from "react";
import { useNavigate } from "react-router-dom";
import type { Artist } from "../services/subsonic";
import { getCachedCoverArtUrl } from "../services/subsonic";

interface Props {
  artist: Artist;
}

export default function ArtistCard({ artist }: Props) {
  const navigate = useNavigate();
  const coverUrl = artist.coverArt ? getCachedCoverArtUrl(artist.coverArt, 500) : "";

  return (
    <div
      className="group cursor-pointer text-center"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative mx-auto mb-3 rounded-full overflow-hidden" style={{ width: "100%", aspectRatio: "1", background: "#282828" }}>
        {coverUrl ? (
          <img src={coverUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎤</div>
        )}
      </div>
      <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
      <p className="text-xs" style={{ color: "#b3b3b3" }}>
        {artist.albumCount ? `${artist.albumCount} albums` : "Artist"}
      </p>
    </div>
  );
}
