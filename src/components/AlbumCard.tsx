import React from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Album } from "../services/subsonic";
import { getCachedCoverArtUrl } from "../services/subsonic";

interface Props {
  album: Album;
  onPlay?: (album: Album) => void;
}

export default function AlbumCard({ album, onPlay }: Props) {
  const navigate = useNavigate();
  const coverUrl = album.coverArt ? getCachedCoverArtUrl(album.coverArt, 500) : "";

  return (
    <div
      className="group cursor-pointer rounded-xl p-3 transition-colors"
      style={{ background: "#181818" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#282828")}
      onMouseLeave={e => (e.currentTarget.style.background = "#181818")}
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="relative mb-3 rounded-lg overflow-hidden" style={{ aspectRatio: "1", background: "#282828" }}>
        {coverUrl ? (
          <img src={coverUrl} alt={album.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
        )}
        {/* Play button overlay */}
        <button
          onClick={e => { e.stopPropagation(); onPlay?.(album); }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
          style={{ background: "#FA243C" }}
        >
          <Play size={18} fill="white" className="text-white" style={{ marginLeft: 2 }} />
        </button>
      </div>
      <p className="text-sm font-semibold text-white truncate mb-0.5">{album.name}</p>
      <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>
        {album.artist}{album.year ? ` · ${album.year}` : ""}
      </p>
    </div>
  );
}
