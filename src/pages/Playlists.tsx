import React, { useEffect, useState } from "react";
import { Play, Plus, Trash2, ListMusic } from "lucide-react";
import { getPlaylists, getPlaylist, deletePlaylist, createPlaylist } from "../services/subsonic";
import type { Playlist, PlaylistWithSongs } from "../services/subsonic";
import TrackRow from "../components/TrackRow";
import { usePlayer } from "../contexts/PlayerContext";
import { getCoverArtUrl } from "../services/subsonic";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<PlaylistWithSongs | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const { playAlbum } = usePlayer();

  const load = () => {
    setLoading(true);
    getPlaylists().then(setPlaylists).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelect = async (pl: Playlist) => {
    const full = await getPlaylist(pl.id);
    setSelected(full);
  };

  const handlePlay = () => {
    if (selected?.entry?.length) playAlbum(selected.entry);
  };

  const handleDelete = async (pl: Playlist) => {
    await deletePlaylist(pl.id);
    if (selected?.id === pl.id) setSelected(null);
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    setNewName("");
    setCreating(false);
    load();
  };

  return (
    <div className="flex h-full">
      {/* Playlists sidebar */}
      <div className="flex flex-col flex-shrink-0 overflow-y-auto py-6 pl-6 pr-4" style={{ width: 260 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Playlists</h2>
          <button
            onClick={() => setCreating(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "#b3b3b3" }}
            title="New playlist"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <form onSubmit={handleCreate} className="mb-4">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none mb-2"
              style={{ background: "#282828", border: "1px solid #3a3a3a" }}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-1.5 rounded text-xs font-semibold" style={{ background: "#FA243C", color: "white" }}>Create</button>
              <button type="button" onClick={() => setCreating(false)} className="flex-1 py-1.5 rounded text-xs font-semibold" style={{ background: "#282828", color: "#b3b3b3" }}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <ListMusic size={32} className="mb-2" style={{ color: "#4b5563" }} />
            <p className="text-sm" style={{ color: "#6b7280" }}>No playlists yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlists.map(pl => (
              <div
                key={pl.id}
                onClick={() => handleSelect(pl)}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: selected?.id === pl.id ? "rgba(139,92,246,0.15)" : "transparent" }}
                onMouseEnter={e => { if (selected?.id !== pl.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (selected?.id !== pl.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "#282828" }}>
                  {pl.coverArt ? (
                    <img src={getCoverArtUrl(pl.coverArt, 128)} alt="" className="w-full h-full object-cover" />
                  ) : <ListMusic size={16} style={{ color: "#6b7280" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: selected?.id === pl.id ? "#FC5C65" : "#fff" }}>{pl.name}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{pl.songCount || 0} songs</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(pl); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:text-red-400"
                  style={{ color: "#6b7280" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist detail */}
      <div className="flex-1 overflow-y-auto py-6 pr-6">
        {selected ? (
          <>
            <div className="flex items-end gap-6 mb-8">
              <div className="w-40 h-40 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "#282828" }}>
                {selected.coverArt ? (
                  <img src={getCoverArtUrl(selected.coverArt, 160)} alt="" className="w-full h-full object-cover" />
                ) : <ListMusic size={40} style={{ color: "#4b5563" }} />}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#b3b3b3" }}>Playlist</p>
                <h1 className="text-4xl font-bold text-white mb-2">{selected.name}</h1>
                {selected.comment && <p className="text-sm mb-2" style={{ color: "#b3b3b3" }}>{selected.comment}</p>}
                <p className="text-sm" style={{ color: "#b3b3b3" }}>{selected.entry?.length || 0} songs</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ background: "#FA243C" }}
              >
                <Play size={24} fill="white" className="text-white" style={{ marginLeft: 3 }} />
              </button>
            </div>

            {/* Tracks */}
            <div>
              {selected.entry?.map((song, i) => (
                <TrackRow key={`${song.id}-${i}`} song={song} index={i} queue={selected.entry} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ListMusic size={48} className="mb-4" style={{ color: "#4b5563" }} />
            <p className="text-lg font-semibold text-white mb-2">Select a playlist</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Choose a playlist from the sidebar to view its tracks</p>
          </div>
        )}
      </div>
    </div>
  );
}
