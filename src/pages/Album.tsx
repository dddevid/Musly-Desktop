import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Shuffle, ArrowLeft, Heart, Clock } from "lucide-react";
import { getAlbum, getCoverArtUrl, star, unstar } from "../services/subsonic";
import type { Album as AlbumType, Song } from "../services/subsonic";
import TrackRow from "../components/TrackRow";
import { usePlayer } from "../contexts/PlayerContext";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playAlbum } = usePlayer();
  const [album, setAlbum] = useState<(AlbumType & { song: Song[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAlbum(id)
      .then(a => { setAlbum(a); setStarred(!!a.starred); })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlay = (startIndex = 0) => {
    if (album?.song?.length) playAlbum(album.song, startIndex);
  };

  const handleShuffle = () => {
    if (album?.song?.length) {
      const shuffled = [...album.song].sort(() => Math.random() - 0.5);
      playAlbum(shuffled);
    }
  };

  const handleStar = async () => {
    if (!album) return;
    if (starred) { await unstar(album.id); setStarred(false); }
    else { await star(album.id); setStarred(true); }
  };

  const coverUrl = album?.coverArt ? getCoverArtUrl(album.coverArt, 600) : "";
  const totalDuration = album?.song?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!album) return (
    <div className="flex items-center justify-center h-full">
      <p style={{ color: "#b3b3b3" }}>Album not found</p>
    </div>
  );

  return (
    <div>
      {/* Header with gradient */}
      <div className="relative" style={{ background: "#181818" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "#FA243C" }} />
        <div className="relative px-6 pt-6 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-end gap-6">
            <div className="w-48 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0" style={{ background: "#282828" }}>
              {coverUrl ? <img src={coverUrl} alt={album.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">🎵</div>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#b3b3b3" }}>Album</p>
              <h1 className="text-4xl font-bold text-white mb-2">{album.name}</h1>
              <div className="flex items-center gap-1 text-sm" style={{ color: "#b3b3b3" }}>
                <span className="font-medium text-white">{album.artist}</span>
                {album.year && <><span>·</span><span>{album.year}</span></>}
                <span>·</span>
                <span>{album.song?.length || 0} songs</span>
                {totalDuration > 0 && <><span>·</span><span>{formatDuration(totalDuration)}</span></>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        {/* Controls */}
        <div className="flex items-center gap-4 mb-6 pt-2">
          <button
            onClick={() => handlePlay()}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            style={{ background: "#FA243C" }}
          >
            <Play size={24} fill="white" className="text-white" style={{ marginLeft: 3 }} />
          </button>
          <button
            onClick={handleShuffle}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "#b3b3b3" }}
          >
            <Shuffle size={22} />
          </button>
          <button
            onClick={handleStar}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: starred ? "#FA243C" : "#b3b3b3" }}
          >
            <Heart size={22} fill={starred ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Track list header */}
        <div className="flex items-center gap-3 px-4 mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "#6b7280", borderBottom: "1px solid #282828", paddingBottom: 8 }}>
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Title</span>
          <Clock size={14} />
        </div>

        {/* Tracks */}
        {album.song?.map((song, i) => (
          <TrackRow key={song.id} song={song} index={i} queue={album.song} />
        ))}
      </div>
    </div>
  );
}
