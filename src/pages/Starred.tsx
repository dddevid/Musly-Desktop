import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { getStarred, getAlbum } from "../services/subsonic";
import type { Song, Album, Artist } from "../services/subsonic";
import TrackRow from "../components/TrackRow";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import { usePlayer } from "../contexts/PlayerContext";
import { Heart } from "lucide-react";

export default function Starred() {
  const { playAlbum } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStarred()
      .then(res => {
        setSongs(res.song || []);
        setAlbums(res.album || []);
        setArtists(res.artist || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePlayAll = () => {
    if (songs.length) playAlbum(songs);
  };

  const handlePlayAlbum = async (album: Album) => {
    const full = await getAlbum(album.id);
    if (full.song?.length) playAlbum(full.song);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isEmpty = !songs.length && !albums.length && !artists.length;

  return (
    <div className="px-6 py-6 pb-8">
      {/* Header */}
      <div
        className="rounded-2xl p-8 mb-8 flex items-end gap-6"
        style={{ background: "#1a1a1a" }}
      >
        <div className="w-40 h-40 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.3)" }}>
          <Heart size={60} fill="#FA243C" style={{ color: "#FA243C" }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#FC5C65" }}>Collection</p>
          <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
          <p className="text-sm" style={{ color: "#b3b3b3" }}>{songs.length} songs</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto mb-4" style={{ color: "#4b5563" }} />
          <p className="text-lg font-semibold text-white mb-2">Nothing here yet</p>
          <p className="text-sm" style={{ color: "#6b7280" }}>Star songs, albums, and artists to see them here</p>
        </div>
      ) : (
        <>
          {/* Play button */}
          {songs.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ background: "#FA243C" }}
              >
                <Play size={24} fill="white" className="text-white" style={{ marginLeft: 3 }} />
              </button>
            </div>
          )}

          {/* Songs */}
          {songs.length > 0 && (
            <section className="mb-8">
              {songs.map((song, i) => (
                <TrackRow key={song.id} song={song} index={i} queue={songs} showAlbum />
              ))}
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Liked Albums</h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                {albums.map(a => <AlbumCard key={a.id} album={a} onPlay={handlePlayAlbum} />)}
              </div>
            </section>
          )}

          {/* Artists */}
          {artists.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Liked Artists</h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
