import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { getLyricsBySongId, getLyrics, getCachedCoverArtUrl } from "../services/subsonic";

interface ParsedLine {
  time: number; // ms
  text: string;
}

function parseLrc(text: string): ParsedLine[] {
  const result: ParsedLine[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const timePattern = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;
    const times: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = timePattern.exec(line)) !== null) {
      const ms = parseInt(m[1]) * 60000 + parseInt(m[2]) * 1000 + parseInt(m[3].padEnd(3, "0"));
      times.push(ms);
    }
    const txt = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, "").trim();
    if (times.length > 0 && txt) {
      for (const t of times) result.push({ time: t, text: txt });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

export default function LyricsPanel() {
  const { currentSong, progress, setShowLyrics } = usePlayer();
  const [lines, setLines] = useState<ParsedLine[]>([]);
  const [plainText, setPlainText] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // progress is in seconds → ms
  const progressMs = progress * 1000;

  // Find active line index (last line whose time ≤ progressMs)
  let activeIndex = -1;
  if (synced && lines.length > 0) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= progressMs) activeIndex = i;
      else break;
    }
  }

  // Load lyrics when song changes
  useEffect(() => {
    if (!currentSong) { setLines([]); setPlainText(null); setSynced(false); return; }
    setLines([]);
    setPlainText(null);
    setSynced(false);
    setLoading(true);
    lineRefs.current = [];

    (async () => {
      try {
        // Try structured lyrics first (Navidrome ≥ 0.49.3 / API 1.27.0+)
        const structured = await getLyricsBySongId(currentSong.id);
        const synced_ = structured.find(l => l.synced && l.line?.length);
        const plain_ = structured.find(l => !l.synced && l.line?.length);

        if (synced_) {
          setLines(
            synced_.line
              .filter(l => l.value?.trim())
              .map(l => ({ time: l.start ?? 0, text: l.value }))
          );
          setSynced(true);
          return;
        }
        if (plain_) {
          setPlainText(plain_.line.map(l => l.value).join("\n"));
          return;
        }
      } catch { /* fall through */ }

      // Fallback: getLyrics (may be LRC-formatted or plain)
      try {
        const result = await getLyrics(currentSong.artist ?? "", currentSong.title);
        if (result.value) {
          const parsed = parseLrc(result.value);
          if (parsed.length > 2) {
            setLines(parsed);
            setSynced(true);
          } else {
            setPlainText(result.value);
          }
        }
      } catch { /* ignore */ }
    })().finally(() => setLoading(false));
  }, [currentSong?.id]);

  // Auto-scroll: keep active line centered
  useEffect(() => {
    const el = lineRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const target = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
    if (Math.abs(elRect.top - contRect.top - container.clientHeight / 2 + el.offsetHeight / 2) > 40) {
      container.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [activeIndex]);

  const coverUrl = currentSong?.coverArt ? getCachedCoverArtUrl(currentSong.coverArt, 400) : "";

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ width: 380, minWidth: 380, background: "#080808" }}
    >
      {/* Blurred album art background */}
      {coverUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(70px) saturate(1.8) brightness(0.5)",
            transform: "scale(1.3)",
            opacity: 0.5,
          }}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.6)" }} />

      {/* Top gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        style={{ height: 90, background: "linear-gradient(to bottom, #080808 30%, transparent)" }}
      />

      {/* Close button */}
      <button
        onClick={() => setShowLyrics(false)}
        className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <X size={16} />
      </button>

      {/* Lyrics scroll area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto z-10"
        style={{ scrollbarWidth: "none", paddingTop: 100, paddingBottom: 100 }}
      >
        {/* No song */}
        {!currentSong && (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>Play a song</p>
          </div>
        )}

        {/* Loading */}
        {currentSong && loading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.7)" }} />
          </div>
        )}

        {/* Synced lyrics — Spicy Lyrics style */}
        {!loading && synced && lines.length > 0 && (
          <div className="px-8 pb-4">
            {lines.map((line, i) => {
              const distance = i - activeIndex;
              const isActive = i === activeIndex;
              const isPast = distance < 0;

              let opacity: number;
              if (isActive) opacity = 1;
              else if (Math.abs(distance) === 1) opacity = 0.4;
              else if (Math.abs(distance) === 2) opacity = 0.22;
              else opacity = 0.12;

              const fontSize = isActive ? 28 : Math.abs(distance) === 1 ? 22 : 18;
              const mb = isActive ? 28 : 14;

              return (
                <div
                  key={i}
                  ref={el => { lineRefs.current[i] = el; }}
                  className="font-black leading-tight cursor-default select-none"
                  style={{
                    color: "#fff",
                    opacity,
                    fontSize,
                    marginBottom: mb,
                    transform: isActive ? "scale(1)" : "scale(0.95)",
                    transformOrigin: "left center",
                    transition: "opacity 0.4s ease, font-size 0.4s ease, transform 0.4s ease",
                    filter: isActive ? "none" : "blur(0.3px)",
                    willChange: "opacity, transform",
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}

        {/* Unsynced / plain lyrics */}
        {!loading && !synced && plainText && (
          <div className="px-8 pb-4">
            {plainText.split("\n").map((line, i) => {
              const empty = !line.trim();
              return (
                <p
                  key={i}
                  className="font-bold leading-snug"
                  style={{
                    fontSize: 20,
                    color: "#fff",
                    opacity: empty ? 0 : 0.75,
                    marginBottom: empty ? 16 : 10,
                  }}
                >
                  {line || "\u00a0"}
                </p>
              );
            })}
          </div>
        )}

        {/* No lyrics available */}
        {!loading && !synced && !plainText && lines.length === 0 && currentSong && (
          <div className="flex items-center justify-center h-full">
            <p className="text-base font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>No lyrics available</p>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-[72px] left-0 right-0 z-20 pointer-events-none"
        style={{ height: 90, background: "linear-gradient(to top, #080808 30%, transparent)" }}
      />

      {/* Song info footer */}
      {currentSong && (
        <div
          className="relative z-30 flex-shrink-0 flex items-center gap-3 px-5 pb-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {coverUrl && (
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{currentSong.artist}</p>
          </div>
          {synced && (
            <div
              className="ml-auto flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold tracking-wider"
              style={{ background: "rgba(250,36,60,0.18)", color: "#FA243C" }}
            >
              SYNC
            </div>
          )}
        </div>
      )}
    </div>
  );
}
