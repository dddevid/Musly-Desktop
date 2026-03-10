import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArtists, getAlbumList } from "../services/subsonic";
import type { Artist, Album } from "../services/subsonic";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import { getAlbum } from "../services/subsonic";
import { usePlayer } from "../contexts/PlayerContext";

type Tab = "albums" | "artists";

export default function Library() {
  const [tab, setTab] = useState<Tab>("albums");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const { playAlbum } = usePlayer();

  useEffect(() => {
    setLoading(true);
    if (tab === "artists") {
      getArtists()
        .then(data => {
          const all: Artist[] = data.index.flatMap(i => i.artist || []);
          setArtists(all);
        })
        .finally(() => setLoading(false));
    } else {
      getAlbumList("alphabeticalByName", 100)
        .then(setAlbums)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const handlePlayAlbum = async (album: Album) => {
    const full = await getAlbum(album.id);
    if (full.song?.length) playAlbum(full.song);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "albums", label: "Albums" },
    { id: "artists", label: "Artists" },
  ];

  return (
    <div className="px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "#fff" : "rgba(255,255,255,0.1)",
              color: tab === t.id ? "#000" : "#fff",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "albums" ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {albums.map(a => <AlbumCard key={a.id} album={a} onPlay={handlePlayAlbum} />)}
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
        </div>
      )}
    </div>
  );
}
