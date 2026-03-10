import React, { useEffect, useState, useRef } from "react";
import { X, Play, Trash2, Music } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { getCachedCoverArtUrl } from "../services/subsonic";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QueuePanel() {
  const { queue, currentIndex, currentSong, playAtIndex, removeFromQueue, setShowQueue } = usePlayer();

  return (
    <div
      className="flex flex-col h-full"
      style={{ width: 320, minWidth: 320, background: "#121212", borderLeft: "1px solid #282828" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #282828" }}>
        <h3 className="text-base font-bold text-white">Queue</h3>
        <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Now playing */}
      {currentSong && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b7280" }}>Now Playing</p>
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            {currentSong.coverArt && (
              <img src={getCachedCoverArtUrl(currentSong.coverArt, 128)} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#FC5C65" }}>{currentSong.title}</p>
              <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {queue.length > 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider px-2 pt-4 pb-2" style={{ color: "#6b7280" }}>
              Next Up · {queue.length - currentIndex - 1} songs
            </p>
            {queue.slice(currentIndex + 1).map((song, i) => {
              const realIndex = currentIndex + 1 + i;
              return (
                <div
                  key={`${song.id}-${realIndex}`}
                  className="group flex items-center gap-3 px-2 py-2 rounded-lg cursor-default hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded flex-shrink-0 overflow-hidden" style={{ background: "#282828" }}>
                    {song.coverArt && <img src={getCachedCoverArtUrl(song.coverArt, 128)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>{song.artist}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => playAtIndex(realIndex)} className="p-1 text-gray-400 hover:text-white">
                      <Play size={14} />
                    </button>
                    <button onClick={() => removeFromQueue(realIndex)} className="p-1 text-gray-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Music size={32} className="mb-3" style={{ color: "#4b5563" }} />
            <p className="text-sm" style={{ color: "#6b7280" }}>Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
