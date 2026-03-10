import React, { useEffect, useState } from "react";
import { Play, Shuffle } from "lucide-react";
import AlbumCard from "../components/AlbumCard";
import { getAlbumList, getAlbum, getRandomSongs, getCoverArtUrl } from "../services/subsonic";
import type { Album, Song } from "../services/subsonic";
import { usePlayer } from "../contexts/PlayerContext";
import { useRecommendation } from "../contexts/RecommendationContext";

const sections = [
  { key: "recent", label: "Recently Played" },
  { key: "newest", label: "New Releases" },
  { key: "frequent", label: "Most Played" },
  { key: "random", label: "Discover" },
] as const;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { playAlbum, playSong } = usePlayer();
  const { generateMixes } = useRecommendation();
  const [albums, setAlbums] = useState<Record<string, Album[]>>({});
  const [loading, setLoading] = useState(true);
  const [songPool, setSongPool] = useState<Song[]>([]);
  const [mixes, setMixes] = useState<Record<string, Song[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          getAlbumList("recent", 12),
          getAlbumList("newest", 12),
          getAlbumList("frequent", 12),
          getAlbumList("random", 12),
          getRandomSongs(200),
        ]);
        const [recent, newest, frequent, random, rand] = results;
        setAlbums({
          recent: recent.status === "fulfilled" ? recent.value : [],
          newest: newest.status === "fulfilled" ? newest.value : [],
          frequent: frequent.status === "fulfilled" ? frequent.value : [],
          random: random.status === "fulfilled" ? random.value : [],
        });
        if (rand.status === "fulfilled") {
          const songs = rand.value;
          setSongPool(songs);
          setMixes(generateMixes(songs));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePlayAlbum = async (album: Album) => {
    try {
      const full = await getAlbum(album.id);
      if (full.song?.length) playAlbum(full.song);
    } catch {}
  };

  const handleShuffleMix = () => {
    if (songPool.length) {
      const shuffled = [...songPool].sort(() => Math.random() - 0.5);
      playAlbum(shuffled);
    }
  };

  return (
    <div className="px-6 py-6 pb-8">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
        <button
          onClick={handleShuffleMix}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#FA243C", color: "white" }}
        >
          <Shuffle size={16} />
          Shuffle Mix
        </button>
      </div>

      {/* Recommendation mixes (shown when listening data exists) */}
      {Object.keys(mixes).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">For You</h2>
          {Object.entries(mixes).map(([mixName, songs]) => (
            <div key={mixName} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{mixName}</h3>
                <button
                  onClick={() => playAlbum(songs)}
                  className="text-xs font-medium transition-colors hover:text-white"
                  style={{ color: "#FA243C" }}
                >
                  Play all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {songs.slice(0, 12).map((song, i) => (
                  <div
                    key={song.id}
                    className="flex-shrink-0 w-36 cursor-pointer group"
                    onClick={() => playSong(song, songs, i)}
                  >
                    <div className="w-36 h-36 rounded-lg overflow-hidden mb-2 relative" style={{ background: "#282828" }}>
                      {song.coverArt ? (
                        <img
                          src={getCoverArtUrl(song.coverArt, 400)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); playSong(song, songs, i); }}
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex"
                        style={{ background: "#FA243C" }}
                      >
                        <Play size={16} fill="white" className="text-white" style={{ marginLeft: 1 }} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#b3b3b3" }}>{song.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick picks from recent albums */}
      {albums.recent && albums.recent.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {albums.recent.slice(0, 6).map(album => (
              <div
                key={album.id}
                className="group flex items-center gap-0 rounded-lg overflow-hidden cursor-pointer transition-colors h-16"
                style={{ background: "#242424" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={e => (e.currentTarget.style.background = "#242424")}
                onClick={() => handlePlayAlbum(album)}
              >
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden" style={{ background: "#3a3a3a" }}>
                  {album.coverArt && (
                    <img
                      src={getCoverArtUrl(album.coverArt, 256)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  {!album.coverArt && <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>}
                </div>
                <div className="flex-1 min-w-0 pl-4 pr-2">
                  <p className="text-sm font-semibold text-white truncate">{album.name}</p>
                  <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>{album.artist}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handlePlayAlbum(album); }}
                  className="mr-3 w-9 h-9 rounded-full items-center justify-center flex-shrink-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex"
                  style={{ background: "#FA243C" }}
                >
                  <Play size={16} fill="white" className="text-white" style={{ marginLeft: 1 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Album sections */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        sections.map(({ key, label }) => {
          const list = albums[key] || [];
          if (!list.length) return null;
          return (
            <section key={key} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{label}</h2>
                <button className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
                  Show all
                </button>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                {list.slice(0, 8).map(album => (
                  <AlbumCard key={album.id} album={album} onPlay={handlePlayAlbum} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
