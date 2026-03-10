import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Shuffle, ArrowLeft, Heart } from "lucide-react";
import { getArtist, getAlbum, getCoverArtUrl, star, unstar } from "../services/subsonic";
import type { Artist as ArtistType, Album } from "../services/subsonic";
import AlbumCard from "../components/AlbumCard";
import { usePlayer } from "../contexts/PlayerContext";

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playAlbum } = usePlayer();
  const [artist, setArtist] = useState<(ArtistType & { album: Album[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getArtist(id)
      .then(res => { setArtist(res.artist); setStarred(!!res.artist.starred); })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = async () => {
    if (!artist?.album?.length) return;
    const songs = [];
    for (const album of artist.album.slice(0, 5)) {
      try {
        const full = await getAlbum(album.id);
        if (full.song) songs.push(...full.song);
      } catch {}
    }
    if (songs.length) playAlbum(songs);
  };

  const handlePlayAlbum = async (album: Album) => {
    const full = await getAlbum(album.id);
    if (full.song?.length) playAlbum(full.song);
  };

  const handleStar = async () => {
    if (!artist) return;
    if (starred) { await unstar(artist.id); setStarred(false); }
    else { await star(artist.id); setStarred(true); }
  };

  const coverUrl = artist?.coverArt ? getCoverArtUrl(artist.coverArt, 600) : "";

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!artist) return (
    <div className="flex items-center justify-center h-full">
      <p style={{ color: "#b3b3b3" }}>Artist not found</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="relative h-56 overflow-hidden" style={{ background: "#181818" }}>
        {coverUrl && <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
        <div className="relative px-6 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
        <div className="absolute bottom-6 left-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#b3b3b3" }}>Artist</p>
          <h1 className="text-5xl font-bold text-white">{artist.name}</h1>
        </div>
      </div>

      <div className="px-6 pb-8">
        {/* Controls */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            style={{ background: "#FA243C" }}
          >
            <Play size={24} fill="white" className="text-white" style={{ marginLeft: 3 }} />
          </button>
          <button
            onClick={handleStar}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: starred ? "#FA243C" : "#b3b3b3" }}
          >
            <Heart size={22} fill={starred ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Albums */}
        {artist.album && artist.album.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {artist.album.map(a => (
                <AlbumCard key={a.id} album={a} onPlay={handlePlayAlbum} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
