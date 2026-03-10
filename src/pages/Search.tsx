import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Play, Music, Disc, Users } from "lucide-react";
import { search, getAlbum, getCoverArtUrl } from "../services/subsonic";
import type { SearchResult, Album, Artist, Song } from "../services/subsonic";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import TrackRow from "../components/TrackRow";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

const GENRES = [
  { name: "Rock", color: "#b91c1c", emoji: "🎸" },
  { name: "Pop", color: "#be185d", emoji: "🎤" },
  { name: "Hip-Hop", color: "#b45309", emoji: "🎧" },
  { name: "Electronic", color: "#0e7490", emoji: "🎛️" },
  { name: "Jazz", color: "#065f46", emoji: "🎷" },
  { name: "Classical", color: "#1e40af", emoji: "🎻" },
  { name: "Metal", color: "#1f2937", emoji: "🤘" },
  { name: "Folk", color: "#166534", emoji: "🪕" },
  { name: "R&B", color: "#6b21a8", emoji: "🎙️" },
  { name: "Country", color: "#92400e", emoji: "🤠" },
  { name: "Reggae", color: "#15803d", emoji: "🌴" },
  { name: "Blues", color: "#1e3a8a", emoji: "🎹" },
  { name: "Soul", color: "#9f1239", emoji: "✨" },
  { name: "Punk", color: "#374151", emoji: "⚡" },
  { name: "Latin", color: "#c2410c", emoji: "💃" },
  { name: "Indie", color: "#5b21b6", emoji: "🌀" },
];

type FilterTab = "all" | "songs" | "artists" | "albums";

function formatDuration(s?: number): string {
  if (!s) return "";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ── Top Result Card ─────────────────────────────────────── */
function TopResultCard({ results, onPlayAlbum }: { results: SearchResult; onPlayAlbum: (a: Album) => void }) {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const topArtist: Artist | undefined = results.artist?.[0];
  const topAlbum: Album | undefined = results.album?.[0];
  const topSong: Song | undefined = results.song?.[0];

  // pick the "best" top result: artist > album > song
  if (topArtist) {
    const cover = topArtist.coverArt ? getCoverArtUrl(topArtist.coverArt, 400) : "";
    return (
      <div
        className="group relative rounded-xl p-5 cursor-pointer transition-colors"
        style={{ background: "#181818" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#282828")}
        onMouseLeave={e => (e.currentTarget.style.background = "#181818")}
        onClick={() => navigate(`/artist/${topArtist.id}`)}
      >
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-xl" style={{ background: "#333" }}>
          {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🎤</div>}
        </div>
        <p className="text-2xl font-black text-white mb-1 truncate">{topArtist.name}</p>
        <p className="text-sm font-medium" style={{ color: "#b3b3b3" }}>Artist{topArtist.albumCount ? ` · ${topArtist.albumCount} albums` : ""}</p>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/artist/${topArtist.id}`); }}
          className="absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
          style={{ background: "#FA243C" }}
        >
          <Play size={20} fill="white" className="text-white" style={{ marginLeft: 2 }} />
        </button>
      </div>
    );
  }

  if (topAlbum) {
    const cover = topAlbum.coverArt ? getCoverArtUrl(topAlbum.coverArt, 400) : "";
    return (
      <div
        className="group relative rounded-xl p-5 cursor-pointer transition-colors"
        style={{ background: "#181818" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#282828")}
        onMouseLeave={e => (e.currentTarget.style.background = "#181818")}
        onClick={() => navigate(`/album/${topAlbum.id}`)}
      >
        <div className="w-24 h-24 rounded-lg overflow-hidden mb-4 shadow-xl" style={{ background: "#333" }}>
          {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>}
        </div>
        <p className="text-2xl font-black text-white mb-1 truncate">{topAlbum.name}</p>
        <p className="text-sm font-medium" style={{ color: "#b3b3b3" }}>Album · {topAlbum.artist}</p>
        <button
          onClick={e => { e.stopPropagation(); onPlayAlbum(topAlbum); }}
          className="absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
          style={{ background: "#FA243C" }}
        >
          <Play size={20} fill="white" className="text-white" style={{ marginLeft: 2 }} />
        </button>
      </div>
    );
  }

  if (topSong) {
    const cover = topSong.coverArt ? getCoverArtUrl(topSong.coverArt, 400) : "";
    return (
      <div
        className="group relative rounded-xl p-5 cursor-pointer transition-colors"
        style={{ background: "#181818" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#282828")}
        onMouseLeave={e => (e.currentTarget.style.background = "#181818")}
        onClick={() => playSong(topSong, results.song ?? [topSong], 0)}
      >
        <div className="w-24 h-24 rounded-lg overflow-hidden mb-4 shadow-xl" style={{ background: "#333" }}>
          {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>}
        </div>
        <p className="text-2xl font-black text-white mb-1 truncate">{topSong.title}</p>
        <p className="text-sm font-medium" style={{ color: "#b3b3b3" }}>Song · {topSong.artist}</p>
        <button
          onClick={e => { e.stopPropagation(); playSong(topSong, results.song ?? [topSong], 0); }}
          className="absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
          style={{ background: "#FA243C" }}
        >
          <Play size={20} fill="white" className="text-white" style={{ marginLeft: 2 }} />
        </button>
      </div>
    );
  }

  return null;
}

/* ── Main Search Page ────────────────────────────────────── */
export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<FilterTab>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playAlbum, playSong } = usePlayer();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults(null); setTab("all"); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await search(query.trim());
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handlePlayAlbum = async (album: Album) => {
    try {
      const full = await getAlbum(album.id);
      if (full.song?.length) playAlbum(full.song);
    } catch {}
  };

  const totalResults = (results?.artist?.length ?? 0) + (results?.album?.length ?? 0) + (results?.song?.length ?? 0);
  const hasResults = totalResults > 0;

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "all", label: "All", icon: <SearchIcon size={14} />, count: totalResults },
    { key: "songs", label: "Songs", icon: <Music size={14} />, count: results?.song?.length ?? 0 },
    { key: "artists", label: "Artists", icon: <Users size={14} />, count: results?.artist?.length ?? 0 },
    { key: "albums", label: "Albums", icon: <Disc size={14} />, count: results?.album?.length ?? 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* ── Search bar ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4" style={{ background: "#121212" }}>
        <div className="relative" style={{ maxWidth: 680 }}>
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Artists, songs, albums…"
            className="w-full rounded-full pl-12 pr-12 py-3.5 text-white font-medium outline-none transition-all"
            style={{
              background: "#242424",
              border: "2px solid transparent",
              fontSize: 15,
            }}
            onFocus={e => (e.target.style.border = "2px solid #FA243C")}
            onBlur={e => (e.target.style.border = "2px solid transparent")}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
              style={{ color: "#6b7280" }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter tabs (shown only when there are results) */}
        {results && hasResults && (
          <div className="flex gap-2 mt-4">
            {tabs.filter(t => t.key === "all" || t.count > 0).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? "#FA243C" : "#242424",
                  color: tab === t.key ? "white" : "#b3b3b3",
                }}
              >
                {t.icon}
                {t.label}
                {t.key !== "all" && <span className="ml-0.5 opacity-70 text-xs">({t.count})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Browse (no query) */}
        {!query && !loading && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 mt-2">Browse by genre</h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
              {GENRES.map(genre => (
                <div
                  key={genre.name}
                  className="relative h-24 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform select-none"
                  style={{ background: genre.color }}
                  onClick={() => setQuery(genre.name)}
                >
                  <span className="absolute inset-0 flex items-center pl-5 text-white font-bold text-base">{genre.name}</span>
                  <span className="absolute right-4 bottom-3 text-3xl drop-shadow-lg">{genre.emoji}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No results */}
        {!loading && results && !hasResults && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#282828" }}>
              <SearchIcon size={32} style={{ color: "#6b7280" }} />
            </div>
            <p className="text-xl font-bold text-white mb-2">No results for "{query}"</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Try different keywords or check the spelling</p>
          </div>
        )}

        {/* Results — All tab */}
        {!loading && results && hasResults && tab === "all" && (
          <>
            {/* Top result + top songs side by side */}
            <div className="grid gap-4 mt-2 mb-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* Top result */}
              <div>
                <h2 className="text-lg font-bold text-white mb-3">Top result</h2>
                <TopResultCard results={results} onPlayAlbum={handlePlayAlbum} />
              </div>

              {/* Top songs quick-list */}
              {results.song && results.song.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">Songs</h2>
                  <div className="space-y-1">
                    {results.song.slice(0, 5).map((song, i) => {
                      const cover = song.coverArt ? getCoverArtUrl(song.coverArt, 128) : "";
                      return (
                        <div
                          key={song.id}
                          className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                          onDoubleClick={() => playSong(song, results.song!, i)}
                        >
                          <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden relative" style={{ background: "#333" }}>
                            {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>}
                            <button
                              onClick={() => playSong(song, results.song!, i)}
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Play size={14} fill="white" className="text-white" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{song.title}</p>
                            <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>{song.artist}</p>
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "#6b7280" }}>{formatDuration(song.duration)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Artists */}
            {results.artist && results.artist.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Artists</h2>
                  {results.artist.length > 5 && (
                    <button onClick={() => setTab("artists")} className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
                      See all ({results.artist.length})
                    </button>
                  )}
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                  {results.artist.slice(0, 6).map(a => (
                    <ArtistCard key={a.id} artist={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {results.album && results.album.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Albums</h2>
                  {results.album.length > 6 && (
                    <button onClick={() => setTab("albums")} className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
                      See all ({results.album.length})
                    </button>
                  )}
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                  {results.album.slice(0, 6).map(a => (
                    <AlbumCard key={a.id} album={a} onPlay={handlePlayAlbum} />
                  ))}
                </div>
              </section>
            )}

            {/* All songs */}
            {results.song && results.song.length > 5 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">All songs</h2>
                  {results.song.length > 10 && (
                    <button onClick={() => setTab("songs")} className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "#b3b3b3" }}>
                      See all ({results.song.length})
                    </button>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: "#181818" }}>
                  {results.song.slice(0, 10).map((song, i) => (
                    <TrackRow key={song.id} song={song} index={i} queue={results.song!} showAlbum />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Songs tab */}
        {!loading && results && tab === "songs" && results.song && results.song.length > 0 && (
          <section className="mt-2">
            <div className="rounded-xl overflow-hidden" style={{ background: "#181818" }}>
              {results.song.map((song, i) => (
                <TrackRow key={song.id} song={song} index={i} queue={results.song!} showAlbum />
              ))}
            </div>
          </section>
        )}

        {/* Artists tab */}
        {!loading && results && tab === "artists" && results.artist && results.artist.length > 0 && (
          <section className="mt-2">
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
              {results.artist.map(a => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          </section>
        )}

        {/* Albums tab */}
        {!loading && results && tab === "albums" && results.album && results.album.length > 0 && (
          <section className="mt-2">
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {results.album.map(a => (
                <AlbumCard key={a.id} album={a} onPlay={handlePlayAlbum} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
