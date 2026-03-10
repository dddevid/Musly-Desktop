import React, { useRef, useState } from "react";
import { Play, MoreHorizontal, Heart, ListPlus } from "lucide-react";
import type { Song } from "../services/subsonic";
import { getCachedCoverArtUrl } from "../services/subsonic";
import { usePlayer } from "../contexts/PlayerContext";
import AddToPlaylistModal from "./AddToPlaylistModal";

interface Props {
  song: Song;
  index?: number;
  queue?: Song[];
  showIndex?: boolean;
  showAlbum?: boolean;
  compact?: boolean;
}

function formatDuration(s?: number): string {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackRow({ song, index, queue, showIndex = true, showAlbum = false, compact = false }: Props) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const coverUrl = song.coverArt ? getCachedCoverArtUrl(song.coverArt, 128) : "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handlePlay = () => {
    playSong(song, queue || [song], queue ? queue.indexOf(song) : 0);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) { setMenuRect(rect); setMenuOpen(true); }
  };

  return (
    <div
      onDoubleClick={handlePlay}
      className="group flex items-center gap-3 px-4 py-2 rounded-lg cursor-default transition-colors hover:bg-white/5"
      style={{ background: isActive ? "rgba(139,92,246,0.1)" : undefined }}
    >
      {/* Index / Play */}
      {showIndex && (
        <div className="w-8 flex-shrink-0 flex items-center justify-center">
          <span className="text-sm group-hover:hidden" style={{ color: isActive ? "#FA243C" : "#b3b3b3" }}>
            {isActive && isPlaying ? "▶" : (index !== undefined ? index + 1 : "")}
          </span>
          <button onClick={handlePlay} className="hidden group-hover:block text-white">
            <Play size={14} fill="currentColor" />
          </button>
        </div>
      )}

      {/* Cover (only if not showing index to save space) */}
      {!showIndex && (
        <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden" style={{ background: "#282828" }}>
          {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-red-400" : "text-white"}`}>
          {song.title}
        </p>
        {!compact && (
          <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>
            {song.artist}{showAlbum && song.album ? ` · ${song.album}` : ""}
          </p>
        )}
      </div>

      {/* Duration */}
      <span className="text-xs flex-shrink-0" style={{ color: "#6b7280" }}>
        {formatDuration(song.duration)}
      </span>

      {/* Three-dot menu */}
      <button
        ref={btnRef}
        onClick={handleMenuClick}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded transition-all hover:text-white"
        style={{ color: "#6b7280" }}
        title="More options"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && menuRect && (
        <AddToPlaylistModal
          song={song}
          anchorRect={menuRect}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
