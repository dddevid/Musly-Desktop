import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Library, ListMusic, Heart, LogOut, Settings } from "lucide-react";
import muslyIcon from "../assets/icon.png";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/library", icon: Library, label: "Library" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const libraryItems = [
  { to: "/playlists", icon: ListMusic, label: "Playlists" },
  { to: "/starred", icon: Heart, label: "Liked Songs" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full" style={{ width: 240, minWidth: 240, background: "#000", borderRight: "1px solid #1a1a1a" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <img src={muslyIcon} alt="Musly" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
        <span className="text-white font-bold text-lg">Musly</span>
      </div>

      {/* Main nav */}
      <nav className="px-3 mb-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 mb-4" style={{ height: 1, background: "#1a1a1a" }} />

      {/* Library section */}
      <div className="px-6 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Your Library</span>
      </div>
      <nav className="px-3 flex-1 overflow-y-auto">
        {libraryItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm font-medium transition-all text-gray-400 hover:text-white"
        >
          <LogOut size={20} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
