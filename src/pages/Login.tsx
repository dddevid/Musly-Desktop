import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Server, User, Lock, Wifi, EyeOff, Eye } from "lucide-react";
import muslyIcon from "../assets/icon.png";

export default function Login() {
  const { login } = useAuth();
  const [serverUrl, setServerUrl] = useState("https://");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [legacyAuth, setLegacyAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl || !username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await login({ serverUrl: serverUrl.trim(), username: username.trim(), password, legacyAuth });
      if (!ok) setError("Connection failed. Check your server URL and credentials.");
    } catch (err) {
      setError("Connection error. Make sure the server is reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center" style={{ background: "#0d0d0d" }}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src={muslyIcon} alt="Musly" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-contain" />
          <h1 className="text-4xl font-bold text-white mb-1">Musly</h1>
          <p className="text-sm" style={{ color: "#FC5C65" }}>Desktop Music Player</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl font-semibold text-white mb-6">Connect to your server</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#b3b3b3" }}>
                Server URL
              </label>
              <div className="relative">
                <Server size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7280" }} />
                <input
                  type="url"
                  value={serverUrl}
                  onChange={e => setServerUrl(e.target.value)}
                  placeholder="https://your-server.com"
                  className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:ring-2 transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", "--tw-ring-color": "#FA243C" } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#b3b3b3" }}>Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7280" }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:ring-2 transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", "--tw-ring-color": "#FA243C" } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#b3b3b3" }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7280" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg pl-9 pr-10 py-2.5 text-sm text-white outline-none focus:ring-2 transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", "--tw-ring-color": "#FA243C" } as React.CSSProperties}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white" style={{ color: "#6b7280" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Legacy Auth */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={legacyAuth} onChange={e => setLegacyAuth(e.target.checked)} />
                <div className="w-10 h-5 rounded-full transition-colors" style={{ background: legacyAuth ? "#FA243C" : "rgba(255,255,255,0.1)" }} />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: legacyAuth ? "translateX(20px)" : "translateX(0)" }} />
              </div>
              <span className="text-sm" style={{ color: "#b3b3b3" }}>Legacy Authentication</span>
            </label>

            {/* Error */}
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            {/* Connect button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all mt-2 flex items-center justify-center gap-2"
              style={{ background: loading ? "#333" : "#FA243C", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Wifi size={16} className="animate-pulse" />
                  Connecting...
                </>
              ) : "Connect"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4b5563" }}>
          Compatible with Navidrome · Subsonic · Airsonic · Gonic
        </p>
      </div>
    </div>
  );
}
