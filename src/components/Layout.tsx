import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import PlayerBar from "./PlayerBar";
import QueuePanel from "./QueuePanel";
import LyricsPanel from "./LyricsPanel";
import { usePlayer } from "../contexts/PlayerContext";

export default function Layout() {
  const { showQueue, showLyrics } = usePlayer();

  return (
    <div className="flex flex-col h-full" style={{ background: "#121212" }}>
      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        {/* Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
        {/* Side panels */}
        {showLyrics && <LyricsPanel />}
        {showQueue && !showLyrics && <QueuePanel />}
      </div>
      {/* Player bar */}
      <PlayerBar />
    </div>
  );
}
