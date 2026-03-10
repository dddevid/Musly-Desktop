import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Song } from "../services/subsonic";
import { getStreamUrl, getCoverArtUrl, scrobble } from "../services/subsonic";
import { recommendationService } from "../services/RecommendationService";
import { transcodingService } from "../services/TranscodingService";

export type RepeatMode = "off" | "one" | "all";

interface PlayerState {
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  showQueue: boolean;
  showLyrics: boolean;
}

interface PlayerActions {
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  playAlbum: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  playAtIndex: (index: number) => void;
  setShowQueue: (v: boolean) => void;
  setShowLyrics: (v: boolean) => void;
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const scrobbledRef = useRef(false);

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Init audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setProgress(audio.currentTime);
      // Scrobble at 50% playback
      if (!scrobbledRef.current && audio.duration > 0 && audio.currentTime / audio.duration > 0.5) {
        scrobbledRef.current = true;
        const src = audio.src;
        const idMatch = src.match(/[?&]id=([^&]+)/);
        if (idMatch) scrobble(idMatch[1], true).catch(() => {});
      }
    });
    audio.addEventListener("durationchange", () => setDuration(audio.duration || 0));
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => handleEnded());

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const handleEnded = useCallback(() => {
    setQueue(q => {
      setCurrentIndex(idx => {
        // Track completed play
        if (q[idx]) {
          recommendationService.trackSongPlay(q[idx], Math.round(audioRef.current?.duration ?? 0), true);
        }
        setRepeat(rep => {
          if (rep === "one") {
            audioRef.current?.play().catch(() => {});
          } else if (rep === "all" || idx < q.length - 1) {
            const next = idx < q.length - 1 ? idx + 1 : 0;
            loadSong(q[next], audioRef.current!);
            setCurrentIndex(next);
          } else {
            setIsPlaying(false);
          }
          return rep;
        });
        return idx;
      });
      return q;
    });
  }, []);

  function loadSong(song: Song, audio: HTMLAudioElement) {
    scrobbledRef.current = false;
    const url = getStreamUrl(
      song.id,
      transcodingService.getCurrentBitrate(),
      transcodingService.getCurrentFormat()
    );
    audio.src = url;
    audio.play().catch(() => {});
    // Scrobble "now playing"
    scrobble(song.id, false).catch(() => {});
  }

  const playSong = useCallback((song: Song, newQueue?: Song[], index?: number) => {
    const q = newQueue || [song];
    const i = index !== undefined ? index : 0;
    setQueue(q);
    setCurrentIndex(i);
    if (audioRef.current) {
      loadSong(q[i], audioRef.current);
    }
  }, []);

  const playAlbum = useCallback((songs: Song[], startIndex = 0) => {
    setQueue(songs);
    setCurrentIndex(startIndex);
    if (audioRef.current) {
      loadSong(songs[startIndex], audioRef.current);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    setQueue(q => {
      setCurrentIndex(idx => {
        if (q.length === 0) return idx;
        // Track manual skip
        if (q[idx]) {
          recommendationService.trackSongPlay(q[idx], Math.round(audioRef.current?.currentTime ?? 0), false);
          recommendationService.trackSkip(q[idx]);
        }
        let nextIdx: number;
        if (shuffle) {
          nextIdx = Math.floor(Math.random() * q.length);
        } else {
          nextIdx = idx < q.length - 1 ? idx + 1 : 0;
        }
        if (audioRef.current) loadSong(q[nextIdx], audioRef.current);
        return nextIdx;
      });
      return q;
    });
  }, [shuffle]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // If more than 3s into song, restart
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setQueue(q => {
      setCurrentIndex(idx => {
        const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
        if (audioRef.current) loadSong(q[prevIdx], audioRef.current);
        return prevIdx;
      });
      return q;
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off");
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue(q => [...q, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(q => {
      const newQ = q.filter((_, i) => i !== index);
      setCurrentIndex(idx => idx > index ? idx - 1 : idx);
      return newQ;
    });
  }, []);

  const playAtIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setQueue(q => {
      if (audioRef.current && q[index]) loadSong(q[index], audioRef.current);
      return q;
    });
  }, []);

  return (
    <PlayerContext.Provider value={{
      queue, currentIndex, currentSong, isPlaying, volume, progress, duration,
      shuffle, repeat, showQueue, showLyrics,
      playSong, playAlbum, togglePlay, next, prev, seek, setVolume,
      toggleShuffle, toggleRepeat, addToQueue, removeFromQueue, playAtIndex,
      setShowQueue, setShowLyrics,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
