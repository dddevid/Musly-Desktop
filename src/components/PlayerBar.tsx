import React, { useRef, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, ListMusic, Mic2, Heart, MoreHorizontal
} from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { getCachedCoverArtUrl } from "../services/subsonic";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    currentSong, isPlaying, volume, progress, duration,
    shuffle, repeat, togglePlay, next, prev, seek, setVolume,
    toggleShuffle, toggleRepeat, showQueue, setShowQueue, showLyrics, setShowLyrics,
  } = usePlayer();

  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  }, [duration, seek]);

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const coverUrl = currentSong?.coverArt ? getCachedCoverArtUrl(currentSong.coverArt, 256) : "";

  return (
    <div
      className="flex items-center px-6 flex-shrink-0"
      style={{
        height: 90,
        background: "#181818",
        borderTop: "1px solid #282828",
      }}
    >
      {/* Left: Track info */}
      <div className="flex items-center gap-3 min-w-0" style={{ flex: 1 }}>
        {currentSong ? (
          <>
            <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "#282828" }}>
              {coverUrl ? (
                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart size={20} style={{ color: "#6b7280" }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
              <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>{currentSong.artist}</p>
            </div>
            <button className="ml-2 transition-colors hover:text-white flex-shrink-0" style={{ color: "#6b7280" }}>
              <Heart size={16} />
            </button>
          </>
        ) : (
          <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: "#282828" }} />
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex flex-col items-center gap-2 flex-1" style={{ maxWidth: 500 }}>
        {/* Buttons */}
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className="transition-colors"
            style={{ color: shuffle ? "#FA243C" : "#b3b3b3" }}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button onClick={prev} className="text-white/60 hover:text-white transition-colors">
            <SkipBack size={22} />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: "#fff" }}
          >
            {isPlaying ? (
              <Pause size={18} className="text-black fill-black" />
            ) : (
              <Play size={18} className="text-black fill-black" style={{ marginLeft: 2 }} />
            )}
          </button>
          <button onClick={next} className="text-white/60 hover:text-white transition-colors">
            <SkipForward size={22} />
          </button>
          <button
            onClick={toggleRepeat}
            className="transition-colors"
            style={{ color: repeat !== "off" ? "#FA243C" : "#b3b3b3" }}
            title={`Repeat: ${repeat}`}
          >
            {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs w-10 text-right" style={{ color: "#b3b3b3" }}>{formatTime(progress)}</span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 rounded-full cursor-pointer group relative"
            style={{ background: "#4a4a4a" }}
          >
            <div
              className="h-full rounded-full transition-all relative"
              style={{ width: `${progressPct}%`, background: "#fff" }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity -mr-1.5" />
            </div>
          </div>
          <span className="text-xs w-10" style={{ color: "#b3b3b3" }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume + extras */}
      <div className="flex items-center gap-3 justify-end" style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className="transition-colors hidden sm:block"
          style={{ color: showLyrics ? "#FA243C" : "#6b7280" }}
          title="Lyrics"
        >
          <Mic2 size={18} />
        </button>
        <button
          onClick={() => setShowQueue(!showQueue)}
          className="transition-colors"
          style={{ color: showQueue ? "#FA243C" : "#6b7280" }}
          title="Queue"
        >
          <ListMusic size={18} />
        </button>
        <div className="flex items-center gap-2" style={{ width: 160 }}>
          <button onClick={() => setVolume(volume > 0 ? 0 : 1)} style={{ color: "#6b7280" }} className="hover:text-white transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="flex-1 h-1 rounded-full relative group" style={{ background: "#4a4a4a" }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
            <div className="h-full rounded-full" style={{ width: `${volume * 100}%`, background: "#fff", pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
