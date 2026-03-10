import React, { useEffect, useRef, useState } from "react";
import { ListMusic, Plus, Check } from "lucide-react";
import { getPlaylists, updatePlaylist } from "../services/subsonic";
import type { Playlist, Song } from "../services/subsonic";

interface Props {
  song: Song;
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function AddToPlaylistModal({ song, anchorRect, onClose }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPlaylists().then(setPlaylists).finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const handleAdd = async (pl: Playlist) => {
    await updatePlaylist(pl.id, [song.id]);
    setAdded(pl.id);
    setTimeout(onClose, 700);
  };

  // Position the dropdown so it doesn't overflow the window
  const menuWidth = 220;
  const menuMaxHeight = 280;
  let left = anchorRect.right - menuWidth;
  let top = anchorRect.bottom + 4;
  if (left < 8) left = 8;
  if (top + menuMaxHeight > window.innerHeight - 8) top = anchorRect.top - menuMaxHeight - 4;

  return (
    <div
      ref={ref}
      className="fixed z-50 rounded-xl overflow-hidden shadow-2xl"
      style={{
        left,
        top,
        width: menuWidth,
        background: "#282828",
        border: "1px solid #3a3a3a",
      }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "#3a3a3a" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#b3b3b3" }}>
          Add to playlist
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="px-3 py-4 text-center">
          <p className="text-xs" style={{ color: "#6b7280" }}>No playlists</p>
        </div>
      ) : (
        <div style={{ maxHeight: menuMaxHeight, overflowY: "auto" }}>
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => handleAdd(pl)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
              disabled={added !== null}
            >
              <ListMusic size={14} style={{ color: "#b3b3b3", flexShrink: 0 }} />
              <span className="flex-1 text-sm text-white truncate">{pl.name}</span>
              {added === pl.id && <Check size={14} style={{ color: "#FA243C", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
